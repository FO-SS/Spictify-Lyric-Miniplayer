# 🎵 Lyric Miniplayer

A Spicetify extension that creates a **floating Picture-in-Picture lyrics window** that stays on top of other applications — like YouTube's mini-player, but for lyrics!

![Preview](preview.png)

## ✨ Features

- **🪟 Floating Window** — Opens lyrics in a separate always-on-top window
- **🎤 Synced Lyrics** — Automatically highlights and scrolls to the current line
- **⏯️ Playback Controls** — Previous, Play/Pause, Next buttons in the overlay
- **🔊 Volume Control** — Adjust volume with slider, click speaker to mute
- **🔤 Adjustable Font Size** — Slider to make lyrics larger or smaller
- **👆 Click to Seek** — Click any lyric line to jump to that part of the song
- **⚙️ Settings Menu** — Toggle visibility of lyrics, font size, and volume controls
- **💾 Remembers Preferences** — Your settings are saved automatically
- **⌨️ Keyboard Shortcut** — `Ctrl+Shift+L` to quickly open/close

## 📦 Installation

### From Spicetify Marketplace (Recommended)

1. Open Spotify
2. Go to the Marketplace
3. Search for "Lyric Miniplayer"
4. Click Install

### Manual Installation

1. Download `lyrics-overlay.js`
2. Copy to your Spicetify Extensions folder:
   - **Windows:** `%appdata%\spicetify\Extensions\`
   - **macOS/Linux:** `~/.config/spicetify/Extensions/`
3. Run:
   ```bash
   spicetify config extensions lyrics-overlay.js
   spicetify apply
   ```
4. Restart Spotify

## 🎯 Usage

1. **Click the music note icon (🎵)** in Spotify's top bar  
   **— OR —**  
   Press **`Ctrl+Shift+L`** (Windows/Linux) or **`Cmd+Shift+L`** (macOS)

2. A floating window will appear with your lyrics!

3. **Click the ⠿⠿ dots** in the header to open settings:
   - Toggle lyrics visibility
   - Toggle font size slider
   - Toggle volume slider

## 🎨 Features Overview

| Feature | Description |
|---------|-------------|
| **Synced Lyrics** | Current line highlights in green and auto-scrolls |
| **Click to Seek** | Click any line to jump to that timestamp |
| **Playback Controls** | Control music directly from the miniplayer |
| **Volume Slider** | Adjust volume, click speaker icon to mute |
| **Font Size** | Adjust from 12px to 36px |
| **Settings Menu** | Click ⠿⠿ to toggle UI elements |
| **Draggable** | Drag the header to move the window |

## ⚙️ Configuration

Click the **⠿⠿ dots** in the header to access settings:

- **Show Lyrics** — Toggle the lyrics display on/off
- **Font Size** — Show/hide the font size slider
- **Volume** — Show/hide the volume slider

All preferences are saved and persist between sessions.

## 🔧 Troubleshooting

### Lyrics not showing?
- Some tracks don't have lyrics available on Spotify
- Lyrics are a Spotify feature (availability varies by region)

### Window not appearing?
- Try pressing `Ctrl+Shift+L`
- Check if popups are blocked in your system

### Extension not loading?
1. Verify the file is in the correct Extensions folder
2. Run `spicetify config extensions lyrics-overlay.js`
3. Run `spicetify apply`
4. Restart Spotify completely

## 🗑️ Uninstall

```bash
spicetify config extensions lyrics-overlay.js-
spicetify apply
```

## 📝 License

MIT License — Feel free to modify and share!

## 🙏 Credits

- Built for [Spicetify](https://spicetify.app/)
- Uses Spotify's lyrics API
- Font: [DM Sans](https://fonts.google.com/specimen/DM+Sans)
