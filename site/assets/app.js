/* HawkinsOps v3: tiny JS to enhance (not power) the site.
   - Modal open/close for expandable cards
   - Copy buttons for terminal blocks
   - Mobile nav toggle
*/
(function () {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const html = document.documentElement;

  // Theme toggle (saved preference, otherwise system preference)
  const themeToggle = $('#themeToggle');
  const savedTheme = localStorage.getItem('rh-theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const startTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  html.setAttribute('data-theme', startTheme);

  function updateThemeButton(theme) {
    if (!themeToggle) return;
    const next = theme === 'dark' ? 'light' : 'dark';
    themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
    themeToggle.setAttribute('aria-label', `Switch to ${next} mode`);
  }
  updateThemeButton(startTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('rh-theme', next);
      updateThemeButton(next);
    });
  }

  // Mobile nav
  const mobBtn = $('#mobBtn');
  const mobMenu = $('#mobMenu');
  if (mobBtn && mobMenu) {
    mobBtn.setAttribute('aria-expanded', 'false');
    mobBtn.setAttribute('aria-controls', 'mobMenu');
    mobBtn.addEventListener('click', () => {
      const open = mobMenu.getAttribute('data-open') === 'true';
      mobMenu.setAttribute('data-open', String(!open));
      mobMenu.style.display = open ? 'none' : 'block';
      mobBtn.setAttribute('aria-expanded', String(!open));
    });
  }

  // Active link highlight
  function normalizeNavPath(value) {
    const raw = String(value || '').trim();
    const noQuery = raw.split('#')[0].split('?')[0];
    const trimmed = noQuery.replace(/^https?:\/\/[^/]+/i, '').replace(/\\/g, '/').replace(/\/+$/, '');
    const leaf = (trimmed.split('/').pop() || '').trim();
    if (!leaf) return 'index.html';
    return leaf.includes('.') ? leaf.toLowerCase() : `${leaf.toLowerCase()}.html`;
  }

  const activePath = normalizeNavPath(location.pathname || '/');
  const navLinks = Array.from(
    new Set([
      ...$$('.nav-l a'),
      ...$$('#mobMenu a'),
      ...$$('.mob-menu a')
    ])
  );
  navLinks.forEach(a => {
    const hrefPath = normalizeNavPath(a.getAttribute('href') || '');
    const isActive = hrefPath === activePath;
    a.classList.toggle('act', isActive);
    if (isActive) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });

  // Copy wiring (supports dynamically injected modal content too)
  function wireCopy(root=document) {
    $$('button[data-copy]', root).forEach(btn => {
      if (btn.__wired) return;
      btn.__wired = true;

      btn.addEventListener('click', async () => {
        const targetId = btn.getAttribute('data-copy');
        const pre = targetId ? document.getElementById(targetId) : null;
        if (!pre) return;

        const text = pre.innerText || pre.textContent || '';
        try {
          await navigator.clipboard.writeText(text);
          const old = btn.textContent;
          btn.textContent = 'Copied';
          setTimeout(() => (btn.textContent = old), 900);
        } catch {
          // fallback: select text for manual copy
          const range = document.createRange();
          range.selectNodeContents(pre);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });
    });
  }
  wireCopy();

  // Scroll reveal utilities (disabled entirely when reduced motion is requested).
  const reducedMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  let revealObserver = null;
  const revealSelector = [
    '[data-reveal]',
    '.section-intro',
    '.panel-glass',
    '.listing-item',
    '.media-item',
    '.met',
    '.card',
    '.timeline li',
    '.tool-mark',
    '.proof-card',
    '.hero-proof',
    '.filter-shell'
  ].join(',');

  function prefersReducedMotion() {
    return Boolean(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function revealImmediately(el) {
    if (!el) return;
    el.classList.remove('reveal');
    el.classList.add('is-visible');
    el.style.removeProperty('--reveal-delay');
  }

  function ensureRevealObserver() {
    if (revealObserver || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  }

  function wireScrollReveal(root = document) {
    const targets = $$(revealSelector, root).filter((el) => !el.closest('#modalBg'));
    if (!targets.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      html.removeAttribute('data-reveal-active');
      targets.forEach(revealImmediately);
      return;
    }

    try {
      ensureRevealObserver();
      if (!revealObserver) throw new Error('reveal-observer-unavailable');
      html.setAttribute('data-reveal-active', 'true');
      targets.forEach((el, idx) => {
        if (el.dataset.revealBound === 'true') return;
        el.dataset.revealBound = 'true';
        el.classList.add('reveal');
        if (!el.style.getPropertyValue('--reveal-delay')) {
          el.style.setProperty('--reveal-delay', `${Math.min((idx % 4) * 40, 120)}ms`);
        }
        // Fail-safe: if observer callbacks never fire, do not leave content hidden.
        window.setTimeout(() => {
          if (!el.classList.contains('is-visible')) {
            el.classList.add('is-visible');
          }
        }, 1800 + Math.min(idx * 60, 420));
        revealObserver.observe(el);
      });
    } catch {
      html.removeAttribute('data-reveal-active');
      targets.forEach(revealImmediately);
    }
  }

  // Modal
  const modalBg = $('#modalBg');
  const modalTitle = $('#modalTitle');
  const modalBody = $('#modalBody');
  const modalClose = $('#modalClose');
  let lastFocused = null;

  function getFocusable(container) {
    return $$('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])', container)
      .filter(el => !el.hasAttribute('hidden'));
  }

  function trapFocus(e) {
    if (!modalBg || !modalBg.classList.contains('open') || e.key !== 'Tab') return;
    const focusable = getFocusable(modalBg);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function closeModal() {
    if (!modalBg) return;
    modalBg.classList.remove('open');
    modalBg.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function openModal(title, html) {
    if (!modalBg || !modalTitle || !modalBody) return;
    lastFocused = document.activeElement;
    modalTitle.textContent = title || 'DETAILS';
    modalBody.innerHTML = html || '';
    wireCopy(modalBody);
    modalBg.classList.add('open');
    modalBg.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (modalClose) {
      modalClose.focus();
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBg) {
    modalBg.addEventListener('click', (e) => {
      if (e.target === modalBg) closeModal();
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    trapFocus(e);
  });

  // Expandable cards: data-modal points to a <template> id
  $$('[data-modal]').forEach(el => {
    const tid = el.getAttribute('data-modal');
    const t = tid ? document.getElementById(tid) : null;
    if (!t) return;

    const title = el.getAttribute('data-modal-title') || el.textContent.trim().slice(0, 60);
    const html = t.innerHTML;

    el.addEventListener('click', () => openModal(title, html));

    // keyboard support if it's not a button
    if (el.tagName !== 'BUTTON' && el.tagName !== 'A') {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(title, html);
        }
      });
    }
  });

  // Load verified counts generated from PROOF_PACK/VERIFIED_COUNTS.md
  async function loadVerifiedCounts() {
    try {
      const response = await fetch('assets/verified-counts.json', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const counts = data && data.counts ? data.counts : null;
      if (!counts) return;

      const map = [
        ['count-detections', counts.detections],
        ['count-sigma', counts.sigma],
        ['count-wazuh', counts.wazuh],
        ['count-splunk', counts.splunk],
        ['count-ir', counts.ir]
      ];
      map.forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el && typeof value === 'number') {
          el.textContent = String(value);
          el.setAttribute("data-count-target", String(value));
          el.textContent = "0";
        }
      });

      const dateEl = document.getElementById('verified-date');
      if (dateEl && data.verified_on) {
        dateEl.textContent = data.verified_on;
      }

      const sourceEl = document.getElementById('verified-source');
      if (sourceEl && data.source_url) {
        sourceEl.href = data.source_url;
      }
      wireCountUp();
    } catch {
      // Keep static fallback values in the HTML.
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadVerifiedCounts);
  } else {
    loadVerifiedCounts();
  }

  function animateCount(el, target) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(target);
      return;
    }
    const duration = 900;
    const start = performance.now();
    const from = 0;
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(from + (target - from) * eased);
      el.textContent = String(val);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function wireCountUp() {
    const countEls = $$(".met-v[data-count-target]");
    if (!countEls.length) return;
    const seen = new WeakSet();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (seen.has(el)) return;
        const target = Number(el.getAttribute("data-count-target") || "0");
        if (Number.isFinite(target) && target >= 0) animateCount(el, target);
        seen.add(el);
      });
    }, { threshold: 0.35 });
    countEls.forEach((el) => io.observe(el));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireCountUp);
  } else {
    wireCountUp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => wireScrollReveal());
  } else {
    wireScrollReveal();
  }

  window.addEventListener('rh:content-updated', () => wireScrollReveal());

  if (reducedMotionQuery && typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', () => {
      if (prefersReducedMotion()) wireScrollReveal();
    });
  }
})();
