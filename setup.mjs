const STORAGE_KEY = "idleNotifier:settings";

function toBool(v) {
  if (v === undefined) return undefined;
  return v === true || v === "true";
}

function restoreSettings(ctx) {
  try {
    let data = ctx.accountStorage.getItem(STORAGE_KEY);
    if (
      (!data || typeof data !== "object") &&
      typeof localStorage !== "undefined"
    ) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) data = JSON.parse(raw);
    }
    if (!data || typeof data !== "object") return;

    const general = ctx.settings.section("General");
    const events = ctx.settings.section("Events");
    const settingMap = [
      ["browser-notifications", general],
      ["sound-alerts", general],
      ["only-when-backgrounded", general],
      ["notify-combat-idle", events],
      ["notify-skill-idle", events],
    ];
    for (const [key, section] of settingMap) {
      if (data[key] !== undefined) {
        section.set(key, toBool(data[key]) ?? data[key]);
      }
    }
  } catch (e) {
    console.warn("[Idle Notifier] Failed to restore settings:", e.message);
  }
}

export async function setup(ctx) {
  // Load sub-modules
  const { NotificationManager } = await ctx.loadModule("src/notifications.mjs");
  const { registerMonitors } = await ctx.loadModule("src/monitors.mjs");

  const onChangePersist = (name, value) => {
    console.log("[Idle Notifier] Settings changed:", name, value);
    persistSettings(name, value);
  };

  function persistSettings(name, value) {
    try {
      const general = ctx.settings.section("General");
      const events = ctx.settings.section("Events");
      const data = {
        "browser-notifications": general.get("browser-notifications"),
        "sound-alerts": general.get("sound-alerts"),
        "only-when-backgrounded": general.get("only-when-backgrounded"),
        "notify-combat-idle": events.get("notify-combat-idle"),
        "notify-skill-idle": events.get("notify-skill-idle"),
        [name]: toBool(value),
      };
      ctx.accountStorage.setItem(STORAGE_KEY, data);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn("[Idle Notifier] Failed to persist settings:", e.message);
    }
  }

  // ── Mod Settings ──────────────────────────────────────
  const notifier = new NotificationManager(ctx);
  const generalSection = ctx.settings.section("General");

  generalSection.add([
    {
      type: "switch",
      name: "browser-notifications",
      label: "Browser Notifications",
      hint: "Show desktop push notifications",
      default: true,
      onChange: (value) => onChangePersist("browser-notifications", value),
    },
    {
      type: "button",
      name: "request-notification-permission",
      label: "Enable Browser Notifications",
      display: "Grant permission",
      hint: "Click to request permission (required for desktop alerts)",
      onClick: () => notifier.requestNotificationPermission(),
    },
    {
      type: "switch",
      name: "sound-alerts",
      label: "Sound Alerts",
      hint: "Play a sound when an event triggers",
      default: false,
      onChange: (value) => onChangePersist("sound-alerts", value),
    },
    {
      type: "switch",
      name: "only-when-backgrounded",
      label: "Only when not focused",
      hint: "Notify when tab is in background or window has lost focus (e.g. switched to another app)",
      default: true,
      onChange: (value) => onChangePersist("only-when-backgrounded", value),
    },
  ]);

  const eventsSection = ctx.settings.section("Events");

  eventsSection.add([
    {
      type: "switch",
      name: "notify-combat-idle",
      label: "Combat Idle",
      hint: "Notify when combat stops (death or area cleared)",
      default: true,
      onChange: (value) => onChangePersist("notify-combat-idle", value),
    },
    {
      type: "switch",
      name: "notify-skill-idle",
      label: "Skill Idle",
      hint: "Notify when a skill stops (e.g. resource depleted, inventory full)",
      default: true,
      onChange: (value) => onChangePersist("notify-skill-idle", value),
    },
  ]);

  // ── Lifecycle: Wait for character + UI ────────────────
  ctx.onInterfaceReady(async () => {
    restoreSettings(ctx);
    notifier.init();
    await registerMonitors(ctx, notifier);
    console.log("[Idle Notifier] Active and monitoring.");
  });
}
