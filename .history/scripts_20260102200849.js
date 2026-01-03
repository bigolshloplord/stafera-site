// Shared site scripts: navigation toggle & active link handling
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const cluster = document.getElementById('nav-cluster');
  if (toggle && cluster) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      cluster.classList.toggle('open');
    });
  }
  // If we're on a project detail page (no hash in URL but file != index) mark Projects active.
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  if (navLinks.length) {
    const current = window.location.pathname.split('/').pop();
    if (current && current !== 'index.html') {
      const proj = navLinks.find(a => /#projects$/.test(a.getAttribute('href')));
      if (proj) proj.classList.add('active');
    } else {
      // On index: use IntersectionObserver for dynamic active highlighting if sections exist
      const sections = document.querySelectorAll('section[id]');
      if (sections.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              navLinks.forEach(l => l.classList.remove('active'));
              const link = navLinks.find(l => l.getAttribute('href') === `#${entry.target.id}`);
              if (link) link.classList.add('active');
            }
          });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
        sections.forEach(sec => observer.observe(sec));
      }
    }
  }
})();
