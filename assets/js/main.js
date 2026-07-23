(() => {
  document.getElementById('year').textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Overlay nav */
  const menuBtn = document.getElementById('menuBtn');
  const overlayNav = document.getElementById('overlayNav');

  const closeNav = () => {
    overlayNav.dataset.open = 'false';
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  const openNav = () => {
    overlayNav.dataset.open = 'true';
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  menuBtn.addEventListener('click', () => {
    overlayNav.dataset.open === 'true' ? closeNav() : openNav();
  });
  overlayNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlayNav.dataset.open === 'true') closeNav();
  });

  /* Scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  /* Scroll progress bar */
  const scrollBar = document.getElementById('scrollBar');
  const updateScrollBar = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    scrollBar.style.width = `${Math.min(scrolled * 100, 100)}%`;
  };
  document.addEventListener('scroll', updateScrollBar, { passive: true });
  updateScrollBar();

  /* Cursor glow (fine pointers only) */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const glow = document.getElementById('cursorGlow');
    let raf = null;
    window.addEventListener('pointermove', (e) => {
      glow.classList.add('is-active');
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      });
    });
    document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
  }

  /* Magnetic buttons */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* Count-up stats */
  const statEls = document.querySelectorAll('.stat-num');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.countTo);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (reduceMotion || Number.isNaN(target)) return;
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = `${prefix}${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statEls.forEach(el => statObserver.observe(el));
  }
})();
