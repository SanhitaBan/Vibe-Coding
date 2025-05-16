// Quantum Superposition Experiment Module
export const tutorial = `
    <h2>Quantum Superposition</h2>
    <p>This experiment demonstrates the concept of quantum superposition using a simple two-state system (qubit).</p>
    <ol>
        <li>Use the "Phase" slider to adjust the relative phase between states.</li>
        <li>Use the "Amplitude" slider to change the probability distribution.</li>
        <li>Click "Measure" to collapse the superposition into one of the basis states.</li>
        <li>Watch the Bloch sphere visualization to understand the state evolution.</li>
    </ol>
    <p>The quantum state is visualized both as a point on the Bloch sphere and as probability amplitudes.</p>
`;

// Simulation parameters
const params = {
    phase: 0,          // Phase angle (0 to 2π)
    theta: Math.PI/4,  // Amplitude angle (0 to π/2)
    measured: false,   // Whether the state has been measured
    measurementResult: null, // Result after measurement
    animating: false,  // Whether we're currently animating
    rotationSpeed: 0.02 // Speed of continuous rotation
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
    startAnimation();
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
            <label for="phase">Phase (φ)</label>
            <input type="range" id="phase" min="0" max="360" value="${params.phase * 180 / Math.PI}">
            <span class="value">${(params.phase * 180 / Math.PI).toFixed(1)}°</span>
        </div>
        <div class="control-group">
            <label for="theta">Amplitude (θ)</label>
            <input type="range" id="theta" min="0" max="90" value="${params.theta * 180 / Math.PI}">
            <span class="value">${(params.theta * 180 / Math.PI).toFixed(1)}°</span>
        </div>
        <div class="control-group">
            <button id="measure">Measure</button>
            <button id="reset">Reset</button>
        </div>
        <div class="control-group">
            <label>
                <input type="checkbox" id="animate">
                Animate Phase
            </label>
        </div>
        <div class="state-display">
            <h4>State Vector</h4>
            <div id="state-vector"></div>
            <h4>Probabilities</h4>
            <div id="probabilities"></div>
        </div>
    `;
    
    // Add event listeners
    const phaseInput = container.querySelector('#phase');
    phaseInput.addEventListener('input', (e) => {
        params.phase = (parseInt(e.target.value) * Math.PI / 180) % (2 * Math.PI);
        e.target.nextElementSibling.textContent = `${parseInt(e.target.value)}°`;
        updateStateDisplay();
    });
    
    const thetaInput = container.querySelector('#theta');
    thetaInput.addEventListener('input', (e) => {
        params.theta = parseInt(e.target.value) * Math.PI / 180;
        e.target.nextElementSibling.textContent = `${parseInt(e.target.value)}°`;
        updateStateDisplay();
    });
    
    const measureButton = container.querySelector('#measure');
    measureButton.addEventListener('click', measureState);
    
    const resetButton = container.querySelector('#reset');
    resetButton.addEventListener('click', resetState);
    
    const animateCheckbox = container.querySelector('#animate');
    animateCheckbox.addEventListener('change', (e) => {
        params.animating = e.target.checked;
    });
    
    // Initial state display
    updateStateDisplay();
}

// Resize canvas to fit container
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    width = canvas.width;
    height = canvas.height;
}

// Start animation loop
function startAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    function animate() {
        if (params.animating && !params.measured) {
            params.phase = (params.phase + params.rotationSpeed) % (2 * Math.PI);
            updateStateDisplay();
        }
        drawState();
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
}

// Reset quantum state
function resetState() {
    params.phase = 0;
    params.theta = Math.PI/4;
    params.measured = false;
    params.measurementResult = null;
    
    // Reset UI elements
    const phaseInput = document.querySelector('#phase');
    const thetaInput = document.querySelector('#theta');
    if (phaseInput) phaseInput.value = params.phase * 180 / Math.PI;
    if (thetaInput) thetaInput.value = params.theta * 180 / Math.PI;
    
    updateStateDisplay();
}

// Measure quantum state
function measureState() {
    if (params.measured) return;
    
    // Calculate probabilities
    const prob0 = Math.cos(params.theta) * Math.cos(params.theta);
    const prob1 = Math.sin(params.theta) * Math.sin(params.theta);
    
    // Random measurement based on probabilities
    params.measurementResult = Math.random() < prob0 ? 0 : 1;
    params.measured = true;
    
    // Update state to measured basis state
    params.theta = params.measurementResult === 0 ? 0 : Math.PI/2;
    params.phase = 0;
    
    updateStateDisplay();
}

// Update state display in control panel
function updateStateDisplay() {
    const stateVector = document.querySelector('#state-vector');
    const probabilities = document.querySelector('#probabilities');
    
    if (!stateVector || !probabilities) return;
    
    const cos = Math.cos(params.theta);
    const sin = Math.sin(params.theta);
    const phase = `e<sup>${params.phase.toFixed(2)}i</sup>`;
    
    if (params.measured) {
        stateVector.innerHTML = params.measurementResult === 0 ?
            '|ψ⟩ = |0⟩' :
            '|ψ⟩ = |1⟩';
        
        probabilities.innerHTML = params.measurementResult === 0 ?
            'P(0) = 1<br>P(1) = 0' :
            'P(0) = 0<br>P(1) = 1';
    } else {
        stateVector.innerHTML = `|ψ⟩ = ${cos.toFixed(3)}|0⟩ + ${sin.toFixed(3)}e<sup>${params.phase.toFixed(2)}i</sup>|1⟩`;
        probabilities.innerHTML = `P(0) = ${(cos * cos).toFixed(3)}<br>P(1) = ${(sin * sin).toFixed(3)}`;
    }
}

// Draw quantum state visualization
function drawState() {
    // Clear canvas
    ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    
    // Draw Bloch sphere
    drawBlochSphere(centerX, centerY, radius);
    
    // Draw state vector
    drawStateVector(centerX, centerY, radius);
    
    // Draw probability bars
    drawProbabilityBars(width * 0.1, height * 0.8, width * 0.8, height * 0.1);
}

// Draw Bloch sphere
function drawBlochSphere(x, y, radius) {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    
    // Draw main circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(x - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x, y + radius);
    ctx.stroke();
    
    // Label axes
    ctx.fillStyle = '#666';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('|0⟩', x, y - radius - 10);
    ctx.fillText('|1⟩', x, y + radius + 10);
}

// Draw state vector on Bloch sphere
function drawStateVector(x, y, radius) {
    if (params.measured) {
        // Draw measured state
        const endY = y + (params.measurementResult === 0 ? -radius : radius);
        
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, endY);
        ctx.stroke();
    } else {
        // Draw superposition state
        const vectorX = radius * Math.sin(params.theta) * Math.cos(params.phase);
        const vectorY = radius * Math.cos(params.theta);
        const vectorZ = radius * Math.sin(params.theta) * Math.sin(params.phase);
        
        // Project 3D coordinates to 2D
        const projectedX = x + vectorX;
        const projectedY = y - vectorY;
        
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(projectedX, projectedY);
        ctx.stroke();
        
        // Draw projection shadow
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(projectedX, projectedY);
        ctx.lineTo(projectedX, y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// Draw probability bars
function drawProbabilityBars(x, y, width, height) {
    const prob0 = params.measured ?
        (params.measurementResult === 0 ? 1 : 0) :
        Math.cos(params.theta) * Math.cos(params.theta);
    
    const prob1 = params.measured ?
        (params.measurementResult === 1 ? 1 : 0) :
        Math.sin(params.theta) * Math.sin(params.theta);
    
    // Draw background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, height);
    
    // Draw probability bars
    const barWidth = width / 2 - 10;
    
    // |0⟩ probability
    ctx.fillStyle = '#0f0';
    ctx.fillRect(x, y, barWidth, height * -prob0);
    
    // |1⟩ probability
    ctx.fillRect(x + width/2, y, barWidth, height * -prob1);
    
    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', x + barWidth/2, y + 20);
    ctx.fillText('|1⟩', x + width/2 + barWidth/2, y + 20);
} 