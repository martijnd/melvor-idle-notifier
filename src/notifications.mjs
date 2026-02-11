export class NotificationManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.settings = ctx.settings;
    this.audioUrl = ctx.getResourceUrl("assets/alert.ogg");
    this.permissionGranted = false;
  }

  init() {
    // Permission must be requested from a user gesture (e.g. button click).
    // Check if we already have permission (e.g. from a previous session).
    if ("Notification" in window && Notification.permission === "granted") {
      this.permissionGranted = true;
    }
  }

  /**
   * Request browser notification permission. Must be called from a user gesture
   * (e.g. button click) — browsers block requestPermission() otherwise.
   */
  requestNotificationPermission() {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then((perm) => {
      this.permissionGranted = perm === "granted";
    });
  }

  /**
   * Send a notification through all enabled channels.
   * @param {string} title - Short headline
   * @param {string} message - Detail text
   */
  send(title, message) {
    const general = this.settings.section("General");

    // 1. Browser / desktop push notification
    if (general.get("browser-notifications") && this.permissionGranted) {
      new Notification(title, {
        body: message,
        icon: this.ctx.getResourceUrl("assets/icon.png"),
      });
    }

    // 2. Sound alert
    if (general.get("sound-alerts")) {
      const audio = new Audio(this.audioUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }

    // 3. In-game toast (uses Melvor's built-in notification)
    if (general.get("in-game-toasts")) {
      notifyPlayer(
        game.attack, // any skill for the icon
        `<strong>${title}</strong><br>${message}`,
        "danger"
      );
    }
  }
}
