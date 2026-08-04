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
          target.querySelectorAll('.js-reveal, .js-stagger').forEach(el => el.classList.add('visible'));
          setTimeout(() => {
            const top = target.getBoundingClientRect().top + window.scrollY - 72;
            window.scrollTo({ top, behavior: 'smooth' });
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
      el.querySelectorAll('.js-reveal, .js-stagger').forEach(child => child.classList.add('visible'));
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
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
    // Reveal main block elements
    document.querySelectorAll('.js-reveal, .media-frame, .team-media-wrap').forEach(el => {
      revObs.observe(el);
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 30 && rect.bottom > 0) {
        setTimeout(() => el.classList.add('visible'), 120);
      }
    });

    // Reveal staggered grid cards
    document.querySelectorAll('.js-stagger').forEach(el => {
      stgObs.observe(el);
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 30 && rect.bottom > 0) {
        setTimeout(() => el.classList.add('visible'), 180);
      }
    });
  };

  if (document.body.classList.contains('loader-finished')) {
    startObserving();
  } else {
    window.addEventListener('loaderFinished', startObserving, { once: true });
    setTimeout(startObserving, 1500);
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

  const onScroll = () => {
    if (window.innerWidth <= 899) {
      track.style.transform = 'none';
      return;
    }

    const rect = container.getBoundingClientRect();
    const headerHeight = 76;
    const scrollableDist = container.offsetHeight - window.innerHeight;

    if (scrollableDist <= 0) return;

    // Calculate progress when top of container reaches header (rect.top <= headerHeight)
    const scrolled = headerHeight - rect.top;
    let progress = scrolled / scrollableDist;
    progress = Math.min(1, Math.max(0, progress));

    // Move horizontal track
    const maxTranslate = (totalPanels - 1) * window.innerWidth;
    const translateX = progress * maxTranslate;
    track.style.transform = `translateX(-${translateX}px)`;

    // Update progress bar fill
    const barWidth = 25 + (progress * 75);
    if (bar) bar.style.width = `${barWidth}%`;

    // Update step indicator (01 / 04, 02 / 04, 03 / 04, 04 / 04)
    currentPanelIndex = Math.min(totalPanels - 1, Math.max(0, Math.round(progress * (totalPanels - 1))));
    if (step) step.textContent = `0${currentPanelIndex + 1} / 0${totalPanels}`;

    // Reveal elements inside active horizontal panel
    const currentPanel = container.querySelectorAll('.horizontal-panel')[currentPanelIndex];
    if (currentPanel) {
      currentPanel.querySelectorAll('.js-reveal, .js-stagger').forEach(el => el.classList.add('visible'));
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // Navigation arrow buttons
  const scrollToPanel = (index) => {
    if (window.innerWidth <= 899) return;
    const targetIndex = Math.min(totalPanels - 1, Math.max(0, index));
    const headerHeight = 76;
    const scrollableDist = container.offsetHeight - (window.innerHeight - headerHeight);
    const targetProgress = targetIndex / (totalPanels - 1);
    const targetScrollY = (container.offsetTop - headerHeight) + (targetProgress * scrollableDist);

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
      if (targetId in navMap && window.innerWidth > 899) {
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
