/**
 * HALO REACH HEX GRID SYSTEM
 * Animated hexagonal grid with lighting patterns
 */

class HexGrid {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Hex geometry
        this.hexRadius = 40;
        this.hexHeight = this.hexRadius * 2;
        this.hexWidth = Math.sqrt(3) * this.hexRadius;
        this.vertDistance = this.hexHeight * 0.75;
        this.horizDistance = this.hexWidth;
        
        // Colors (Halo cyan/teal palette)
        this.colors = {
            bg: '#080b12',
            dim: 'rgba(31, 58, 71, 0.15)',      // Dim state
            glow: 'rgba(102, 252, 241, 0.6)',    // Active glow
            highlight: 'rgba(102, 252, 241, 0.9)', // Bright highlight
            accent: 'rgba(255, 153, 0, 0.5)'     // Orange accent
        };
        
        this.hexagons = [];
        this.patterns = [];
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.generateHexGrid();
        this.initializePatterns();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cols = Math.ceil(this.canvas.width / this.horizDistance) + 2;
        this.rows = Math.ceil(this.canvas.height / this.vertDistance) + 2;
    }
    
    generateHexGrid() {
        this.hexagons = [];
        
        for (let row = -1; row < this.rows; row++) {
            for (let col = -1; col < this.cols; col++) {
                const x = col * this.horizDistance + (row % 2) * (this.horizDistance / 2);
                const y = row * this.vertDistance;
                
                this.hexagons.push({
                    x: x,
                    y: y,
                    row: row,
                    col: col,
                    segments: this.createHexSegments(x, y),
                    intensity: Math.random() * 0.3, // Base dim intensity
                    targetIntensity: 0,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
    }
    
    createHexSegments(cx, cy) {
        // Create 6 line segments that form the hexagon
        const segments = [];
        const r = this.hexRadius;
        
        for (let i = 0; i < 6; i++) {
            const angle1 = (Math.PI / 3) * i - Math.PI / 6;
            const angle2 = (Math.PI / 3) * (i + 1) - Math.PI / 6;
            
            segments.push({
                x1: cx + r * Math.cos(angle1),
                y1: cy + r * Math.sin(angle1),
                x2: cx + r * Math.cos(angle2),
                y2: cy + r * Math.sin(angle2),
                intensity: 0
            });
        }
        
        return segments;
    }
    
    initializePatterns() {
        // Pattern 1: Wave pattern (like Halo Reach scanning effect)
        this.patterns.push({
            type: 'wave',
            speed: 0.0008,
            update: (time, hex) => {
                const wave = Math.sin(hex.x * 0.01 + hex.y * 0.01 + time * 0.002);
                return Math.max(0, wave) * 0.7;
            }
        });
        
        // Pattern 2: Radial pulse from center
        this.patterns.push({
            type: 'pulse',
            speed: 0.001,
            center: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
            update: (time, hex) => {
                const dx = hex.x - window.innerWidth / 2;
                const dy = hex.y - window.innerHeight / 2;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const pulse = Math.sin(dist * 0.015 - time * 0.003);
                return Math.max(0, pulse) * 0.6;
            }
        });
        
        // Pattern 3: Random flickers (like electrical interference)
        this.patterns.push({
            type: 'flicker',
            update: (time, hex) => {
                if (Math.random() < 0.002) {
                    return Math.random() * 0.8;
                }
                return 0;
            }
        });
        
        // Pattern 4: Diagonal sweeps
        this.patterns.push({
            type: 'sweep',
            speed: 0.0015,
            update: (time, hex) => {
                const diagonal = hex.x + hex.y;
                const sweep = Math.sin(diagonal * 0.008 + time * 0.0025);
                return Math.max(0, sweep) * 0.5;
            }
        });
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        // Update each hexagon's target intensity based on active patterns
        this.hexagons.forEach(hex => {
            let totalIntensity = 0.1; // Base dim glow
            
            // Combine all pattern influences
            this.patterns.forEach(pattern => {
                totalIntensity += pattern.update(this.time, hex);
            });
            
            // Add subtle breathing effect
            const breathe = Math.sin(this.time * 0.0005 + hex.phase) * 0.1 + 0.1;
            totalIntensity += breathe;
            
            hex.targetIntensity = Math.min(1, totalIntensity);
            
            // Smooth interpolation
            hex.intensity += (hex.targetIntensity - hex.intensity) * 0.1;
            
            // Update individual segment intensities with variation
            hex.segments.forEach((seg, i) => {
                const variation = Math.sin(this.time * 0.001 + hex.phase + i) * 0.2;
                seg.intensity = Math.max(0, hex.intensity + variation);
            });
        });
    }
    
    draw() {
        // Clear with background color
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all hexagons
        this.hexagons.forEach(hex => {
            this.drawHex(hex);
        });
    }
    
    drawHex(hex) {
        const ctx = this.ctx;
        
        // Draw each segment of the hexagon
        hex.segments.forEach(seg => {
            if (seg.intensity < 0.05) return; // Skip very dim segments
            
            const intensity = seg.intensity;
            
            // Determine color based on intensity
            let color;
            if (intensity > 0.7) {
                // Bright - use highlight color with bloom
                color = this.colors.highlight;
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.colors.glow;
            } else if (intensity > 0.4) {
                // Medium - use glow color
                color = this.colors.glow;
                ctx.shadowBlur = 4;
                ctx.shadowColor = this.colors.glow;
            } else {
                // Dim - use dim color
                color = this.colors.dim;
                ctx.shadowBlur = 0;
            }
            
            // Draw the line segment
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = Math.min(1, intensity);
            
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
            
            // Reset shadow
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        });
    }
    
    animate() {
        this.update(16); // ~60fps
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HexGrid('hex-canvas');
});