# Idle Notifier — Melvor Idle Mod

Get browser, sound, and in-game notifications for important idle events.

## Features

- **Combat Idle** — Notify when combat stops (death or area cleared, no more enemies)
- **Skill Idle** — Notify when a skill stops (resource depleted, inventory full, or manual stop)

## Settings Persistence

Settings are persisted across sessions using account storage (when the mod is linked to mod.io) and `localStorage` as a fallback in the browser.

## Notification Channels

- **Browser Notifications** — Desktop push notifications. Click "Enable Browser Notifications" in mod settings to grant permission (browsers require a user gesture).
- **Sound Alerts** — Play a sound when an event triggers. Death plays a different sound (`death.ogg`) when the player dies.

## Project Structure

```
melvor-idle-notifier/
├── manifest.json
├── setup.mjs
├── src/
│   ├── notifications.mjs
│   └── event-handlers.mjs
├── assets/
│   ├── icon.png
│   ├── alert.ogg      ← Default notification sound
│   ├── death.ogg      ← Death sound (optional, falls back to alert.ogg)
│   └── styles.css
└── templates/
    └── settings-panel.html
```

## Setup: Alert Sounds (Optional)

- **alert.ogg** — Default notification sound. Required for skill/combat idle.
- **death.ogg** — Played when the player dies. If missing, falls back to `alert.ogg`.

Add OGG audio files to the `assets/` folder. Sources: [Pixabay](https://pixabay.com/sound-effects/search/alert/), [Freesound.org](https://freesound.org/) (filter by CC0).

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

## Extension Ideas

| Feature                      | How                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Skill resource depletion** | Patch skills (Mining, Woodcutting, etc.) to notify when a node depletes — requires finding the correct hooks in the game. |
| **Cooldown / throttle**      | Prevent spam by adding a per-event cooldown (e.g., combat idle at most once per minute).                                  |
| **Custom alert sound**       | Let users pick from multiple sounds via a `dropdown` setting.                                                             |
| **Webhook integration**      | POST to a Discord webhook so you get alerts on your phone.                                                                |
