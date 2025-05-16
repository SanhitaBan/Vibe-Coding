// Feature Detection and Compatibility
const features = {
    webgl: (function() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch(e) {
            return false;
        }
    })(),
    webWorkers: !!window.Worker,
    localStorage: (function() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch(e) {
            return false;
        }
    })(),
    touchEvents: 'ontouchstart' in window
};

// Enhanced State Management
const appState = {
    currentView: 'home',
    currentExperiment: null,
    theme: localStorage.getItem('theme') || 'light',
    sidebarVisible: window.innerWidth > 768,
    controlPanelExpanded: false,
    experiments: [],
    // New state properties
    renderMode: features.webgl ? '3d' : '2d',
    performanceMode: 'auto',
    accessibility: {
        highContrast: false,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        fontSize: 'normal'
    },
    experimentHistory: [],
    measurements: [],
    userPreferences: loadUserPreferences()
};

// DOM Elements
const elements = {
    body: document.body,
    menuToggle: document.getElementById('menu-toggle'),
    themeToggle: document.getElementById('theme-toggle'),
    helpButton: document.getElementById('help-button'),
    sidebar: document.getElementById('sidebar'),
    experimentList: document.getElementById('experiment-list'),
    experimentGrid: document.getElementById('experiment-grid'),
    homeScreen: document.getElementById('home-screen'),
    experimentScreen: document.getElementById('experiment-screen'),
    experimentCanvas: document.getElementById('experiment-canvas'),
    experimentTitle: document.getElementById('experiment-title'),
    controlPanelToggle: document.getElementById('control-panel-toggle'),
    controlPanel: document.querySelector('.control-panel'),
    controlPanelContent: document.getElementById('control-panel-content'),
    tutorialOverlay: document.getElementById('tutorial-overlay'),
    closeTutorial: document.getElementById('close-tutorial'),
    tutorialContent: document.getElementById('tutorial-content')
};

// User Preferences Management
function loadUserPreferences() {
    if (!features.localStorage) return {};
    try {
        return JSON.parse(localStorage.getItem('userPreferences')) || {
            particleCount: 'auto',
            animationSpeed: 1,
            visualizationMode: '2d',
            tutorial: true,
            dataCollection: false
        };
    } catch(e) {
        console.warn('Failed to load preferences:', e);
        return {};
    }
}

function saveUserPreferences() {
    if (!features.localStorage) return;
    try {
        localStorage.setItem('userPreferences', JSON.stringify(appState.userPreferences));
    } catch(e) {
        console.warn('Failed to save preferences:', e);
    }
}

// Enhanced Experiment Registry
const experiments = [
    {
        id: 'double-slit',
        title: 'Double-Slit Experiment',
        description: 'Explore wave-particle duality through the famous double-slit experiment.',
        thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23666" x="10" y="40" width="80" height="20"/><circle fill="%23666" cx="30" cy="50" r="5"/><circle fill="%23666" cx="70" cy="50" r="5"/></svg>',
        module: () => import('./experiments/double-slit.js'),
        requirements: {
            webgl: false,
            performance: 'medium'
        }
    },
    {
        id: 'quantum-superposition',
        title: 'Quantum Superposition',
        description: 'Visualize quantum superposition states and their measurement.',
        thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle fill="%23666" cx="50" cy="50" r="40"/><path fill="none" stroke="%23fff" d="M30,50 Q50,20 70,50 Q50,80 30,50"/></svg>',
        module: () => import('./experiments/quantum-superposition.js'),
        requirements: {
            webgl: false,
            performance: 'low'
        }
    },
    {
        id: 'quantum-entanglement',
        title: 'Quantum Entanglement',
        description: 'Explore quantum entanglement and Bell states through interactive visualization.',
        thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle fill="%23666" cx="30" cy="50" r="20"/><circle fill="%23666" cx="70" cy="50" r="20"/><path stroke="%23666" stroke-width="4" stroke-dasharray="5,5" d="M35,50 L65,50"/></svg>',
        module: () => import('./experiments/quantum-entanglement.js'),
        requirements: {
            webgl: true,
            performance: 'medium'
        }
    }
];

// Performance Monitoring
const performanceMetrics = {
    fps: 0,
    lastFrameTime: 0,
    frameCount: 0,
    measurements: []
};

function updatePerformanceMetrics() {
    const now = performance.now();
    const delta = now - performanceMetrics.lastFrameTime;
    performanceMetrics.frameCount++;
    
    if (delta >= 1000) {
        performanceMetrics.fps = (performanceMetrics.frameCount * 1000) / delta;
        performanceMetrics.frameCount = 0;
        performanceMetrics.lastFrameTime = now;
        
        // Auto-adjust performance settings
        if (performanceMetrics.fps < 30) {
            adjustPerformanceSettings('low');
        } else if (performanceMetrics.fps > 55) {
            adjustPerformanceSettings('high');
        }
    }
}

function adjustPerformanceSettings(level) {
    if (appState.performanceMode === 'manual') return;
    
    switch(level) {
        case 'low':
            appState.userPreferences.particleCount = 'low';
            appState.userPreferences.animationSpeed = 0.5;
            break;
        case 'high':
            appState.userPreferences.particleCount = 'auto';
            appState.userPreferences.animationSpeed = 1;
            break;
    }
    
    if (appState.currentExperiment) {
        updateExperimentSettings();
    }
}

// Enhanced Initialization
function initializeApp() {
    // Set initial theme
    setTheme(appState.theme);
    
    // Setup performance monitoring
    if (window.requestAnimationFrame) {
        function monitorLoop() {
            updatePerformanceMetrics();
            requestAnimationFrame(monitorLoop);
        }
        requestAnimationFrame(monitorLoop);
    }
    
    // Initialize accessibility features
    setupAccessibility();
    
    // Populate experiments
    populateExperiments();
    
    // Setup event listeners
    setupEventListeners();
    
    // Handle initial route
    handleRoute();
    
    // Load last state
    loadSavedState();
}

