'use strict';

/* ══ INITIAL LOADER (CLEAN SILVER SCISSORS) ════════════ */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const hideLoader = () => {
    if (loader.classList.contains('loaded')) return;
    loader.classList.add('loaded');
    document.body.classList.add('loader-finished');
    window.dispatchEvent(new CustomEvent('loaderFinished'));
  };

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 850);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 850));
    setTimeout(hideLoader, 1600); // Safety fallback
  }
})();

/* ══ MOBILE NAV ════════════════════════════════════════ */
(function initMobileNav() {
  const burger   = document.getElementById('burger');
  const drawer   = document.getElementById('mobile-drawer') || document.getElementById('nav-menu');
  const closeBtn = document.getElementById('mobile-close');
  if (!burger || !drawer) return;

  const open = () => {
    drawer.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Menü schließen');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    drawer.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Menü öffnen');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => drawer.classList.contains('open') ? close() : open());
  if (closeBtn) closeBtn.addEventListener('click', close);

  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      close();
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          // Read-First: measure target position BEFORE DOM mutations
          const targetTop = target.getBoundingClientRect().top;
          const currentScrollY = window.scrollY;
          const scrollToPos = targetTop + currentScrollY - 72;

          // DOM Write: reveal elements
          target.querySelectorAll('.js-reveal, .js-stagger').forEach(el => el.classList.add('visible'));

          setTimeout(() => {
            window.scrollTo({ top: scrollToPos, behavior: 'smooth' });
          }, 120);
        }
      }
    });
  });

  document.addEventListener('keydown', e => e.key === 'Escape' && close());
})();

/* ══ SMOOTH SCROLL ═════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const targetId = a.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const el = document.querySelector(targetId);
      if (!el) return;
      e.preventDefault();

      // Read-First: measure layout before modifying classList
      const targetTop = el.getBoundingClientRect().top;
      const currentScrollY = window.scrollY;
      const scrollToPos = targetTop + currentScrollY - 72;

      // Batch DOM mutations
      el.querySelectorAll('.js-reveal, .js-stagger').forEach(child => child.classList.add('visible'));

      window.scrollTo({ top: scrollToPos, behavior: 'smooth' });
    });
  });
})();

/* ══ EDITORIAL SLOW SCROLL REVEAL ══════════════════════ */
(function initScrollReveal() {
  document.body.classList.add('js-enabled');

  const revObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('visible');
      revObs.unobserve(en.target);
    });
  }, { threshold: 0.01, rootMargin: '120px 0px 120px 0px' });

  const stgObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const parent = en.target.parentElement;
      if (parent) {
        const siblings = [...parent.querySelectorAll('.js-stagger')];
        const idx = siblings.indexOf(en.target);
        en.target.style.transitionDelay = `${idx * 0.12}s`;
      }
      en.target.classList.add('visible');
      stgObs.unobserve(en.target);
    });
  }, { threshold: 0.01, rootMargin: '120px 0px 120px 0px' });

  const startObserving = () => {
    // Pure IntersectionObserver observation — zero forced synchronous reflows at load
    document.querySelectorAll('.js-reveal, .media-frame, .team-media-wrap').forEach(el => revObs.observe(el));
    document.querySelectorAll('.js-stagger').forEach(el => stgObs.observe(el));
  };

  if (document.body.classList.contains('loader-finished')) {
    startObserving();
  } else {
    window.addEventListener('loaderFinished', startObserving, { once: true });
    setTimeout(startObserving, 1200);
  }
})();

