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

  document.querySelectorAll('[data-sample-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-sample-mode]').forEach((other) => {
        other.setAttribute('aria-pressed', String(other === button));
      });
      document.getElementById('sample-preview').hidden = button.dataset.sampleMode !== 'preview';
      document.getElementById('sample-source').hidden = button.dataset.sampleMode !== 'source';
    });
  });

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
