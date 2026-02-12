const DEBUG = true;
function debug(...args) {
  if (DEBUG) console.log("[Idle Notifier]", ...args);
}

export function registerMonitors(ctx, notifier) {
  const events = ctx.settings.section("Events");
  const general = ctx.settings.section("General");

  // Track window focus; document.hidden only covers tab switches, not "clicked another app"
  let windowFocused = document.hasFocus();
  window.addEventListener("focus", () => {
    windowFocused = true;
  });
  window.addEventListener("blur", () => {
    windowFocused = false;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) windowFocused = false;
    else windowFocused = document.hasFocus();
  });

  function shouldNotify() {
    if (!general.get("only-when-backgrounded")) return true;
    return document.hidden || !windowFocused;
  }

  debug("Registering monitors...", CombatManager);

  // Flag set by onPlayerDeath (HP is reset before clearActiveAction runs)
  let playerJustDied = false;

  // Detect death via onPlayerDeath; clearActiveAction runs after HP is restored
  try {
    ctx.patch(CombatManager, "onPlayerDeath").after(function () {
      if (!events.get("notify-combat-idle") || !shouldNotify()) return;
      playerJustDied = true;
      notifier.send(
        "☠️ You Died!",
        "Your character died and combat has stopped.",
        { isDeath: true },
      );
    });
    debug("CombatManager.onPlayerDeath patch registered");
  } catch (e) {
    console.warn("[Idle Notifier] onPlayerDeath patch failed:", e.message);
  }

  // Single hook: Game.clearActiveAction is called when ANY action (combat or skill) stops
  try {
    ctx.patch(Game, "clearActiveAction").before(function () {
      const action = this.activeAction;
      const actionName = action?.constructor?.name ?? action?.name ?? "Unknown";
      debug("Game.clearActiveAction called, activeAction:", actionName);

      if (!action) return;

      const notify = shouldNotify();
      debug(
        "shouldNotify:",
        notify,
        "(tab hidden:",
        document.hidden,
        ", hasFocus:",
        document.hasFocus(),
        ")",
      );
      if (!notify) return;

      if (action instanceof CombatManager) {
        if (!events.get("notify-combat-idle")) return;
        if (playerJustDied) {
          playerJustDied = false;
          return; // Already notified via onPlayerDeath
        }
        notifier.send("⚔️ Combat Stopped", "You are no longer in combat.");
      } else {
        // Any non-combat action (Skill, Crafting, etc.)
        if (!events.get("notify-skill-idle")) return;
        const skillName = action.name ?? action.constructor?.name ?? "Unknown";
        debug("Sending skill idle notification for:", skillName);
        notifier.send("⛏️ Skill Stopped", `${skillName} is no longer active.`);
      }
    });
    debug("Game.clearActiveAction patch registered");
  } catch (e) {
    console.warn("[Idle Notifier] clearActiveAction patch failed:", e.message);
  }

  debug("Monitors registered.");
}
