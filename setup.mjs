export async function setup(ctx) {
  // Load sub-modules
  const { NotificationManager } = await ctx.loadModule("src/notifications.mjs");
  const { registerMonitors } = await ctx.loadModule("src/monitors.mjs");

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
    },
    {
      type: "button",
      name: "request-notification-permission",
      display: "Enable Browser Notifications",
      hint: "Click to request permission (required for desktop alerts)",
      onClick: () => notifier.requestNotificationPermission(),
    },
    {
      type: "switch",
      name: "sound-alerts",
      label: "Sound Alerts",
      hint: "Play a sound when an event triggers",
      default: false,
    },
    {
      type: "switch",
      name: "in-game-toasts",
      label: "In-Game Toasts",
      hint: "Show a toast message inside the game UI",
      default: true,
    },
    {
      type: "switch",
      name: "only-when-backgrounded",
      label: "Only when not focused",
      hint: "Notify when tab is in background or window has lost focus (e.g. switched to another app)",
      default: true,
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
    },
    {
      type: "switch",
      name: "notify-skill-idle",
      label: "Skill Idle",
      hint: "Notify when a skill stops (e.g. resource depleted, inventory full)",
      default: true,
    },
  ]);

  // ── Lifecycle: Wait for character + UI ────────────────
  ctx.onInterfaceReady(() => {
    notifier.init();
    registerMonitors(ctx, notifier);
    console.log("[Idle Notifier] Active and monitoring.");
  });
}
