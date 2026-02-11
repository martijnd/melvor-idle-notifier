export async function setup(ctx) {
  // Load sub-modules
  const { NotificationManager } = await ctx.loadModule("src/notifications.mjs");
  const { registerMonitors } = await ctx.loadModule("src/monitors.mjs");

  // ── Mod Settings ──────────────────────────────────────
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
  ]);

  const eventsSection = ctx.settings.section("Events");

  eventsSection.add([
    {
      type: "switch",
      name: "notify-combat-death",
      label: "Combat Death / Idle",
      hint: "Notify when combat stops (death or no target)",
      default: true,
    },
    {
      type: "switch",
      name: "notify-skill-milestone",
      label: "Skill Level Milestones",
      hint: "Notify on level ups (e.g., every 10 levels)",
      default: true,
    },
    {
      type: "number",
      name: "milestone-interval",
      label: "Milestone Interval",
      hint: "Notify every N levels (e.g., 5, 10, 25)",
      default: 10,
      min: 1,
      max: 99,
    },
    {
      type: "switch",
      name: "notify-farming-ready",
      label: "Farming Patches Ready",
      hint: "Notify when a farming patch is ready to harvest",
      default: true,
    },
    {
      type: "switch",
      name: "notify-bank-full",
      label: "Bank Nearly Full",
      hint: "Notify when bank slots are almost exhausted",
      default: true,
    },
    {
      type: "number",
      name: "bank-threshold",
      label: "Bank Full Threshold (%)",
      hint: "Trigger when bank is this % full",
      default: 90,
      min: 50,
      max: 100,
    },
    {
      type: "switch",
      name: "notify-potion-expired",
      label: "Potion Charges Depleted",
      hint: "Notify when an active potion runs out",
      default: true,
    },
    {
      type: "switch",
      name: "notify-task-complete",
      label: "Slayer Task Complete",
      hint: "Notify when a slayer task is finished",
      default: true,
    },
  ]);

  // ── Lifecycle: Wait for character + UI ────────────────
  const notifier = new NotificationManager(ctx);

  ctx.onInterfaceReady(() => {
    notifier.init();
    registerMonitors(ctx, notifier);
    console.log("[Idle Notifier] Active and monitoring.");
  });
}
