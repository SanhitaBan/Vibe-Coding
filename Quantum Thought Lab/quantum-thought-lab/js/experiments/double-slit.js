// Double-Slit Experiment Module
export const tutorial = `
    <h2>Double-Slit Experiment</h2>
    <p>Welcome to the Double-Slit Experiment simulation! This classic experiment demonstrates the wave-particle duality of quantum objects.</p>
    <ol>
        <li>Use the "Particle Rate" slider to control how many particles are emitted.</li>
        <li>Adjust the "Slit Width" to see how it affects the interference pattern.</li>
        <li>Toggle between "Particle" and "Wave" view to see different visualizations.</li>
        <li>Click "Reset" to start over with a clean screen.</li>
    </ol>
    <p>Watch as particles build up an interference pattern over time, even when fired one at a time!</p>
`;

// Simulation parameters
const params = {
    particleRate: 10,
    slitWidth: 10,
    slitSeparation: 50,
    particleSpeed: 2,
    showWaveView: false,
    running: false,
    particles: [],
    pattern: new Float32Array(300).fill(0), // Intensity pattern at screen
    maxIntensity: 1
};

// Animation frame ID for cleanup
let animationId = null;

// Canvas context
let ctx = null;
let canvas = null;
let width = 0;
let height = 0;

// Initialize the experiment
export function initialize(canvasElement, controlsElement) {
    // Setup canvas
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Setup controls
    setupControls(controlsElement);
    
    // Start animation loop
    startSimulation();
}

// Clean up when leaving experiment
export function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    window.removeEventListener('resize', resizeCanvas);
}

// Setup control panel
function setupControls(container) {
    container.innerHTML = `
        <div class="control-group">
            <label for="particle-rate">Particle Rate</label>
            <input type="range" id="particle-rate" min="1" max="100" value="${params.particleRate}">
            <span class="value">${params.particleRate}</span>
        </div>
        <div class="control-group">
            <label for="slit-width">Slit Width</label>
            <input type="range" id="slit-width" min="5" max="20" value="${params.slitWidth}">
            <span class="value">${params.slitWidth}</span>
        </div>
        <div class="control-group">
            <label>
                <input type="checkbox" id="wave-view">
                Show Wave View
            </label>
        </div>
        <div class="control-group">
            <button id="start-stop">Start</button>
            <button id="reset">Reset</button>
        </div>
    `;
    
    // Add event listeners
    const particleRateInput = container.querySelector('#particle-rate');
    particleRateInput.addEventListener('input', (e) => {
        params.particleRate = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = params.particleRate;
    });
    
    const slitWidthInput = container.querySelector('#slit-width');
    slitWidthInput.addEventListener('input', (e) => {
        params.slitWidth = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = params.slitWidth;
    });
    
    const waveViewInput = container.querySelector('#wave-view');
    waveViewInput.addEventListener('change', (e) => {
        params.showWaveView = e.target.checked;
    });
    
    const startStopButton = container.querySelector('#start-stop');
    startStopButton.addEventListener('click', () => {
        params.running = !params.running;
        startStopButton.textContent = params.running ? 'Stop' : 'Start';
    });
    
    const resetButton = container.querySelector('#reset');
    resetButton.addEventListener('click', resetSimulation);
}

// Resize canvas to fit container
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    width = canvas.width;
    height = canvas.height;
}

// Start simulation loop
function startSimulation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    function animate() {
        updateSimulation();
        drawSimulation();
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
}

// Reset simulation
function resetSimulation() {
    params.particles = [];
    params.pattern.fill(0);
    params.maxIntensity = 1;
}

// Update simulation state
function updateSimulation() {
    if (!params.running) return;
    
    // Add new particles
    for (let i = 0; i < params.particleRate; i++) {
        params.particles.push({
            x: 0,
            y: height / 2,
            vx: params.particleSpeed,
            vy: 0,
            detected: false
        });
    }
    
    // Update particle positions
    params.particles = params.particles.filter(particle => {
        if (particle.detected) return false;
        
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Check if particle hits slit plane
        if (particle.x >= width * 0.3 && !particle.passedSlit) {
            particle.passedSlit = true;
            
            // Check if particle passes through either slit
            const y1 = height / 2 - params.slitSeparation / 2;
            const y2 = height / 2 + params.slitSeparation / 2;
            
            if (Math.abs(particle.y - y1) <= params.slitWidth / 2 ||
                Math.abs(particle.y - y2) <= params.slitWidth / 2) {
                // Particle passes through, calculate new trajectory
                const angle = (Math.random() - 0.5) * Math.PI / 8;
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                particle.vx = speed * Math.cos(angle);
                particle.vy = speed * Math.sin(angle);
            } else {
                // Particle hits barrier
                return false;
            }
        }
        
        // Check if particle hits screen
        if (particle.x >= width * 0.9) {
            // Record hit position in pattern
            const index = Math.floor((particle.y / height) * params.pattern.length);
            if (index >= 0 && index < params.pattern.length) {
                params.pattern[index]++;
                params.maxIntensity = Math.max(params.maxIntensity, params.pattern[index]);
            }
            particle.detected = true;
            return false;
        }
        
        return true;
    });
}

// Draw current state
function drawSimulation() {
    // Clear canvas
    ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw barrier
    ctx.fillStyle = '#666';
    ctx.fillRect(width * 0.3, 0, 10, height);
    
    // Draw slits
    ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
    const y1 = height / 2 - params.slitSeparation / 2;
    const y2 = height / 2 + params.slitSeparation / 2;
    ctx.fillRect(width * 0.3, y1 - params.slitWidth / 2, 10, params.slitWidth);
    ctx.fillRect(width * 0.3, y2 - params.slitWidth / 2, 10, params.slitWidth);
    
    // Draw screen
    ctx.fillStyle = '#666';
    ctx.fillRect(width * 0.9, 0, 10, height);
    
    // Draw particles
    if (!params.showWaveView) {
        ctx.fillStyle = '#ff0';
        params.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Draw interference pattern
    const patternWidth = 10;
    const step = height / params.pattern.length;
    
    if (params.showWaveView) {
        // Draw wave view
        ctx.strokeStyle = '#0ff';
        ctx.beginPath();
        ctx.moveTo(width * 0.9 + patternWidth, 0);
        
        for (let i = 0; i < params.pattern.length; i++) {
            const intensity = params.pattern[i] / params.maxIntensity;
            const x = width * 0.9 + patternWidth + intensity * 50;
            const y = i * step;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    } else {
        // Draw particle accumulation view
        for (let i = 0; i < params.pattern.length; i++) {
            const intensity = params.pattern[i] / params.maxIntensity;
            ctx.fillStyle = `rgba(255, 255, 0, ${intensity})`;
            ctx.fillRect(width * 0.9, i * step, patternWidth, step);
        }
    }
} 