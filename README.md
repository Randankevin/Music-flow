# 🎵 MusicFlow

A modern, full-featured music streaming web app — dark-themed, PWA-ready, and works offline.

---

## 🚀 Quick Start

1. **Download all 6 files** into the same folder:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `manifest.json`
   - `sw.js`
   - `README.md`

2. **Open `index.html`** in any modern browser, or serve via a local server:
   ```bash
   # Python
   python3 -m http.server 3000

   # Node.js (npx)
   npx serve .
   ```

3. **Create an account** or tap **Continue as Guest** to jump right in.

---

## ✨ Features

### 🔐 Authentication
- Sign up with name + email + password
- Sign in with existing credentials
- Guest mode (no account needed)
- Sessions persist across browser restarts
- Sign out anytime from the sidebar

### 🎶 Music Playback
| Control | Description |
|---------|-------------|
| ▶️ Play/Pause | Toggle playback |
| ⏮ ⏭ | Previous / Next track |
| 🔀 Shuffle | Randomize queue order |
| 🔁 Repeat | Off / Repeat All / Repeat One |
| 🔊 Volume | Drag slider or click icon to mute |
| ⏩ Seek | Click anywhere on the progress bar |
| ⬆️ Expand | Open fullscreen "Now Playing" view |

### 📥 Download & Local Files
- **Download any track** — click the ⬇️ icon on any track or in the player
- **Upload local music** — drag & drop or browse in the "Local Files" tab
- Supports MP3, WAV, FLAC, AAC, OGG
- Local files persist in your session
- Works on iPhone/iPad via Safari

### 📚 Library Management
- **Liked Songs** — tap ♥ on any track to add/remove
- **Playlists** — create unlimited custom playlists
- **Add to Playlist** — tap ⊞ on any track
- **Library** — browse All / Songs / Albums / Artists
- **Search** — instant full-text search across all tracks

### 🎨 Views
| View | Content |
|------|---------|
| 🏠 Home | Recently played, Trending, Made For You |
| 🔭 Discover | Genres, New Releases, Popular Playlists |
| 📚 Library | Full track list with filtering |
| 📂 Local Files | Upload and manage local audio |
| 🎵 Playlists | All your custom playlists |
| ❤️ Favorites | Liked songs |

### 📱 Progressive Web App (PWA)
- **Installable** on iOS, Android, and desktop
- **Offline support** via Service Worker caching
- App shell caches on first visit
- Add to Home Screen for native-like experience

**To install on iPhone:**
1. Open in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

---

## 🏗️ Project Structure

```
MusicFlow/
├── index.html      # App shell, all views, modals
├── styles.css      # Dark theme, responsive design
├── app.js          # All application logic
├── manifest.json   # PWA manifest
├── sw.js           # Service worker (offline + caching)
└── README.md       # This file
```

---

## 🎨 Design System

- **Font**: Syne (headings) + DM Sans (body)
- **Primary accent**: `#6EE7F7` (cyan)
- **Secondary accent**: `#a78bfa` (violet)
- **Tertiary accent**: `#f472b6` (pink)
- **Background**: `#0a0a0f`

---

## 🔧 Connecting Real Audio

The demo includes 12 sample tracks with album art but no audio files (demo mode). To connect real audio:

1. Add a `src` URL to each track in `SAMPLE_TRACKS` in `app.js`:
   ```js
   { id:'t1', title:'My Song', artist:'Artist', src:'https://example.com/song.mp3', ... }
   ```

2. Or use local audio files:
   ```js
   src: './audio/my-song.mp3'
   ```

3. Or let users upload via the **Local Files** tab — this works immediately with any audio file.

---

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Safari 14+ (iOS/macOS) | ✅ Full |
| Firefox 88+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Samsung Internet 14+ | ✅ Full |

---

## 📝 License

MIT — free to use, modify, and distribute.

---

*Built with ❤️ — MusicFlow*
