// ════════════════════════════════════════════════════════════════
// Scroll Animations
// ════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { 
        threshold: 0.08 
    });

    // Observe all fade-up elements with staggered delays
    document.querySelectorAll('.fade-up').forEach((el, i) => {
        el.style.transitionDelay = (i % 3) * 0.1 + 's';
        observer.observe(el);
    });
});