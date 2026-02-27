(function () {
    const DEFAULT_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';

    function parseBoolean(value, fallback) {
        if (value === undefined) return fallback;
        return value === 'true';
    }

    function uniqueCharsFromText(text) {
        const seen = new Set();
        const chars = [];
        text.split('').forEach((char) => {
            if (char === ' ' || seen.has(char)) return;
            seen.add(char);
            chars.push(char);
        });
        return chars;
    }

    function getRevealOrder(text, direction) {
        const indices = text
            .split('')
            .map((char, index) => ({ char, index }))
            .filter((item) => item.char !== ' ')
            .map((item) => item.index);

        if (direction === 'end') {
            return indices.reverse();
        }

        if (direction === 'center') {
            const center = Math.floor(text.length / 2);
            return indices.slice().sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
        }

        return indices;
    }

    function randomChar(pool) {
        if (!pool.length) return '';
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function renderText(element, displayText, revealedSet, markEncrypted) {
        const fragment = document.createDocumentFragment();

        displayText.split('').forEach((char, index) => {
            const letter = document.createElement('span');
            letter.className = 'decrypted-char';
            if (markEncrypted && char !== ' ' && !revealedSet.has(index)) {
                letter.classList.add('is-encrypted');
            }
            letter.textContent = char === ' ' ? '\u00a0' : char;
            fragment.appendChild(letter);
        });

        element.textContent = '';
        element.appendChild(fragment);
    }

    function setupDecryptedText(element) {
        const originalText = element.dataset.decryptText || element.textContent || '';
        const speed = Number(element.dataset.speed || 50);
        const maxIterations = Number(element.dataset.maxIterations || 10);
        const sequential = parseBoolean(element.dataset.sequential, false);
        const revealDirection = element.dataset.revealDirection || 'start';
        const useOriginalCharsOnly = parseBoolean(element.dataset.useOriginalCharsOnly, false);
        const animateOn = element.dataset.animateOn || 'hover';
        const customChars = element.dataset.characters || DEFAULT_CHARACTERS;
        const revealOrder = getRevealOrder(originalText, revealDirection);

        const charsPool = useOriginalCharsOnly
            ? uniqueCharsFromText(originalText)
            : customChars.split('');

        let revealed = new Set();
        let isAnimating = false;
        let hasAnimated = false;
        let loopId = null;
        let iteration = 0;

        element.setAttribute('aria-label', originalText);

        function stopLoop() {
            if (loopId) {
                clearInterval(loopId);
                loopId = null;
            }
        }

        function finishReveal() {
            stopLoop();
            isAnimating = false;
            renderText(element, originalText, new Set(revealOrder), false);
            element.classList.add('is-revealed');
        }

        function buildScrambledText() {
            return originalText
                .split('')
                .map((char, index) => {
                    if (char === ' ') return ' ';
                    if (revealed.has(index)) return char;
                    return randomChar(charsPool);
                })
                .join('');
        }

        function runReveal() {
            if (isAnimating) return;
            isAnimating = true;
            iteration = 0;
            revealed = new Set();
            element.classList.remove('is-revealed');

            loopId = setInterval(() => {
                if (sequential) {
                    const nextIndex = revealOrder.find((index) => !revealed.has(index));
                    if (nextIndex === undefined) {
                        finishReveal();
                        return;
                    }
                    revealed.add(nextIndex);
                    renderText(element, buildScrambledText(), revealed, true);
                    if (revealed.size >= revealOrder.length) {
                        finishReveal();
                    }
                    return;
                }

                renderText(element, buildScrambledText(), revealed, true);
                iteration += 1;
                if (iteration >= maxIterations) {
                    finishReveal();
                }
            }, speed);
        }

        function resetToOriginal() {
            if (isAnimating) stopLoop();
            isAnimating = false;
            revealed = new Set();
            renderText(element, originalText, revealed, false);
            element.classList.remove('is-revealed');
        }

        renderText(element, originalText, revealed, false);

        if (animateOn === 'hover' || animateOn === 'both') {
            element.addEventListener('mouseenter', runReveal);
            element.addEventListener('mouseleave', () => {
                if (animateOn === 'hover') {
                    resetToOriginal();
                }
            });
        }

        if (animateOn === 'view' || animateOn === 'both') {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting || hasAnimated) return;
                        hasAnimated = true;
                        runReveal();
                        observer.unobserve(entry.target);
                    });
                },
                { threshold: 0.2 }
            );
            observer.observe(element);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-decrypt-text]').forEach(setupDecryptedText);
    });
})();
