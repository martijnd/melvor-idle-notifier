export class NotificationManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.settings = ctx.settings;
    this.alertUrl = ctx.getResourceUrl("assets/alert.ogg");
    this.deathUrl = ctx.getResourceUrl("assets/death.ogg");
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
   * @param {{ isDeath?: boolean }} [options] - isDeath: use death sound when player died
   */
  send(title, message, options = {}) {
    const general = this.settings.section("General");
    const isDeath = options.isDeath === true;

    // 1. Browser / desktop push notification
    if (general.get("browser-notifications") && this.permissionGranted) {
      new Notification(title, {
        body: message,
        icon: this.ctx.getResourceUrl("assets/icon.png"),
      });
    }

    // 2. Sound alert (different sound for death, fallback to alert.ogg if death.ogg missing)
    if (general.get("sound-alerts")) {
      const soundUrl = isDeath ? this.deathUrl : this.alertUrl;
      const audio = new Audio(soundUrl);
      audio.volume = isDeath ? 0.7 : 0.5;
      audio.play().catch(() => {
        if (isDeath) {
          const fallback = new Audio(this.alertUrl);
          fallback.volume = 0.5;
          fallback.play().catch(() => {});
        }
      });
    }

    // 3. In-game toast (uses Melvor's built-in notification)
    notifyPlayer(
      game.attack,
      `<strong>${title}</strong><br>${message}`,
      isDeath ? "danger" : "info"
    );
  }
}
