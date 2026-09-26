# 🇩🇪 WortSchatz — iPad Air M3 & Self-Hosting Guide

A complete manual for running **WortSchatz — German PDF Reader & Obsidian Sync** on your **iPad Air M3** (and all iPads/tablets/desktops) with high performance and zero text occlusion.

---

## 🚀 1. Self-Hosting Options

### Option A: Python Local Server (Recommended for Home Wi-Fi)
On your Mac, PC, or Linux server:
```bash
cd /Users/rushi123/.gemini/antigravity/scratch/german-pdf-reader
python3 app.py
```
The server will start and output:
```
====================================================================
  🇩🇪 WortSchatz — German PDF Reader & Obsidian Vault Sync
  🚀 Multi-Threaded Self-Hosted Engine (iPad Air M3 Ready)
====================================================================
  📱 Open on iPad Air M3 (Same Wi-Fi):  http://192.168.1.150:8000/index.html
  💻 Open locally on this machine:      http://localhost:8000/index.html
====================================================================
```
Open the `http://<YOUR_IP>:8000/index.html` link in Safari on your iPad Air M3!

---

### Option B: Docker / Docker Compose (Always-On Home Server / NAS)
```bash
cd /Users/rushi123/.gemini/antigravity/scratch/german-pdf-reader
docker compose up -d
```
Runs quietly in the background on port `8000` with automatic restart and persistent Obsidian vault volume mapping.

---

### Option C: Cloudflare Pages / Workers (30 Seconds)
```bash
npx wrangler pages deploy . --project-name=wortschatz
```
Deploys instantly to Cloudflare's global edge network with SSL and worldwide CDN.

---

## 📱 2. Installing on iPad Air M3 as a Native Full-Screen App (PWA)

1. Open the reader URL in **Safari** on your iPad Air M3.
2. Tap the Safari **Share** icon (the square with an upward arrow in the top bar).
3. Scroll down and tap **"Add to Home Screen"** (`Zum Home-Bildschirm`).
4. Tap **Add**.
5. Launch **WortSchatz** from your iPad Home Screen!
   - Runs in **full-screen standalone mode** with **zero browser address bar**.
   - Edge-to-edge layout with full support for iPad Air M3 safe area insets.
   - **Offline Capable**: Pre-caches the reader, offline German lexicon, and PDF engines so you can study on planes or trains without Wi-Fi!

---

## ✏️ 3. Apple Pencil & Gesture Controls (iPad & Newly Uploaded Files)

| Action | Gesture | Result |
| :--- | :--- | :--- |
| **Word Lookup & Meaning** | **1 Touch / Tap** with **Apple Pencil** or finger | **Selects the German word** and shows the translation card above it with article (`der/die/das`), audio & meaning. **Clean preview**: does NOT leave permanent highlight or add to drawer unless you tap **Highlight & Save**! |
| **Sentence Translation** | **2 Touches / Double-Tap** with **Apple Pencil** or finger (or double-click) | **Selects the full German sentence** (`.!?`) and shows the complete sentence translation card above it. **Clean preview**: leaves PDF clean unless saved! |
| **Long-Press Sentence** | Touch and hold ($\ge 550\text{ms}$) | Alternative gesture to expand selection to full sentence on touchscreen |
| **Highlight & Save** | Tap **Highlight & Save** in card | Permanently bakes the yellow highlight into the PDF and saves card to Live Glossary & Vocab Deck |
| **Dismiss / Clean** | Tap anywhere outside | Dismisses the card, clears the temporary preview highlight, leaves PDF completely clean |
| **Pinch-To-Zoom** | Two-finger pinch in / out | Fluid vector zoom ($50\%$ to $250\%$) on iPad touchscreen |
| **Resize Margin Glossary** | Drag divider with Apple Pencil or finger | Expands or contracts the non-occluding margin glossary without text occlusion |
| **Snap Margin Splitter** | Double-tap divider | Snaps between compact ($200\text{px}$) and wide ($320\text{px}$) margin views |
| **Hide / Show Margin** | Tap edge tab (`<`) or sidebar icon | Collapses sidebar for $100\%$ full-width PDF canvas |

---

## 🔮 4. Obsidian Vault Synchronization

WortSchatz features a **3-Way Obsidian Sync Engine** designed for iPadOS:

1. **iPad Native Obsidian App**:
   - Tap **Obsidian** in the topbar -> **"Open in iPad Obsidian App"**.
   - Uses the native `obsidian://` protocol to open the Obsidian iPad app and append vocabulary under your podcast/document title into `vocabulary.md`.
2. **Self-Hosted Server Sync**:
   - Automatically writes to `~/Desktop/Obsidian Vault/vocabulary.md` on your host Mac/server via `/api/save-obsidian`.
3. **Download / Share Markdown (.md)**:
   - Uses the iPad Share Sheet to save `vocabulary.md` directly into your iCloud Drive Obsidian vault folder.

### Formatted Markdown Output Example:
```markdown
## 🎙️ German Podcast Episode 12
> [!info] Reading & Podcast Metadata
> **Date**: 2026-09-27 00:20 | **Words Count**: 15 | **Tags**: #german #wortschatz #vocabulary

| German | English Translation | Gender / Class | Page | Spaced Repetition (Anki) |
| :--- | :--- | :--- | :---: | :--- |
| **die Verantwortung** | responsibility | die (noun) | 1 | `die Verantwortung :: responsibility` |
| **ermöglichen** | to enable, make possible | verb | 2 | `ermöglichen :: to enable, make possible` |
```

---

## 🗂️ 5. Anki & In-PDF Vector Highlights Export

- **Anki (.tsv)**: Tap **Vocab Deck** -> **Anki (.tsv)** to download a clean, tab-separated deck (`wortschatz_anki_deck.tsv`) with authentic German orthography, color-coded genders, grammatical classes, and tags ready for Anki import.
- **In-PDF Vector Highlights**: Tap **Export** in the top bar to generate and download an annotated PDF with real vector highlight rectangles and margin glossary callouts baked directly into the PDF binary via `pdf-lib`.

---

## ⚡ 6. Extreme Condition & Performance Optimizations

1. **Virtual Page Memory Recycling**:
   - In 300+ page German textbooks, off-screen canvas contexts are reclaimed to avoid iOS WebKit memory limits ($256\text{MB}$ canvas ceiling), preventing iPad Safari crashes.
2. **Compound Word Decompiler & Soft Hyphen Cleansing**:
   - Hyphenated German words spanning line breaks (e.g. `Verant-` / `wortung`) are normalized to single lemmata.
3. **Sub-Millisecond Offline Dictionary**:
   - Over 10,000+ German vocabulary entries with morphological word family, prefix, and separable verb trees run completely on-device.
