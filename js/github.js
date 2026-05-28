/**
 * github.js
 * ---------
 * Fetches real GitHub contribution data for a given username
 * and renders a heatmap grid into #contrib-graph.
 * Falls back to a second API if the first fails.
 */

(function () {
    const USERNAME = 'sohamkaje';

    const APIS = [
        `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`,
        `https://github-contributions.vercel.app/api?username=${USERNAME}`,
    ];

    // Blue palette matching the site theme (dark → bright)
    const LEVEL_COLORS = {
        0: { bg: '#0d1117', border: '#1a2635' },
        1: { bg: '#0e3a5c' },
        2: { bg: '#0969a2' },
        3: { bg: '#1d7cbb' },
        4: { bg: '#3b9dd4' },
    };

    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    /* ── Normalise API responses into a flat day array ── */
    function normalise(json) {
        if (json.contributions && Array.isArray(json.contributions)) {
            // jogruber: { contributions: [{date, count, level}] }
            return json.contributions;
        }
        if (json.weeks && Array.isArray(json.weeks)) {
            // vercel: { weeks: [{days: [{date, count, level}]}] }
            return json.weeks.flatMap(w => w.days || []);
        }
        return null;
    }

    /* ── Group flat days into Sun-aligned weeks ── */
    function toWeeks(days) {
        const padded = [];
        const firstDow = new Date(days[0].date + 'T00:00:00').getDay();
        for (let i = 0; i < firstDow; i++) padded.push(null);
        days.forEach(d => padded.push(d));
        const weeks = [];
        for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
        return weeks;
    }

    /* ── Build month label row ── */
    function buildMonthLabels(weeks, container) {
        let lastMonth = -1;
        weeks.forEach(week => {
            const el = document.createElement('div');
            el.className = 'contrib-month-label';
            const first = week.find(d => d);
            if (first) {
                const m = new Date(first.date + 'T00:00:00').getMonth();
                if (m !== lastMonth) { el.textContent = MONTH_NAMES[m]; lastMonth = m; }
            }
            container.appendChild(el);
        });
    }

    /* ── Build the cell grid ── */
    function buildGrid(weeks, container, tooltip) {
        weeks.forEach(week => {
            const col = document.createElement('div');
            col.className = 'contrib-week';
            week.forEach(day => {
                const cell = document.createElement('div');
                cell.className = 'contrib-day';
                if (day) {
                    const raw   = day.level ?? Math.min(Math.ceil(day.count / 3), 4);
                    const level = day.count === 0 ? 0 : Math.max(1, Math.min(raw, 4));
                    const col   = LEVEL_COLORS[level];
                    cell.style.background = col.bg;
                    if (col.border) cell.style.border = `1px solid ${col.border}`;
                    cell.dataset.date  = day.date;
                    cell.dataset.count = day.count;

                    cell.addEventListener('mousemove', e => {
                        const d     = new Date(day.date + 'T00:00:00');
                        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        tooltip.textContent = day.count === 0
                            ? `No contributions · ${label}`
                            : `${day.count} contribution${day.count !== 1 ? 's' : ''} · ${label}`;
                        tooltip.style.display = 'block';
                        tooltip.style.left    = (e.clientX + 14) + 'px';
                        tooltip.style.top     = (e.clientY - 32) + 'px';
                    });
                    cell.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
                } else {
                    cell.style.visibility = 'hidden';
                }
                col.appendChild(cell);
            });
            container.appendChild(col);
        });
    }

    /* ── Animate cells left-to-right ── */
    function animateCells(container) {
        const cells = container.querySelectorAll('.contrib-day:not([style*="hidden"])');
        cells.forEach((c, i) => {
            c.style.opacity   = '0';
            c.style.transform = 'scale(0.4)';
            c.style.transition = `opacity 0.35s ease ${i * 1.2}ms, transform 0.35s ease ${i * 1.2}ms`;
            // rAF lets the browser paint the initial hidden state first
            requestAnimationFrame(() => setTimeout(() => {
                c.style.opacity   = '1';
                c.style.transform = 'scale(1)';
            }, i * 1.2));
        });
    }

    /* ── Main ── */
    async function init() {
        const loading   = document.getElementById('contrib-loading');
        const container = document.getElementById('contrib-container');
        const graphEl   = document.getElementById('contrib-graph');
        const monthsEl  = document.getElementById('contrib-months');
        const totalEl   = document.getElementById('contrib-total');
        const tooltip   = document.getElementById('contrib-tooltip');
        if (!loading || !graphEl) return;

        let days = null;

        for (const url of APIS) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                days = normalise(await res.json());
                if (days) break;
            } catch (_) { continue; }
        }

        if (!days || !days.length) {
            loading.textContent = 'Could not load contribution data.';
            return;
        }

        const total = days.reduce((s, d) => s + (d ? d.count : 0), 0);
        const weeks = toWeeks(days);

        buildMonthLabels(weeks, monthsEl);
        buildGrid(weeks, graphEl, tooltip);

        totalEl.innerHTML = `<span>${total.toLocaleString()}</span> contributions in the last year`;
        loading.style.display   = 'none';
        container.style.display = 'block';

        animateCells(graphEl);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
