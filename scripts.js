// Shared site scripts: navigation toggle & active link handling
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const cluster = document.getElementById('nav-cluster');
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const isMobileNav = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;

  function setActiveLink(link) {
    if (!navLinks.length) return;
    navLinks.forEach(l => {
      l.classList.remove('active');
      l.removeAttribute('aria-current');
    });
    if (link) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  }

  function isMenuOpen() {
    return !!(toggle && toggle.getAttribute('aria-expanded') === 'true');
  }

  function applyMenuVisibility(open, opts) {
    const options = opts || {};
    if (!toggle || !cluster) return;

    toggle.setAttribute('aria-expanded', String(open));
    cluster.classList.toggle('open', open);

    // On small screens, the menu is a popover; keep it out of the accessibility tree when closed.
    if (isMobileNav && isMobileNav.matches) {
      cluster.hidden = !open;
    } else {
      cluster.hidden = false;
    }

    if (!open && options.returnFocus !== false) {
      toggle.focus();
    }
  }

  function openMenu() {
    if (!toggle || !cluster) return;
    applyMenuVisibility(true, { returnFocus: false });
    const firstLink = cluster.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu(options) {
    applyMenuVisibility(false, options);
  }

  function toggleMenu() {
    if (!toggle || !cluster) return;
    if (isMenuOpen()) closeMenu();
    else openMenu();
  }

  if (toggle && cluster) {
    // Ensure correct initial state.
    applyMenuVisibility(false, { returnFocus: false });

    toggle.addEventListener('click', toggleMenu);

    // Close after choosing a nav link on mobile.
    cluster.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest('a') && isMobileNav && isMobileNav.matches) {
        closeMenu({ returnFocus: false });
      }
    });

    // Close on Escape.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen() && isMobileNav && isMobileNav.matches) {
        e.preventDefault();
        closeMenu();
      }
    });

    // Close if clicking outside.
    document.addEventListener('pointerdown', (e) => {
      if (!isMenuOpen() || !(isMobileNav && isMobileNav.matches)) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (cluster.contains(target) || toggle.contains(target)) return;
      closeMenu({ returnFocus: false });
    });

    // Basic focus trap for the mobile popover.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      if (!isMenuOpen() || !(isMobileNav && isMobileNav.matches)) return;

      const focusables = Array.from(cluster.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'))
        .filter(el => el instanceof HTMLElement && !el.hasAttribute('disabled'));
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        toggle.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        toggle.focus();
      }
    });

    // Keep visibility in sync when crossing breakpoints.
    if (isMobileNav && typeof isMobileNav.addEventListener === 'function') {
      isMobileNav.addEventListener('change', () => {
        // If entering mobile view, close menu by default.
        if (isMobileNav.matches) closeMenu({ returnFocus: false });
        else applyMenuVisibility(false, { returnFocus: false });
      });
    }
  }
  // If we're on a project detail page (no hash in URL but file != index) mark Projects active.
  if (navLinks.length) {
    const current = window.location.pathname.split('/').pop();
    if (current && current !== 'index.html') {
      const proj = navLinks.find(a => /#projects$/.test(a.getAttribute('href')));
      if (proj) setActiveLink(proj);
    } else {
      // On index: use IntersectionObserver for dynamic active highlighting if sections exist
      const sections = document.querySelectorAll('section[id]');
      if (sections.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const link = navLinks.find(l => l.getAttribute('href') === `#${entry.target.id}`);
              if (link) setActiveLink(link);
            }
          });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
        sections.forEach(sec => observer.observe(sec));
      }
    }
  }
})();
