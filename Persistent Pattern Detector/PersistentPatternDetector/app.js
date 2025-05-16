// Persistent Pattern Detector - app.js

// --- State ---
const state = {
  input: '',
  patterns: [], // { pattern, count, positions, colorIdx }
  minLength: 2,
  caseSensitive: false,
  selectedPatternIdx: null,
  analyzing: false,
  error: '',
  restored: false,
};

const MAX_PATTERNS = 10; // Max distinct highlight colors
const HIGHLIGHT_CLASSES = [
  'pattern-highlight-1','pattern-highlight-2','pattern-highlight-3','pattern-highlight-4','pattern-highlight-5',
  'pattern-highlight-6','pattern-highlight-7','pattern-highlight-8','pattern-highlight-9','pattern-highlight-10',
];

// --- DOM Elements ---
const inputText = document.getElementById('inputText');
const fileInput = document.getElementById('fileInput');
const minLengthInput = document.getElementById('minLength');
const caseSensitiveInput = document.getElementById('caseSensitive');
const detectBtn = document.getElementById('detectBtn');
const clearBtn = document.getElementById('clearBtn');
const charCount = document.getElementById('charCount');
const inputError = document.getElementById('inputError');
const patternsList = document.getElementById('patternsList');
const highlightedTextContainer = document.getElementById('highlightedTextContainer');
const resultsMessage = document.getElementById('resultsMessage');
const loadingOverlay = document.getElementById('loadingOverlay');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelp = document.getElementById('closeHelp');
const clearStorage = document.getElementById('clearStorage');

// --- Local Storage Keys ---
const LS_INPUT = 'ppd_lastInput';
const LS_MINLEN = 'ppd_minLength';
const LS_CASE = 'ppd_caseSensitive';

// --- Utility Functions ---
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
function saveStateToLocal() {
  try {
    if (state.input.length < 20000) localStorage.setItem(LS_INPUT, state.input);
    localStorage.setItem(LS_MINLEN, state.minLength);
    localStorage.setItem(LS_CASE, state.caseSensitive ? '1' : '0');
  } catch {}
}
function loadStateFromLocal() {
  let restored = false;
  try {
    const input = localStorage.getItem(LS_INPUT);
    if (input) { state.input = input; restored = true; }
    const minLen = localStorage.getItem(LS_MINLEN);
    if (minLen) state.minLength = parseInt(minLen) || 2;
    const cs = localStorage.getItem(LS_CASE);
    if (cs) state.caseSensitive = cs === '1';
  } catch {}
  return restored;
}
function clearLocalStorage() {
  localStorage.removeItem(LS_INPUT);
  localStorage.removeItem(LS_MINLEN);
  localStorage.removeItem(LS_CASE);
}
function setAnalyzing(on) {
  state.analyzing = on;
  loadingOverlay.hidden = !on;
  detectBtn.disabled = on;
  inputText.disabled = on;
  minLengthInput.disabled = on;
  caseSensitiveInput.disabled = on;
  fileInput.disabled = on;
}
function setError(msg) {
  state.error = msg;
  inputError.textContent = msg;
  if (msg) inputText.classList.add('error');
  else inputText.classList.remove('error');
}
function setCharCount() {
  charCount.textContent = state.input.length ? `Characters: ${state.input.length}` : '';
}
function updateClearBtn() {
  clearBtn.disabled = !state.input && !state.patterns.length;
}
function showResultsMessage(msg, type='info') {
  resultsMessage.textContent = msg;
  resultsMessage.style.color = type==='error' ? 'var(--error)' : 'var(--info)';
}
function showHelpModal(show) {
  helpModal.hidden = !show;
  if (show) helpModal.querySelector('.modal-content').focus();
}

// --- Pattern Detection Algorithm ---
function findRepeatingPatterns(text, minLen, caseSensitive) {
  // Returns [{pattern, count, positions}...], sorted by count desc, then length desc
  if (!caseSensitive) text = text.toLowerCase();
  const n = text.length;
  const seen = new Map(); // pattern -> {count, positions}
  for (let len = minLen; len <= Math.min(30, n/2); len++) {
    for (let i = 0; i <= n - len; i++) {
      const substr = text.substr(i, len);
      if (!seen.has(substr)) seen.set(substr, {count:0, positions:[]});
      seen.get(substr).count++;
      seen.get(substr).positions.push(i);
    }
  }
  // Filter: only patterns with count >=2
  let patterns = [];
  for (const [pattern, {count, positions}] of seen.entries()) {
    if (count >= 2) patterns.push({pattern, count, positions});
  }
  // Sort: by count desc, then length desc, then pattern
  patterns.sort((a,b) => b.count - a.count || b.pattern.length - a.pattern.length || a.pattern.localeCompare(b.pattern));
  // Limit to MAX_PATTERNS for highlighting
  patterns = patterns.slice(0, MAX_PATTERNS).map((p, idx) => ({...p, colorIdx: idx}));
  return patterns;
}

