(function () {
    function setupSectionSwitcher() {
        const panels = Array.from(document.querySelectorAll('.section-panel'));
        if (!panels.length) return;

        const panelById = new Map(panels.map((panel, index) => [panel.id, { panel, index }]));
        const panelLinks = Array.from(document.querySelectorAll('a[href^="#"]')).filter((link) => {
            const targetId = link.getAttribute('href').slice(1);
            return panelById.has(targetId);
        });
        const navLinks = panelLinks.filter((link) => link.hasAttribute('data-nav-link'));
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        function setPanelState(panel, active) {
            if (active) {
                panel.classList.add('is-active');
                panel.removeAttribute('aria-hidden');
            } else {
                panel.classList.remove('is-active');
                panel.setAttribute('aria-hidden', 'true');
            }
        }

        function setActiveNavLink(id) {
            navLinks.forEach((link) => {
                const isCurrent = link.getAttribute('href') === `#${id}`;
                link.classList.toggle('is-current', isCurrent);
                if (isCurrent) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }

        function getDirection(fromIndex, toIndex) {
            const delta = toIndex - fromIndex;
            if (delta === 0) {
                return { axis: 'x', forward: true };
            }
            if (Math.abs(delta) === 1) {
                return { axis: 'x', forward: delta > 0 };
            }
            return { axis: 'y', forward: delta > 0 };
        }

        function getDistance(axis) {
            if (axis === 'x') {
                return Math.min(Math.max(window.innerWidth * 0.14, 90), 200);
            }
            return Math.min(Math.max(window.innerHeight * 0.12, 70), 140);
        }

        function playTransition(fromPanel, toPanel, direction) {
            if (!fromPanel || fromPanel === toPanel || prefersReducedMotion.matches) {
                return Promise.resolve();
            }

            const axis = direction.axis === 'x' ? 'X' : 'Y';
            const distance = getDistance(direction.axis);
            const fromShift = direction.forward ? -distance : distance;
            const toStart = direction.forward ? distance : -distance;
            const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
            const duration = 600;

            setPanelState(toPanel, true);

            const outgoing = fromPanel.animate(
                [
                    { opacity: 1, transform: `translate${axis}(0px)` },
                    { opacity: 0, transform: `translate${axis}(${fromShift}px)` }
                ],
                { duration, easing, fill: 'forwards' }
            );

            const incoming = toPanel.animate(
                [
                    { opacity: 0, transform: `translate${axis}(${toStart}px)` },
                    { opacity: 1, transform: `translate${axis}(0px)` }
                ],
                { duration, easing, fill: 'forwards' }
            );

            return Promise.allSettled([outgoing.finished, incoming.finished]).then(() => {
                outgoing.cancel();
                incoming.cancel();
                fromPanel.style.opacity = '';
                fromPanel.style.transform = '';
                toPanel.style.opacity = '';
                toPanel.style.transform = '';
            });
        }

        let activeId = panels.find((panel) => panel.classList.contains('is-active'))?.id || panels[0].id;
        let isTransitioning = false;

        function activateSection(nextId, options = {}) {
            const { updateHash = true, animate = true } = options;
            if (!panelById.has(nextId) || nextId === activeId || isTransitioning) return;

            const currentEntry = panelById.get(activeId);
            const nextEntry = panelById.get(nextId);
            const fromPanel = currentEntry?.panel;
            const toPanel = nextEntry.panel;
            const direction = getDirection(currentEntry.index, nextEntry.index);

            isTransitioning = true;
            Promise.resolve(animate ? playTransition(fromPanel, toPanel, direction) : null)
                .then(() => {
                    if (fromPanel) setPanelState(fromPanel, false);
                    setPanelState(toPanel, true);
                    activeId = nextId;
                    setActiveNavLink(activeId);
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    if (updateHash) {
                        history.pushState(null, '', `#${nextId}`);
                    }
                })
                .finally(() => {
                    isTransitioning = false;
                });
        }

        panels.forEach((panel) => setPanelState(panel, panel.id === activeId));
        setActiveNavLink(activeId);

        const initialHash = window.location.hash.replace('#', '');
        if (panelById.has(initialHash) && initialHash !== activeId) {
            activateSection(initialHash, { updateHash: false, animate: false });
        }

        panelLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                activateSection(targetId, { updateHash: true, animate: true });
            });
        });

        window.addEventListener('hashchange', () => {
            const hashId = window.location.hash.replace('#', '');
            if (!panelById.has(hashId) || hashId === activeId) return;
            activateSection(hashId, { updateHash: false, animate: true });
        });
    }

    document.addEventListener('DOMContentLoaded', setupSectionSwitcher);
})();
