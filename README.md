# Idle Notifier — Melvor Idle Mod

Get browser, sound, and in-game notifications for important idle events.

## Features

- **Combat Death / Idle** — Notify when combat stops (death or no target)
- **Skill Level Milestones** — Notify on level ups (configurable interval)
- **Farming Patches Ready** — Notify when a farming patch is ready to harvest
- **Bank Nearly Full** — Notify when bank slots are almost exhausted
- **Potion Charges Depleted** — Notify when an active potion runs out
- **Slayer Task Complete** — Notify when a slayer task is finished

## Notification Channels

- **Browser Notifications** — Desktop push notifications
- **Sound Alerts** — Play a sound when an event triggers
- **In-Game Toasts** — Show a toast message inside the game UI

## Project Structure

```
melvor-idle-notifier/
├── manifest.json
├── setup.mjs
├── src/
│   ├── notifications.mjs
│   └── monitors.mjs
├── assets/
│   ├── icon.png
│   ├── alert.ogg      ← Add your own sound file (optional)
│   └── styles.css
└── templates/
    └── settings-panel.html
```

## Setup: Alert Sound (Optional)

For sound alerts to work, add an `alert.ogg` file to the `assets/` folder. You can use any short notification sound (OGG format). If the file is missing, sound alerts will fail silently.

**Sources for free sounds:**
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/search/alert/)
- [Freesound.org](https://freesound.org/) — filter by CC0 (public domain)

## Testing Locally

1. **Enable the Mod Manager** in Melvor's in-game settings (sidebar).
2. Open the game on **Steam** and launch the **Creator Toolkit**, or use the **browser version** with DevTools open.
3. In the Creator Toolkit, point to your mod folder and load it directly — no need to upload to mod.io for testing.
4. Select a character and verify:
   - Settings appear under the mod's settings page
   - Browser notification permission is requested
   - Trigger test events (e.g., start and stop combat) and confirm notifications fire

You can also use `mod.getDevContext()` in the browser console to prototype patches interactively.

## Publishing to mod.io

1. **Package** your mod by zipping all files (with `manifest.json` at the zip root):

```bash
cd melvor-idle-notifier
zip -r ../idle-notifier-v1.0.0.zip .
```

2. Go to [mod.io/g/melvoridle](https://mod.io/g/melvoridle) and click **Add Mod**.
3. Fill in the metadata:
   - **Name:** Idle Notifier
   - **Summary:** Get browser, sound, and in-game notifications for important idle events.
   - **Tags:** Select relevant platforms (Web, Steam, etc.) and the supported game version.
   - **Visibility:** Set to **Private** for initial testing, or **Public** when ready.
4. Upload your `.zip` in the **File Manager** section and assign a version number.
5. **Subscribe** to your own mod (either in-game or on the mod.io page) and restart the game.

## Important Caveat

The exact class names and method signatures (e.g., `FarmingPlot.grow`, `PotionManager.removeCharges`) may differ between Melvor Idle versions. Use the **Creator Toolkit** or browser DevTools to inspect the actual global classes and their methods if notifications don't fire as expected.

## Extension Ideas

| Feature | How |
|--------|-----|
| **Cooldown / throttle** | Prevent spam by adding a per-event cooldown (e.g., bank alert at most once per minute). Store timestamps in a `Map`. |
| **Custom alert sound** | Let users pick from multiple sounds via a `dropdown` setting. |
| **Webhook integration** | POST to a Discord webhook so you get alerts on your phone. |
| **Offline catch-up** | On `onCharacterLoaded`, check what happened while offline (levels gained, farming patches grown) and show a summary notification. |
| **Per-skill toggles** | Add a `checkbox-group` setting listing all skills so users pick exactly which ones trigger milestone alerts. |