/* ══ ACTIVE NAV INDICATOR ══════════════════════════════ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(l => {
        const href = l.getAttribute('href');
        if (href === `#${en.target.id}` || href === `index.html#${en.target.id}`) {
          l.classList.add('active');
        } else if (href.startsWith('#')) {
          l.classList.remove('active');
        }
      });
    });
  }, { rootMargin: '-30% 0px -50% 0px' });

  sections.forEach(s => obs.observe(s));
})();

/* ══ PINNED HORIZONTAL SCROLL CONTROLLER ════════════════ */
(function initPinnedHorizontalScroll() {
  const container = document.getElementById('horizontal-pin-container');
  const track     = document.getElementById('horizontal-track');
  const bar       = document.getElementById('h-progress');
  const step      = document.getElementById('h-step');
  const prev      = document.getElementById('h-prev');
  const next      = document.getElementById('h-next');

  if (!container || !track) return;

  const totalPanels = 4;
  let currentPanelIndex = 0;
  let ticking = false;

  // Cached layout metrics to avoid Layout Thrashing on scroll
  let cachedViewportWidth = window.innerWidth;
  let cachedViewportHeight = window.innerHeight;
  let cachedContainerHeight = 0;
  let cachedContainerOffsetTop = 0;
  let cachedPanels = [...container.querySelectorAll('.horizontal-panel')];

  const updateMetrics = () => {
    cachedViewportWidth = window.innerWidth;
    cachedViewportHeight = window.innerHeight;
    cachedContainerHeight = container.offsetHeight;
    cachedContainerOffsetTop = container.offsetTop;
  };

  const updateScrollState = () => {
    ticking = false;

    if (cachedViewportWidth <= 899) {
      track.style.transform = 'none';
      return;
    }

    // --- 1. STRIKTE READ-PHASE (Lese-Zugriffe) ---
    const rectTop = container.getBoundingClientRect().top;
    const headerHeight = 76;
    const scrollableDist = cachedContainerHeight - cachedViewportHeight;

    if (scrollableDist <= 0) return;

    // Calculate progress when top of container reaches header
    const scrolled = headerHeight - rectTop;
    let progress = scrolled / scrollableDist;
    progress = Math.min(1, Math.max(0, progress));

    const maxTranslate = (totalPanels - 1) * cachedViewportWidth;
    const translateX = progress * maxTranslate;
    const barWidth = 25 + (progress * 75);
    currentPanelIndex = Math.min(totalPanels - 1, Math.max(0, Math.round(progress * (totalPanels - 1))));
    const currentPanel = cachedPanels[currentPanelIndex];

    // --- 2. STRIKTE WRITE-PHASE (Schreib-Zugriffe) ---
    track.style.transform = `translateX(-${translateX}px)`;

    if (bar) bar.style.width = `${barWidth}%`;

    if (step) step.textContent = `0${currentPanelIndex + 1} / 0${totalPanels}`;

    if (currentPanel) {
      currentPanel.querySelectorAll('.js-reveal, .js-stagger').forEach(el => el.classList.add('visible'));
    }
  };

  const requestScrollUpdate = () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', () => {
    updateMetrics();
    requestScrollUpdate();
  }, { passive: true });

  const initAsync = () => {
    requestAnimationFrame(() => {
      updateMetrics();
      updateScrollState();
    });
  };

  if (document.readyState === 'complete') {
    initAsync();
  } else {
    window.addEventListener('load', initAsync, { once: true });
  }

  // Navigation arrow buttons
  const scrollToPanel = (index) => {
    if (cachedViewportWidth <= 899) return;
    const targetIndex = Math.min(totalPanels - 1, Math.max(0, index));
    const headerHeight = 76;
    const scrollableDist = cachedContainerHeight - (cachedViewportHeight - headerHeight);
    const targetProgress = targetIndex / (totalPanels - 1);
    const targetScrollY = (cachedContainerOffsetTop - headerHeight) + (targetProgress * scrollableDist);

    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
  };

  if (prev) prev.addEventListener('click', () => scrollToPanel(currentPanelIndex - 1));
  if (next) next.addEventListener('click', () => scrollToPanel(currentPanelIndex + 1));

  // Anchor links navigation mapping
  const navMap = {
    '#ueber-uns': 0,
    '#leistungen': 1,
    '#team': 2,
    '#termin': 3
  };

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const targetId = a.getAttribute('href');
      if (targetId in navMap && cachedViewportWidth > 899) {
        e.preventDefault();
        scrollToPanel(navMap[targetId]);
      }
    });
  });
})();

/* ══ FOOTER YEAR ═══════════════════════════════════════ */
(function initYear() {
  const el = document.getElementById('yr');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ══ MOBILE FLOAT CALL BUTTON DOCKING (STOP BEFORE FOOTER) ════ */
(function initMobileFloatCallDock() {
  const floatBtn = document.querySelector('.mobile-float-call');
  const footer   = document.querySelector('.footer');
  if (!floatBtn || !footer) return;

  const updatePosition = () => {
    if (window.innerWidth >= 900) return;
    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate how much of the footer is visible in the viewport
    const footerVisibleHeight = windowHeight - footerRect.top;
    
    if (footerVisibleHeight > 0) {
      // Footer is in view: dock button 20px above top edge of footer
      const newBottom = footerVisibleHeight + 20;
      floatBtn.style.bottom = `${newBottom}px`;
    } else {
      // Normal fixed position
      floatBtn.style.bottom = '';
    }
  };

  window.addEventListener('scroll', updatePosition, { passive: true });
  window.addEventListener('resize', updatePosition, { passive: true });
  updatePosition();
})();