// --- Highlighting Logic ---
function buildHighlightedText(text, patterns, selectedIdx) {
  // Returns HTML string with <span> for highlights
  if (!patterns.length) return escapeHtml(text);
  // Build a map of all highlight ranges: [{start, end, colorIdx, selected}]
  let ranges = [];
  patterns.forEach((pat, idx) => {
    if (selectedIdx !== null && selectedIdx !== idx) return;
    pat.positions.forEach(pos => {
      ranges.push({start: pos, end: pos+pat.pattern.length, colorIdx: idx, selected: selectedIdx===idx});
    });
  });
  // Sort ranges by start, then by -length (longer first)
  ranges.sort((a,b) => a.start-b.start || b.end-b.end);
  // Merge overlapping: only show one highlight per char (prefer selected, then lower idx)
  let out = '', i = 0;
  while (i < text.length) {
    let found = null;
    for (const r of ranges) {
      if (i >= r.start && i < r.end) { found = r; break; }
    }
    if (found) {
      let j = found.end;
      // If another range starts before found.end, stop at that point
      for (const r2 of ranges) {
        if (r2 !== found && r2.start > i && r2.start < j) j = r2.start;
      }
      const spanClass = HIGHLIGHT_CLASSES[found.colorIdx % HIGHLIGHT_CLASSES.length] + (found.selected ? ' pattern-highlight-flash' : '');
      out += `<span class="${spanClass}" data-idx="${found.colorIdx}">${escapeHtml(text.slice(i, j))}</span>`;
      i = j;
    } else {
      // No highlight
      let j = i+1;
      while (j < text.length && !ranges.some(r => j >= r.start && j < r.end)) j++;
      out += escapeHtml(text.slice(i, j));
      i = j;
    }
  }
  return out;
}

// --- UI Rendering ---
function render() {
  // Input
  inputText.value = state.input;
  minLengthInput.value = state.minLength;
  caseSensitiveInput.checked = state.caseSensitive;
  setCharCount();
  setError(state.error);
  updateClearBtn();
  // Results
  patternsList.innerHTML = '';
  if (state.patterns.length) {
    state.patterns.forEach((pat, idx) => {
      const li = document.createElement('li');
      li.className = 'pattern-item' + (state.selectedPatternIdx===idx ? ' selected' : '');
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      li.setAttribute('aria-label', `Pattern ${pat.pattern}, ${pat.count} occurrences`);
      li.addEventListener('click', () => selectPattern(idx));
      li.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') selectPattern(idx); });
      const colorDot = document.createElement('span');
      colorDot.className = 'pattern-color ' + HIGHLIGHT_CLASSES[pat.colorIdx % HIGHLIGHT_CLASSES.length];
      li.appendChild(colorDot);
      const patText = document.createElement('span');
      patText.textContent = `"${pat.pattern}"`;
      li.appendChild(patText);
      const count = document.createElement('span');
      count.className = 'pattern-count';
      count.textContent = `×${pat.count}`;
      li.appendChild(count);
      patternsList.appendChild(li);
    });
    patternsList.parentElement.style.display = '';
  } else {
    patternsList.parentElement.style.display = 'block';
  }
  // Highlighted text
  if (state.patterns.length) {
    highlightedTextContainer.innerHTML = buildHighlightedText(state.input, state.patterns, state.selectedPatternIdx);
    highlightedTextContainer.style.display = '';
  } else {
    highlightedTextContainer.innerHTML = '';
    highlightedTextContainer.style.display = 'none';
  }
  // Results message
  if (state.analyzing) {
    showResultsMessage('Analyzing...');
  } else if (!state.input.trim()) {
    showResultsMessage('Enter text and click Detect Pattern.');
  } else if (!state.patterns.length) {
    showResultsMessage('No repeating patterns found.', 'info');
  } else {
    showResultsMessage(`${state.patterns.length} pattern${state.patterns.length>1?'s':''} found.`);
  }
  // Accessibility: announce results
  if (!state.analyzing && state.patterns.length) {
    resultsMessage.setAttribute('aria-live', 'polite');
    resultsMessage.textContent = `${state.patterns.length} pattern${state.patterns.length>1?'s':''} found.`;
  }
}

