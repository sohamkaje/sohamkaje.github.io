/**
 * projects.js
 * -----------
 * Reads every file listed in PROJECT_FILES (in display order), fetches its JSON,
 * then renders a project card in #projects-grid and a modal in
 * #modals-container. To add a new project, drop a JSON file in js/projects/
 * and add its filename to the list below in the desired position.
 */

const PROJECT_FILES = [
    '008-mridangam.json',
    '013-travel-mapper.json',
    '012-havyaka.json',
    '011-timecapsule.json',
    '010-insurance.json',
    '001-cybench.json',
    '009-acm.json',
    '002-fraud.json',
    '007-deepblue.json',
    '004-messenger.json',
    '003-meals.json',
    '006-archivebot.json',
    '005-dijkstra.json',
];

const BASE = './js/projects/';

/* ── Builders ─────────────────────────────────────────────────── */

function buildCard(p) {
    return `
    <div class="project-card fade-up" onclick="openModal('${p.id}')">
        <img src="${p.image}" alt="${p.title}" class="project-image" data-placeholder="${p.imagePlaceholder}">
        <div class="project-number">${p.number}</div>
        <div class="project-title">${p.title}</div>
        <div class="project-category">${p.category}</div>
        <p class="project-desc">${p.description}</p>
        <div class="project-tags">
            ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
        </div>
        <span class="project-open">View details →</span>
    </div>`;
}

function buildModal(p) {
    const sections = p.sections.map(s => `
        <div class="modal-section-head">${s.heading}</div>
        <ul>
            ${s.bullets.map(b => `<li>${b}</li>`).join('\n            ')}
        </ul>`).join('');

    const githubLink = p.github
        ? `<a href="${p.github}" target="_blank" class="modal-link">View on GitHub ↗</a>`
        : '';

    const inProgressBanner = p.inProgress ? `
        <div style="padding:1rem; background:var(--surface2); border-left:3px solid var(--accent); margin-top:1.5rem;">
            <p style="font-size:0.75rem; color:var(--subtle); margin:0;">🚧 This project is currently in development. Check back soon for updates!</p>
        </div>` : '';

    return `
    <div class="modal-overlay" id="modal-${p.id}">
        <div class="modal">
            <button class="modal-close" onclick="closeModal('${p.id}')">Close ✕</button>
            <div class="modal-num">Project ${p.number}</div>
            <div class="modal-title">${p.title}</div>
            <div class="modal-cat">${p.modalSubtitle}</div>
            <div class="modal-divider"></div>
            <div class="modal-body">
                <div class="modal-section-head">Overview</div>
                <p>${p.overview}</p>
                ${sections}
                <div class="modal-section-head">Technologies</div>
                <div class="modal-tags">
                    ${p.modalTags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
                </div>
                ${githubLink}
                ${inProgressBanner}
            </div>
        </div>
    </div>`;
}

/* ── Loader ───────────────────────────────────────────────────── */

async function loadProjects() {
    const grid      = document.getElementById('projects-grid');
    const modals    = document.getElementById('modals-container');

    const results = await Promise.all(
        PROJECT_FILES.map(f =>
            fetch(BASE + f)
                .then(r => r.ok ? r.json() : null)
                .catch(() => null)
        )
    );

    results.filter(Boolean).forEach((p, i) => {
        const display = { ...p, number: String(i + 1).padStart(3, '0') };
        grid.insertAdjacentHTML('beforeend', buildCard(display));
        modals.insertAdjacentHTML('beforeend', buildModal(display));
    });

    // Re-run fade-up observer on newly created cards
    document.querySelectorAll('.fade-up:not(.observed)').forEach(el => {
        el.classList.add('observed');
        fadeObserver.observe(el);
    });

    // Re-init placeholder images
    if (typeof initPlaceholders === 'function') initPlaceholders();
}

// Shared IntersectionObserver so animations.js can also use it
const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });

document.addEventListener('DOMContentLoaded', loadProjects);
