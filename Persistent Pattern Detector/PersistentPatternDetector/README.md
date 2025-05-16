# Persistent Pattern Detector

A fast, privacy-first web app to find and visualize repeating patterns in your text or sequence data—entirely in your browser.

## Features
- **Client-side only:** No data ever leaves your device. All processing is local.
- **Text input or file upload:** Paste or type text, or upload a `.txt` file.
- **Pattern detection:** Finds all repeating substrings of configurable minimum length (default: 2).
- **Case sensitivity:** Option to treat uppercase/lowercase as the same or different.
- **Interactive results:**
  - List of detected patterns (with counts)
  - Click a pattern to focus its highlights in the text
  - Color-coded, accessible highlights in your input
- **Persistence:** Remembers your last input and settings using browser local storage.
- **Responsive & accessible:** Works on desktop and mobile, keyboard accessible, high-contrast highlights.
- **No dependencies:** Pure HTML, CSS, and JavaScript. Works offline after first load.

## How to Use
1. **Open `index.html` in your browser.**
2. **Enter or paste your text** in the input area, or upload a `.txt` file.
3. **Adjust settings** (minimum pattern length, case sensitivity) as needed.
4. **Click "Detect Pattern"** to analyze your input.
5. **View results:**
   - Patterns are listed with counts. Click a pattern to focus its highlights in the text.
   - If no patterns are found, you'll see a message.
6. **Click "Clear"** to start a new analysis.
7. **Your last input and settings are saved** automatically for your next visit.

## Installation & Running
- No installation required! Just open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
- All files are static. You can also host them on any static web server.

## Browser Support
- Chrome, Firefox, Safari, Edge (desktop & mobile)
- Requires JavaScript enabled

## Privacy
- **All analysis is done in your browser.**
- **No data is sent to any server.**
- Your input and settings are stored only in your browser's local storage (and can be cleared at any time).

## Potential Enhancements
- **Word/Token-based pattern detection:** Option to find repeated words or phrases, not just character substrings.
- **Export results:** Download detected patterns or highlighted text as a file.
- **Progressive Web App (PWA):** Installable, offline-first experience.
- **Performance optimizations:** Use Web Workers for very large inputs.
- **Custom highlight colors:** User-selectable color palette or dark/light mode toggle.
- **Advanced pattern metrics:** Show frequency, pattern entropy, or allow filtering/sorting by different criteria.
- **Support for non-text sequences:** (e.g., comma-separated numbers)
- **Accessibility improvements:** Enhanced screen reader support, alternative highlight indicators.
- **Internationalization:** Support for multiple languages in the UI.

---

**Contributions welcome!** See `Technical.md` for developer and architecture details. 