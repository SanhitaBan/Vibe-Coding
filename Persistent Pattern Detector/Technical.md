# Persistent Pattern Detector – Technical Documentation

## Architecture Overview
- **Type:** Single-page web application (SPA)
- **Stack:** HTML, CSS, JavaScript (no frameworks, no build step)
- **Processing:** 100% client-side, no server or backend
- **Persistence:** Browser localStorage
- **Responsiveness:** CSS Flexbox/Grid, media queries
- **Accessibility:** ARIA, keyboard navigation, color contrast, reduced motion support

## File Structure
```
PersistentPatternDetector/
├── index.html         # Main HTML, UI structure
├── styles.css         # All CSS, responsive and accessible
├── app.js             # All JS: state, logic, UI, persistence
├── README.md          # User guide
└── Technical.md       # This file
```

## State Management
- **State object** in `app.js` holds:
  - `input`: User input text
  - `patterns`: Array of detected patterns (`{pattern, count, positions, colorIdx}`)
  - `minLength`: Minimum pattern length (user setting)
  - `caseSensitive`: Case sensitivity (user setting)
  - `selectedPatternIdx`: Which pattern is focused in UI
  - `analyzing`: Whether analysis is running
  - `error`: Current error message
  - `restored`: Whether state was loaded from localStorage
- **Transitions:**
  - Input/edit → idle
  - Detect → analyzing → results
  - Settings change → results cleared
  - Clear → reset all
- **Persistence:**
  - Input and settings saved to localStorage on change or detection
  - Restored on load if present

## Pattern Detection Algorithm
- **Approach:**
  - For all substring lengths from `minLength` up to 30 or `n/2`, count all substrings
  - Use a Map to track `{count, positions}` for each substring
  - Only keep substrings with `count >= 2`
  - Sort by count (desc), then length (desc), then lexicographically
  - Limit to top 10 for color highlights
- **Overlapping matches:** Supported
- **Case sensitivity:** Input is lowercased if not case sensitive
- **Performance:**
  - Efficient for moderate input (<10k chars)
  - For very large input, consider Web Worker (see enhancements)

## UI Rendering
- **Input Section:**
  - `<textarea>` for input
  - File upload populates textarea
  - Settings: min pattern length (number), case sensitivity (checkbox)
  - Character count, error messages
- **Action Buttons:**
  - Detect Pattern: triggers analysis
  - Clear: resets input/results
- **Results Section:**
  - Patterns list: clickable, color-coded, keyboard accessible
  - Highlighted text: input rendered as `<div>` with `<span>` highlights
  - Loading overlay during analysis
  - Info/error messages
- **Help Modal:**
  - Usage instructions, accessible
- **Footer:**
  - Privacy note, clear storage link

## Accessibility
- **Keyboard navigation:**
  - Tab/Shift+Tab to all controls
  - Enter/Space to activate pattern selection
  - Ctrl+Enter in textarea triggers detection
- **ARIA roles/labels:**
  - Live regions for result announcements
  - Roles for buttons, lists
- **Color contrast:**
  - High-contrast highlight colors
  - Reduced motion support via media query
- **Screen reader:**
  - Announcements for results, errors

## Local Storage
- **Keys:**
  - `ppd_lastInput`: Last input text (if <20k chars)
  - `ppd_minLength`: Last min pattern length
  - `ppd_caseSensitive`: Last case sensitivity setting
- **Clearing:**
  - Via UI link or browser storage tools

## Performance Considerations
- **DOM updates:**
  - Batch updates for highlights and patterns list
  - Only top 10 patterns highlighted for performance
- **Algorithm:**
  - Brute-force substring counting, optimized for moderate input
  - For very large input, consider:
    - Suffix tree/array or rolling hash
    - Web Worker for off-main-thread computation
- **Rendering:**
  - Use of `<span>` for highlights preserves copy-paste
  - Animations use hardware-accelerated CSS

## Extensibility & Potential Enhancements
- **Word/token-based patterns:**
  - Add option to split input by whitespace or delimiter
  - Adjust detection to work on tokens
- **Export results:**
  - Add button to download patterns or highlighted text as `.txt` or `.html`
- **PWA support:**
  - Add `manifest.json`, service worker for offline install
- **Web Worker:**
  - Move detection logic to a worker for large input
- **Custom highlights:**
  - User-selectable colors, dark/light mode toggle
- **Advanced metrics:**
  - Show frequency, entropy, allow sorting/filtering
- **Accessibility:**
  - More ARIA, alternative highlight indicators (e.g., underline, tooltip)
- **Internationalization:**
  - Extract UI strings, add language selector

## Key Functions (in `app.js`)
- `findRepeatingPatterns(text, minLen, caseSensitive)` – core detection
- `buildHighlightedText(text, patterns, selectedIdx)` – returns HTML for highlights
- `render()` – updates all UI based on state
- `selectPattern(idx)` – handles pattern selection/focus
- `runDetection()` – validates and runs analysis
- `saveStateToLocal()`, `loadStateFromLocal()` – persistence

## Contributing
- Fork and clone the repo
- Edit HTML, CSS, or JS directly (no build step)
- Test in multiple browsers/devices
- Submit PRs for bugfixes, features, or enhancements

---

For questions or suggestions, open an issue or PR. Contributions are welcome! 