// Quantum Entanglement Experiment Module
export const tutorial = `
    <h2>Quantum Entanglement</h2>
    <p>Explore the fascinating world of quantum entanglement, where quantum particles share correlated states regardless of distance.</p>
    <ol>
        <li>Create a pair of entangled qubits</li>
        <li>Observe how measuring one qubit instantly affects its partner</li>
        <li>Experiment with different measurement bases</li>
        <li>Visualize Bell states and correlations</li>
        <li>Test Bell's inequality</li>
    </ol>
    <p>This experiment demonstrates the "spooky action at distance" that Einstein found so troubling!</p>
`;

// Simulation parameters
const params = {
    state: 'phi-plus', // One of: phi-plus, phi-minus, psi-plus, psi-minus
    measurementBasis: {
        qubit1: 'Z',   // Z, X, or Y basis
        qubit2: 'Z'
    },
    animationSpeed: 1,
    showStatistics: true,
    measurements: [],
    correlations: {
        total: 0,
        matching: 0
    }
};

// WebGL context and program info
let gl = null;
let programInfo = null;
let buffers = null;

// Animation frame ID for cleanup
let animationId = null;

// Initialize the experiment
export function initialize(canvas, controls, config) {
    // Initialize WebGL if available
    if (config.renderMode === '3d' && canvas.getContext('webgl')) {
        initWebGL(canvas);
    }
    
    // Setup controls
    setupControls(controls);
    
    // Start animation
    startAnimation(canvas, config);
}

// Clean up resources
export function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Initialize WebGL context and resources
function initWebGL(canvas) {
    try {
        gl = canvas.getContext('webgl');
        
        // Create shader program
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
            
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            varying lowp vec4 vColor;
            
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;
        
        const fsSource = `
            varying lowp vec4 vColor;
            
            void main(void) {
                gl_FragColor = vColor;
            }
        `;
        
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        
        programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        };
        
        // Initialize buffers
        buffers = initBuffers(gl);
        
    } catch (e) {
        console.error('WebGL initialization failed:', e);
        gl = null;
    }
}

// Setup control panel
function setupControls(container) {
    container.innerHTML = `
        <div class="control-group">
            <h4>Bell State</h4>
            <select id="bell-state">
                <option value="phi-plus">Φ⁺ (|00⟩ + |11⟩)/√2</option>
                <option value="phi-minus">Φ⁻ (|00⟩ - |11⟩)/√2</option>
                <option value="psi-plus">Ψ⁺ (|01⟩ + |10⟩)/√2</option>
                <option value="psi-minus">Ψ⁻ (|01⟩ - |10⟩)/√2</option>
            </select>
        </div>
        
        <div class="control-group">
            <h4>Qubit 1 Measurement</h4>
            <div class="basis-selection">
                <button data-basis="Z" class="active">Z Basis</button>
                <button data-basis="X">X Basis</button>
                <button data-basis="Y">Y Basis</button>
            </div>
        </div>
        
        <div class="control-group">
            <h4>Qubit 2 Measurement</h4>
            <div class="basis-selection">
                <button data-basis="Z" class="active">Z Basis</button>
                <button data-basis="X">X Basis</button>
                <button data-basis="Y">Y Basis</button>
            </div>
        </div>
        
        <div class="control-group">
            <button id="measure">Measure</button>
            <button id="reset">Reset Statistics</button>
        </div>
        
        <div class="statistics" id="statistics">
            <h4>Statistics</h4>
            <p>Total Measurements: <span id="total-measurements">0</span></p>
            <p>Correlation: <span id="correlation">0%</span></p>
        </div>
    `;
    
    // Add event listeners
    const bellStateSelect = container.querySelector('#bell-state');
    bellStateSelect.addEventListener('change', (e) => {
        params.state = e.target.value;
        resetState();
    });
    
    container.querySelectorAll('.basis-selection button').forEach(button => {
        button.addEventListener('click', (e) => {
            const basis = e.target.dataset.basis;
            const group = e.target.parentElement;
            const qubit = group.parentElement.querySelector('h4').textContent.includes('1') ? 'qubit1' : 'qubit2';
            
            // Update active button
            group.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            
            // Update measurement basis
            params.measurementBasis[qubit] = basis;
        });
    });
    
    const measureButton = container.querySelector('#measure');
    measureButton.addEventListener('click', performMeasurement);
    
    const resetButton = container.querySelector('#reset');
    resetButton.addEventListener('click', resetStatistics);
}

