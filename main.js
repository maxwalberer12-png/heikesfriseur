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
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('main-nav') || document.getElementById('nav-menu');
  if (!burger || !nav) return;

  const open  = () => {
    nav.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Menü schließen');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Menü öffnen');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => nav.classList.contains('open') ? close() : open());
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) close();
  });
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
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  const stgObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const parent = en.target.parentElement;
      if (parent) {
        const siblings = [...parent.querySelectorAll('.js-stagger')];
        const idx = siblings.indexOf(en.target);
        en.target.style.transitionDelay = `${idx * 0.14}s`;
      }
      en.target.classList.add('visible');
      stgObs.unobserve(en.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

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


/* ══ FORM VALIDATION & HONEYPOT ════════════════════════ */
(function initFormValidation() {
  const form    = document.getElementById('booking-form');
  const nameEl  = document.getElementById('f-name');
  const contEl  = document.getElementById('f-contact');
  const privEl  = document.getElementById('f-privacy');
  const hpEl    = document.getElementById('hp-website');
  const submit  = document.getElementById('submit-btn');

  if (!form) return;

  const errName = document.getElementById('err-name');
  const errCont = document.getElementById('err-contact');
  const errPriv = document.getElementById('err-privacy');

  form.addEventListener('submit', e => {
    // Spam Honeypot Check
    if (hpEl && hpEl.value.trim() !== '') {
      e.preventDefault();
      return;
    }

    let isValid = true;

    // Validate Name
    if (!nameEl || !nameEl.value.trim()) {
      if (errName) errName.textContent = 'Bitte geben Sie Ihren Namen ein.';
      if (nameEl) nameEl.setAttribute('aria-invalid', 'true');
      isValid = false;
    } else {
      if (errName) errName.textContent = '';
      if (nameEl) nameEl.removeAttribute('aria-invalid');
    }

    // Validate Contact
    if (!contEl || !contEl.value.trim()) {
      if (errCont) errCont.textContent = 'Bitte E-Mail oder Telefonnummer angeben.';
      if (contEl) contEl.setAttribute('aria-invalid', 'true');
      isValid = false;
    } else {
      if (errCont) errCont.textContent = '';
      if (contEl) contEl.removeAttribute('aria-invalid');
    }

    // Validate Privacy Checkbox
    if (privEl && !privEl.checked) {
      if (errPriv) errPriv.textContent = 'Bitte bestätigen Sie die Datenschutzerklärung.';
      isValid = false;
    } else {
      if (errPriv) errPriv.textContent = '';
    }

    if (!isValid) {
      e.preventDefault();
      return;
    }

    if (submit) {
      submit.disabled = true;
      const t = submit.querySelector('.btn-text');
      if (t) t.textContent = 'Wird gesendet...';
    }
  });
})();

/* ══ FOOTER YEAR ═══════════════════════════════════════ */
(function initYear() {
  const el = document.getElementById('yr');
  if (el) el.textContent = new Date().getFullYear();
})();