// Accessibility Setup
function setupAccessibility() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.addEventListener('change', (e) => {
        appState.accessibility.reducedMotion = e.matches;
        updateExperimentSettings();
    });
    
    // Add ARIA labels and roles
    document.querySelectorAll('button').forEach(button => {
        if (!button.getAttribute('aria-label')) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', () => {
        const newTheme = appState.theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
    
    // Menu toggle
    elements.menuToggle.addEventListener('click', toggleSidebar);
    
    // Help button
    elements.helpButton.addEventListener('click', showTutorial);
    
    // Close tutorial
    elements.closeTutorial.addEventListener('click', hideTutorial);
    
    // Control panel toggle
    elements.controlPanelToggle.addEventListener('click', toggleControlPanel);
    
    // Window resize
    window.addEventListener('resize', handleResize);
    
    // Handle back/forward navigation
    window.addEventListener('popstate', handleRoute);
}

// Theme Management
function setTheme(theme) {
    appState.theme = theme;
    elements.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
}

// Sidebar Management
function toggleSidebar() {
    appState.sidebarVisible = !appState.sidebarVisible;
    elements.sidebar.classList.toggle('collapsed', !appState.sidebarVisible);
    elements.mainContent.classList.toggle('expanded', !appState.sidebarVisible);
}

// Control Panel Management
function toggleControlPanel() {
    appState.controlPanelExpanded = !appState.controlPanelExpanded;
    elements.controlPanel.classList.toggle('expanded', appState.controlPanelExpanded);
}

// Experiment Management
function populateExperiments() {
    // Populate sidebar list
    const listHTML = experiments.map(exp => `
        <li class="experiment-item" data-id="${exp.id}">
            <a href="#experiment/${exp.id}">${exp.title}</a>
        </li>
    `).join('');
    elements.experimentList.innerHTML = listHTML;
    
    // Populate grid
    const gridHTML = experiments.map(exp => `
        <div class="experiment-card" data-id="${exp.id}">
            <img src="${exp.thumbnail}" alt="${exp.title}" class="experiment-thumbnail">
            <h3>${exp.title}</h3>
            <p>${exp.description}</p>
        </div>
    `).join('');
    elements.experimentGrid.innerHTML = gridHTML;
    
    // Add click handlers to cards
    document.querySelectorAll('.experiment-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            navigateToExperiment(id);
        });
    });
}

// Navigation
function navigateToExperiment(id) {
    window.location.hash = `#experiment/${id}`;
}

function handleRoute() {
    const hash = window.location.hash;
    if (hash.startsWith('#experiment/')) {
        const id = hash.replace('#experiment/', '');
        loadExperiment(id);
    } else {
        showHomeScreen();
    }
}

// Screen Management
function showHomeScreen() {
    appState.currentView = 'home';
    appState.currentExperiment = null;
    elements.homeScreen.classList.add('active');
    elements.experimentScreen.classList.remove('active');
}

async function loadExperiment(id) {
    const experiment = experiments.find(e => e.id === id);
    if (!experiment) {
        showHomeScreen();
        return;
    }
    
    try {
        // Check requirements
        if (experiment.requirements.webgl && !features.webgl) {
            throw new Error('WebGL is required but not supported');
        }
        
        // Load experiment module
        const module = await experiment.module();
        
        // Update state with history
        appState.experimentHistory.push({
            id,
            timestamp: Date.now(),
            settings: { ...appState.userPreferences }
        });
        
        appState.currentView = 'experiment';
        appState.currentExperiment = experiment;
        
        // Update UI
        elements.experimentTitle.textContent = experiment.title;
        elements.homeScreen.classList.remove('active');
        elements.experimentScreen.classList.add('active');
        
        // Initialize experiment with current settings
        if (module.initialize) {
            const config = {
                ...appState.userPreferences,
                accessibility: appState.accessibility,
                renderMode: appState.renderMode
            };
            
            module.initialize(elements.experimentCanvas, elements.controlPanelContent, config);
        }
        
        // Show tutorial if first time
        const tutorialSeen = localStorage.getItem(`tutorial-${id}`);
        if (!tutorialSeen && module.tutorial && appState.userPreferences.tutorial) {
            showTutorial(module.tutorial);
            localStorage.setItem(`tutorial-${id}`, 'true');
        }
        
    } catch (error) {
        console.error('Failed to load experiment:', error);
        showError(error);
        showHomeScreen();
    }
}

// Tutorial Management
function showTutorial(content) {
    if (content) {
        elements.tutorialContent.innerHTML = content;
    }
    elements.tutorialOverlay.classList.remove('hidden');
}

function hideTutorial() {
    elements.tutorialOverlay.classList.add('hidden');
}

// Responsive Handling
function handleResize() {
    if (window.innerWidth <= 768) {
        if (appState.sidebarVisible) {
            appState.sidebarVisible = false;
            elements.sidebar.classList.add('collapsed');
            elements.mainContent.classList.add('expanded');
        }
    }
}

// State Persistence
function loadSavedState() {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            Object.assign(appState, state);
        } catch (error) {
            console.error('Failed to load saved state:', error);
        }
    }
}

function saveState() {
    const stateToSave = {
        theme: appState.theme,
        sidebarVisible: appState.sidebarVisible
    };
    localStorage.setItem('appState', JSON.stringify(stateToSave));
}

// Error handling
function showError(error) {
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'error-overlay';
    errorOverlay.innerHTML = `
        <div class="error-content">
            <h3>Error</h3>
            <p>${error.message}</p>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(errorOverlay);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeApp); 