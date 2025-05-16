# Quantum Thought Lab

A modern, interactive web application for exploring quantum physics concepts through immersive visualizations and experiments.

## Overview

Quantum Thought Lab is a sophisticated browser-based platform that brings quantum physics to life through interactive simulations. Built with modern web technologies, it offers an accessible yet powerful environment for understanding complex quantum phenomena.

## Features

### Interactive Experiments

1. **Double-Slit Experiment**
   - Wave-particle duality visualization
   - Adjustable particle emission rate
   - Real-time interference pattern
   - Switchable particle/wave views

2. **Quantum Superposition**
   - Interactive Bloch sphere visualization
   - State vector manipulation
   - Real-time quantum measurements
   - Probability distribution display

3. **Quantum Entanglement**
   - Bell state visualization
   - Interactive measurement basis selection
   - Correlation statistics
   - Bell's inequality testing
   - 3D visualization with WebGL (with 2D fallback)

### Advanced Visualization

- WebGL-powered 3D graphics (with automatic fallback to 2D)
- Real-time state evolution
- Interactive control panels
- Dynamic measurement results
- Responsive design for all screen sizes

### Educational Features

- Built-in tutorials for each experiment
- Step-by-step guides
- Real-time statistics and measurements
- Visual feedback for quantum effects
- Comprehensive documentation

### Technical Features

- Modern ES6+ JavaScript
- WebGL/Canvas rendering
- Responsive CSS Grid/Flexbox layout
- Efficient state management
- Performance optimization

### Accessibility

- High contrast mode
- Screen reader support
- Keyboard navigation
- Configurable animation speeds
- Responsive touch controls
- Font size adjustment

### Performance

- Automatic performance optimization
- FPS monitoring
- Efficient rendering
- Resource management
- Lazy loading

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quantum-thought-lab.git
   cd quantum-thought-lab
   ```

2. Open `index.html` in a modern web browser.

No build process or server setup required!

## System Requirements

### Recommended Environment
- Modern browser with WebGL support
- Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
- 4GB RAM minimum
- Dedicated graphics recommended for 3D visualizations

### Minimum Requirements
- Any modern browser with ES6 support
- Basic 2D visualization support
- 2GB RAM
- Integrated graphics

## Usage

### Basic Navigation

1. Select an experiment from the home screen
2. Use the control panel to adjust parameters
3. Observe real-time visualizations
4. View statistics and measurements
5. Access tutorials via the help button

### Experiment-Specific Controls

#### Double-Slit Experiment
- Adjust particle rate
- Toggle wave/particle view
- Modify slit width
- Reset experiment

#### Quantum Superposition
- Rotate Bloch sphere
- Adjust phase and amplitude
- Perform measurements
- View probability distribution

#### Quantum Entanglement
- Select Bell states
- Choose measurement bases
- Observe correlations
- Test Bell's inequality

### Advanced Features

1. **Performance Settings**
   - Auto: Automatically adjusts quality
   - Quality: Maximizes visual fidelity
   - Performance: Optimizes for speed

2. **Accessibility Options**
   - High contrast mode
   - Animation speed control
   - Font size adjustment
   - Screen reader optimization

3. **Data Analysis**
   - Real-time statistics
   - Correlation measurements
   - Visual feedback
   - Performance metrics

## Development

### Project Structure
```
quantum-thought-lab/
├── index.html              # Main entry point
├── css/
│   ├── styles.css         # Core styles
│   └── responsive.css     # Responsive design
├── js/
│   ├── app.js            # Application core
│   └── experiments/      # Experiment modules
│       ├── double-slit.js
│       ├── quantum-superposition.js
│       └── quantum-entanglement.js
└── README.md
```

### Adding New Experiments

1. Create a new module in `js/experiments/`
2. Implement the standard interface:
   ```javascript
   export const tutorial = `...`;
   export function initialize(canvas, controls, config) { ... }
   export function cleanup() { ... }
   ```
3. Register the experiment in `app.js`
4. Add necessary styles in `css/styles.css`

### Best Practices

1. **Performance**
   - Use requestAnimationFrame
   - Implement cleanup functions
   - Optimize render loops
   - Cache DOM queries

2. **Accessibility**
   - Include ARIA labels
   - Support keyboard navigation
   - Provide text alternatives
   - Test with screen readers

3. **Code Quality**
   - Follow ES6+ standards
   - Document functions
   - Use meaningful names
   - Implement error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Add documentation
5. Submit pull request

## License

MIT License - See LICENSE file for details.

## Credits

Developed as part of the Quantum Thought Lab project. Inspired by quantum mechanics educational resources and modern web technologies.

## Contact

For questions, feedback, or contributions:
- Open an issue on GitHub
- Submit a pull request
- Contact the development team 