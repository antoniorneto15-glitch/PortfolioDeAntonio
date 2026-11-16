(() => {
  function isValidImage(img) {
    if (!img || !(img instanceof HTMLImageElement)) return false;
    const src = (img.getAttribute('src') || '').trim();
    if (!src) return false;
    return true;
  }

  function createLightbox() {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('aria-hidden', 'true');

    const inner = document.createElement('div');
    inner.className = 'lightbox__inner';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lightbox__close';
    closeBtn.setAttribute('aria-label', 'Fechar imagem ampliada');
    closeBtn.innerHTML = '&times;';

    const img = document.createElement('img');
    img.className = 'lightbox__img';
    img.alt = '';

    inner.appendChild(closeBtn);
    inner.appendChild(img);
    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    return { overlay, img, closeBtn };
  }

  function init() {
    const targets = Array.from(document.querySelectorAll('#curriculo .photo-box img, .atividades img'))
      .filter(isValidImage);

    if (!targets.length) return;

    const { overlay, img: lightboxImg, closeBtn } = createLightbox();
    let lastFocused = null;

    function open(imgEl) {
      lastFocused = document.activeElement;
      lightboxImg.src = imgEl.currentSrc || imgEl.src;
      lightboxImg.alt = imgEl.alt || 'Imagem ampliada';
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      closeBtn.focus();
    }

    function close() {
      if (!overlay.classList.contains('is-open')) return;
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      lightboxImg.src = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    targets.forEach((imgEl) => {
      imgEl.classList.add('zoomable-image');
      imgEl.setAttribute('tabindex', '0');
      imgEl.setAttribute('role', 'button');
      if (!imgEl.getAttribute('aria-label')) {
        const label = imgEl.alt ? `Ampliar imagem: ${imgEl.alt}` : 'Ampliar imagem';
        imgEl.setAttribute('aria-label', label);
      }
      imgEl.addEventListener('click', () => open(imgEl));
      imgEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(imgEl);
        }
      });
    });

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
