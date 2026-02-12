const DEBUG = false;
function debug(...args) {
  if (DEBUG) console.log("[Idle Notifier]", ...args);
}

function debugWarn(...args) {
  if (DEBUG) console.warn("[Idle Notifier]", ...args);
}

export async function registerEventHandlers(ctx, notifier) {
  const { createWindowFocusTracker } = await ctx.loadModule(
    "src/utils/focus.mjs",
  );
  const getWindowFocused = createWindowFocusTracker();

  const events = ctx.settings.section("Events");
  const general = ctx.settings.section("General");

  function shouldNotify() {
    if (!general.get("only-when-backgrounded")) return true;
    return document.hidden || !getWindowFocused();
  }

  debug("Registering event handlers...");

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
    debugWarn("onPlayerDeath patch failed:", e.message);
  }

  // Single hook: Game.clearActiveAction is called when ANY action (combat or skill) stops
  try {
    ctx.patch(Game, "clearActiveAction").before(function () {
      const action = this.activeAction;
      const actionName = action?.constructor?.name ?? action?.name ?? "Unknown";
      debug("Game.clearActiveAction called, activeAction:", actionName);

      if (!action) return;

      const notify = shouldNotify();
      debug({
        shouldNotify: notify,
        tabHidden: document.hidden,
        hasFocus: document.hasFocus(),
      });
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
        const skillName = action.name ?? action.constructor?.name;
        debug("Sending skill idle notification for:", skillName);
        notifier.send(
          "⛏️ Skill Stopped",
          skillName
            ? `${skillName} is no longer active.`
            : "A skill is no longer active.",
        );
      }
    });
    debug("Game.clearActiveAction patch registered");
  } catch (e) {
    debugWarn("clearActiveAction patch failed:", e.message);
  }

  debug("Event handlers registered.");
}
