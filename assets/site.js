(() => {
  'use strict';

  const image = document.getElementById('editor-image');
  const narrowImage = document.getElementById('editor-image-narrow');
  const stage = document.querySelector('.product-stage');
  document.querySelectorAll('[data-editor-theme]').forEach((button) => {
    button.addEventListener('click', () => {
      const theme = button.dataset.editorTheme;
      image.src = `assets/editor-${theme}.webp`;
      narrowImage.srcset = `assets/editor-${theme}-narrow.webp`;
      image.alt = `PrivMark on macOS in ${theme} mode, editing Before the city wakes in Live view.`;
      stage.dataset.theme = theme;
      document.querySelectorAll('[data-editor-theme]').forEach((other) => {
        other.setAttribute('aria-pressed', String(other === button));
      });
    });
  });

  // Demos play by themselves once they scroll into view: the GIF is fetched
  // then, not with the page. Each has a Pause button (moving content over 5 s
  // must be pausable), and a paused demo stays paused. With reduced motion
  // they start as still posters and play only on request. Off-screen or in a
  // hidden tab they go back to the poster.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const demos = [...document.querySelectorAll('[data-demo]')].map((figure) => {
    const image = figure.querySelector('[data-gif]');
    const button = figure.querySelector('[data-demo-play]');
    return { figure, image, button, poster: image.getAttribute('src'), paused: reduceMotion, visible: false };
  });
  function show(demo, playing) {
    demo.image.src = playing ? demo.image.dataset.gif : demo.poster;
    // The label carries the state (Play / Pause), so no aria-pressed too —
    // a screen reader would hear "Pause demo, pressed".
    demo.button.textContent = playing ? 'Pause demo' : 'Play demo';
    demo.button.dataset.playing = String(playing);
  }
  const update = (demo) => show(demo, demo.visible && !demo.paused && !document.hidden);
  demos.forEach((demo) => {
    demo.button.hidden = false;
    demo.button.addEventListener('click', () => {
      demo.paused = demo.button.dataset.playing === 'true';
      update(demo);
    });
    demo.image.addEventListener('error', () => {
      if (demo.image.getAttribute('src') !== demo.poster) { demo.paused = true; update(demo); }
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const demo = demos.find((d) => d.figure === entry.target);
        if (!demo || demo.visible === entry.isIntersecting) return;
        demo.visible = entry.isIntersecting;
        update(demo);
      });
    }, { threshold: 0.35 });
    demos.forEach((demo) => observer.observe(demo.figure));
  }
  document.addEventListener('visibilitychange', () => demos.forEach(update));

  // Download links are written into the page when the site is published
  // (scripts/resolve-release-links.mjs, run by the sync workflow), so the page
  // makes no request to GitHub. Unresolved links point at the release page.

  // Windows visitors get the installer for their architecture as the main
  // button. Chrome and Edge on Windows on ARM report "Win64; x64" in the
  // User-Agent, so the architecture comes from Client Hints where the browser
  // has them; Firefox falls back to the User-Agent and its explicit ARM64 link.
  // Mobile visitors and other platforms choose from the list.
  async function windowsAsset() {
    const hints = navigator.userAgentData;
    if (hints && hints.getHighEntropyValues) {
      try {
        const { architecture } = await hints.getHighEntropyValues(['architecture']);
        if (architecture === 'arm') return 'windows-arm';
        if (architecture === 'x86') return 'windows-x64';
      } catch { /* Fall back to the User-Agent. */ }
    }
    return /ARM|aarch64/i.test(navigator.userAgent) ? 'windows-arm' : 'windows-x64';
  }

  const ua = navigator.userAgent;
  const mobile = /Android|iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!mobile && /Windows/i.test(ua)) {
    windowsAsset().then((key) => {
      const source = document.querySelector(`[data-asset="${key}"]`);
      if (!source) return;
      document.querySelectorAll('[data-primary-download]').forEach((link) => {
        link.href = source.href;
        link.querySelector('[data-download-label]').textContent =
          key === 'windows-arm' ? 'Download for Windows (ARM)' : 'Download for Windows';
      });
    });
  }
})();
