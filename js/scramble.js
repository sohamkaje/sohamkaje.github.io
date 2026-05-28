/**
 * scramble.js
 * -----------
 * ASCII character scramble animation for the hero name.
 * Reads the final text from data-scramble on each .scramble-target,
 * shuffles through random printable ASCII chars, then locks letter by letter.
 */

(function () {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>?/|[]{}';
    const SCRAMBLE_DURATION = 600; // ms each char scrambles before locking
    const CHAR_STAGGER      = 80;  // ms between each character locking
    const SHUFFLE_INTERVAL  = 40;  // ms between random char swaps

    function randomChar() {
        return CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    /**
     * Scramble one line element.
     * @param {HTMLElement} lineEl   - container to fill with spans
     * @param {string}      word     - final text to resolve to
     * @param {number}      startDelay - ms before this word begins
     * @returns {number} total ms until this word is fully resolved
     */
    function scrambleLine(lineEl, word, startDelay) {
        lineEl.innerHTML = '';

        const spans = word.split('').map(ch => {
            const s = document.createElement('span');
            s.className = 'scramble-char scrambling';
            s.textContent = randomChar();
            lineEl.appendChild(s);
            return { el: s, final: ch };
        });

        // Start rapid shuffle after startDelay
        let shuffleTimer;
        setTimeout(() => {
            shuffleTimer = setInterval(() => {
                spans.forEach(({ el }) => {
                    if (el.classList.contains('scrambling')) {
                        el.textContent = randomChar();
                    }
                });
            }, SHUFFLE_INTERVAL);
        }, startDelay);

        // Lock each character in sequence
        spans.forEach(({ el, final }, i) => {
            const lockAt = startDelay + SCRAMBLE_DURATION + i * CHAR_STAGGER;
            setTimeout(() => {
                el.textContent = final;
                el.classList.remove('scrambling');
                // Stop shuffle once all chars are locked
                if (i === spans.length - 1) clearInterval(shuffleTimer);
            }, lockAt);
        });

        return startDelay + SCRAMBLE_DURATION + (word.length - 1) * CHAR_STAGGER;
    }

    window.addEventListener('DOMContentLoaded', () => {
        const line1 = document.getElementById('name-line-1');
        const line2 = document.getElementById('name-line-2');
        if (!line1 || !line2) return;

        const word1 = line1.dataset.scramble || 'Soham';
        const word2 = line2.dataset.scramble || 'Kaje';

        const word1End = scrambleLine(line1, word1, 200);
        // Start word 2 slightly before word 1 fully resolves for overlap feel
        scrambleLine(line2, word2, word1End - SCRAMBLE_DURATION + 150);
    });
})();
