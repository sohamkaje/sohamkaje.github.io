// ════════════════════════════════════════════════════════════════
// Placeholder Image Generator
// ════════════════════════════════════════════════════════════════

// This generates SVG placeholder images for projects
// Replace these with actual screenshots later

function generatePlaceholder(width, height, text, color) {
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="${color}"/>
            <text x="50%" y="50%" 
                  font-family="DM Mono, monospace" 
                  font-size="14" 
                  fill="#5a83b8" 
                  text-anchor="middle" 
                  dominant-baseline="middle">
                ${text}
            </text>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

// Apply placeholders to project images on page load
document.addEventListener('DOMContentLoaded', () => {
    const projectImages = document.querySelectorAll('.project-image[data-placeholder]');
    
    projectImages.forEach((img, index) => {
        const colors = ['#0c1628', '#0e1e35', '#1a3155'];
        const color = colors[index % colors.length];
        const text = img.dataset.placeholder || 'Project Screenshot';
        
        img.src = generatePlaceholder(400, 300, text, color);
    });
});