(function () {
    function setupPillNav() {
        const navContainer = document.querySelector('.pill-nav-container');
        const button = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (!navContainer || !button || !mobileMenu) return;

        let isOpen = false;

        function setOpenState(next) {
            isOpen = next;
            button.setAttribute('aria-expanded', String(isOpen));
            mobileMenu.hidden = !isOpen;
            navContainer.classList.toggle('is-menu-open', isOpen);
        }

        button.addEventListener('click', () => {
            setOpenState(!isOpen);
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                setOpenState(false);
            });
        });

        document.addEventListener('click', (event) => {
            if (!isOpen) return;
            if (!navContainer.contains(event.target)) {
                setOpenState(false);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isOpen) {
                setOpenState(false);
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && isOpen) {
                setOpenState(false);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', setupPillNav);
})();
