(function () {
    function setupSectionSwitcher() {
        const panels = document.querySelectorAll('.section-panel');
        if (!panels.length) return;

        function activateSection(id) {
            panels.forEach((panel) => {
                if (panel.id === id) {
                    panel.classList.add('is-active');
                    panel.removeAttribute('aria-hidden');
                } else {
                    panel.classList.remove('is-active');
                    panel.setAttribute('aria-hidden', 'true');
                }
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            const targetId = link.getAttribute('href').slice(1);
            const targetPanel = document.getElementById(targetId);
            if (!targetPanel) return;
            link.addEventListener('click', (event) => {
                event.preventDefault();
                activateSection(targetId);
            });
        });
    }

    function setCurrentYear() {
        const node = document.querySelector('[data-current-year]');
        if (node) node.textContent = new Date().getFullYear();
    }

    function setupRevealAnimations() {
        const elements = document.querySelectorAll('[data-animate]');
        if (!elements.length) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        elements.forEach((el) => observer.observe(el));
    }

    function runIntroSequence() {
        const overlay = document.getElementById('intro-overlay');
        const textNode = document.getElementById('intro-text');
        if (!overlay || !textNode) return;
        const message = 'Bienvenido a nuestro portafolio de evidencias';
        const letters = message.split('');
        textNode.textContent = '';
        let index = 0;

        function type() {
            const span = document.createElement('span');
            span.className = 'intro-letter';
            span.textContent = letters[index] === ' ' ? '\u00a0' : letters[index];
            textNode.appendChild(span);
            index += 1;
            if (index < letters.length) {
                setTimeout(type, 80);
            } else {
                setTimeout(() => {
                    textNode.textContent = message;
                    overlay.classList.add('is-hidden');
                }, 900);
            }
        }

        type();
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupSectionSwitcher();
        setCurrentYear();
        setupRevealAnimations();
        runIntroSequence();
    });
})();