// Perform quantum measurement
function performMeasurement() {
    // Calculate measurement probabilities based on state and basis
    const result = calculateMeasurement();
    
    // Record result
    params.measurements.push(result);
    
    // Update statistics
    updateStatistics();
    
    // Trigger visualization update
    updateVisualization();
}

// Calculate measurement result based on quantum mechanics
function calculateMeasurement() {
    const { state, measurementBasis } = params;
    
    // Implement quantum mechanical calculation for measurement results
    // This is a simplified model for demonstration
    let result = {
        qubit1: Math.random() < 0.5 ? '0' : '1',
        qubit2: null,
        basis1: measurementBasis.qubit1,
        basis2: measurementBasis.qubit2
    };
    
    // Calculate correlated result for qubit2 based on Bell state
    switch (state) {
        case 'phi-plus':
            result.qubit2 = result.qubit1; // Perfect correlation in same basis
            break;
        case 'phi-minus':
            result.qubit2 = measurementBasis.qubit1 === measurementBasis.qubit2 ? 
                result.qubit1 : 
                (result.qubit1 === '0' ? '1' : '0');
            break;
        case 'psi-plus':
            result.qubit2 = result.qubit1 === '0' ? '1' : '0';
            break;
        case 'psi-minus':
            result.qubit2 = measurementBasis.qubit1 === measurementBasis.qubit2 ?
                (result.qubit1 === '0' ? '1' : '0') :
                result.qubit1;
            break;
    }
    
    return result;
}

// Update measurement statistics
function updateStatistics() {
    const { measurements } = params;
    const total = measurements.length;
    
    if (total === 0) return;
    
    // Calculate correlations
    const matching = measurements.filter(m => 
        m.basis1 === m.basis2 && m.qubit1 === m.qubit2
    ).length;
    
    params.correlations = {
        total,
        matching
    };
    
    // Update UI
    document.getElementById('total-measurements').textContent = total;
    document.getElementById('correlation').textContent = 
        `${((matching / total) * 100).toFixed(1)}%`;
}

// Reset statistics
function resetStatistics() {
    params.measurements = [];
    params.correlations = { total: 0, matching: 0 };
    updateStatistics();
}

// Animation loop
function startAnimation(canvas, config) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    function animate() {
        // Clear canvas
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        if (gl) {
            // 3D rendering with WebGL
            drawScene(gl, programInfo, buffers);
        } else {
            // 2D fallback
            draw2D(ctx, width, height);
        }
        
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
}

// 2D drawing fallback
function draw2D(ctx, width, height) {
    // Draw qubits
    const radius = Math.min(width, height) * 0.1;
    const spacing = width * 0.4;
    const centerY = height / 2;
    
    // Draw entanglement line
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(width/2 - spacing/2, centerY);
    ctx.lineTo(width/2 + spacing/2, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw qubits
    for (let i = 0; i < 2; i++) {
        const x = width/2 + (i === 0 ? -spacing/2 : spacing/2);
        
        // Draw qubit circle
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw measurement basis
        const basis = i === 0 ? params.measurementBasis.qubit1 : params.measurementBasis.qubit2;
        ctx.fillStyle = '#000';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(basis, x, centerY);
    }
    
    // Draw latest measurement result if available
    if (params.measurements.length > 0) {
        const latest = params.measurements[params.measurements.length - 1];
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(latest.qubit1, width/2 - spacing/2, centerY - radius - 20);
        ctx.fillText(latest.qubit2, width/2 + spacing/2, centerY - radius - 20);
    }
}

// Initialize shader program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    
    return shaderProgram;
}

// Load shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

// Initialize buffers for WebGL rendering
function initBuffers(gl) {
    // Create buffers for 3D visualization
    // This is a simplified version - you would want to add more complex geometry
    // for a full 3D visualization of the quantum states
    
    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
    ];
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    return {
        position: positionBuffer,
    };
}

// Draw the scene
function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Add WebGL rendering code here
    // This would include matrix transformations and actual drawing calls
    // For brevity, this is left as a placeholder
} 