function selectPattern(idx) {
  if (state.selectedPatternIdx === idx) {
    state.selectedPatternIdx = null;
  } else {
    state.selectedPatternIdx = idx;
    // Animate scroll to first occurrence
    setTimeout(() => {
      const span = highlightedTextContainer.querySelector(`span[data-idx="${idx}"]`);
      if (span) {
        span.classList.add('pattern-highlight-flash');
        span.scrollIntoView({behavior:'smooth', block:'center'});
        setTimeout(()=>span.classList.remove('pattern-highlight-flash'), 600);
      }
    }, 50);
  }
  render();
}

// --- Event Handlers ---
inputText.addEventListener('input', () => {
  state.input = inputText.value;
  state.patterns = [];
  state.selectedPatternIdx = null;
  setCharCount();
  setError('');
  updateClearBtn();
  saveStateToLocal();
  render();
});
fileInput.addEventListener('change', e => {
  const file = fileInput.files[0];
  if (!file) return;
  if (file.size > 200000) {
    setError('File too large (max 200KB)');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(ev) {
    state.input = ev.target.result;
    inputText.value = state.input;
    state.patterns = [];
    state.selectedPatternIdx = null;
    setCharCount();
    setError('');
    saveStateToLocal();
    render();
  };
  reader.readAsText(file);
});
minLengthInput.addEventListener('change', () => {
  let v = parseInt(minLengthInput.value) || 2;
  if (v < 1) v = 1;
  if (v > 10) v = 10;
  state.minLength = v;
  minLengthInput.value = v;
  state.patterns = [];
  state.selectedPatternIdx = null;
  saveStateToLocal();
  render();
});
caseSensitiveInput.addEventListener('change', () => {
  state.caseSensitive = caseSensitiveInput.checked;
  state.patterns = [];
  state.selectedPatternIdx = null;
  saveStateToLocal();
  render();
});
detectBtn.addEventListener('click', () => {
  runDetection();
});
inputText.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    runDetection();
    e.preventDefault();
  }
});
clearBtn.addEventListener('click', () => {
  state.input = '';
  state.patterns = [];
  state.selectedPatternIdx = null;
  setError('');
  inputText.value = '';
  fileInput.value = '';
  saveStateToLocal();
  render();
});
clearStorage.addEventListener('click', e => {
  e.preventDefault();
  clearLocalStorage();
  showResultsMessage('Saved data cleared.', 'info');
});
helpBtn.addEventListener('click', () => showHelpModal(true));
closeHelp.addEventListener('click', () => showHelpModal(false));
helpModal.addEventListener('click', e => { if (e.target === helpModal) showHelpModal(false); });
window.addEventListener('keydown', e => {
  if (!helpModal.hidden && (e.key === 'Escape' || e.key === 'Esc')) showHelpModal(false);
});

// --- Main Detection Logic ---
function runDetection() {
  setError('');
  if (!state.input.trim()) {
    setError('Please enter some data to analyze.');
    return;
  }
  if (state.input.length < state.minLength*2) {
    setError(`Not enough length for patterns. Please enter more data.`);
    return;
  }
  setAnalyzing(true);
  showResultsMessage('Analyzing...');
  setTimeout(() => {
    try {
      state.patterns = findRepeatingPatterns(state.input, state.minLength, state.caseSensitive);
      state.selectedPatternIdx = null;
      saveStateToLocal();
      setAnalyzing(false);
      render();
    } catch (e) {
      setAnalyzing(false);
      setError('Error during analysis. Try smaller input.');
      showResultsMessage('Error during analysis.', 'error');
    }
  }, 50); // allow spinner to show
}

// --- Initialization ---
function init() {
  state.restored = loadStateFromLocal();
  if (state.restored) {
    inputText.value = state.input;
    minLengthInput.value = state.minLength;
    caseSensitiveInput.checked = state.caseSensitive;
    setCharCount();
    showResultsMessage('Restored last analysis. Click Detect Pattern to re-analyze.');
  }
  render();
}

document.addEventListener('DOMContentLoaded', init); 