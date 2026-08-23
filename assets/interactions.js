(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const state = { items: [], index: 0, overlay: null, image: null, caption: null, counter: null, revealObserver: null };

  const css = document.createElement('style');
  css.textContent = `
    @media (pointer: fine) {
      img[data-zoomable] { cursor: zoom-in; }
      a:hover, button:hover, [role="button"]:hover { transform: translateY(-2px); }
    }
    .js-interaction-card {
      transform: translateZ(0);
      transition: transform .42s cubic-bezier(.23,1,.32,1), box-shadow .42s cubic-bezier(.23,1,.32,1), border-color .32s ease;
      will-change: transform;
    }
    .js-interaction-card:hover, .js-interaction-card:focus-within {
      transform: translateY(-6px);
      box-shadow: 0 18px 42px rgba(23,22,20,.16);
    }
    .js-interaction-card img { transition: transform .6s cubic-bezier(.23,1,.32,1), filter .4s ease; }
    .js-interaction-card:hover img, .js-interaction-card:focus-within img { transform: scale(1.045); filter: saturate(1.08) contrast(1.03); }
    .js-reveal { opacity: 0; transform: translateY(22px); transition: opacity .72s ease, transform .72s cubic-bezier(.23,1,.32,1); }
    .js-reveal.is-inview { opacity: 1; transform: none; }
    @media (prefers-reduced-motion: reduce) {
      .js-reveal { opacity: 1; transform: none; }
      .js-interaction-card, .js-interaction-card img { transition: none !important; }
    }
    #portfolio-lightbox {
      position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center;
      padding: clamp(1rem,3vw,3rem); background: rgba(10,12,11,.94);
      opacity: 0; pointer-events: none; visibility: hidden; transition: opacity .28s ease, visibility .28s ease;
    }
    #portfolio-lightbox.is-open { opacity: 1; pointer-events: auto; visibility: visible; }
    #portfolio-lightbox .lightbox-stage { position: relative; display: grid; place-items: center; width: min(94vw,1180px); height: min(88vh,900px); }
    #portfolio-lightbox .lightbox-image { max-width: 100%; max-height: 100%; object-fit: contain; border: 1px solid rgba(241,238,232,.22); box-shadow: 0 30px 90px rgba(0,0,0,.46); cursor: zoom-in; user-select: none; }
    #portfolio-lightbox .lightbox-image.is-zoomed { max-width: none; max-height: none; width: min(150vw,1800px); height: min(150vh,1400px); cursor: zoom-out; }
    #portfolio-lightbox .lightbox-toolbar { position: absolute; inset: auto 0 -3.3rem; display: flex; align-items: center; justify-content: center; gap: .55rem; color: #f1eee8; font: 500 .68rem/1.2 "DM Mono",monospace; letter-spacing: .12em; text-transform: uppercase; }
    #portfolio-lightbox button { display: inline-grid; place-items: center; min-width: 2.45rem; min-height: 2.45rem; padding: .5rem .72rem; border: 1px solid rgba(241,238,232,.36); color: #f1eee8; background: rgba(23,22,20,.72); cursor: pointer; }
    #portfolio-lightbox button:hover, #portfolio-lightbox button:focus-visible { border-color: #e4492e; background: #e4492e; outline: none; }
    #portfolio-lightbox .lightbox-caption { position: absolute; inset: 1rem auto auto 1rem; max-width: min(70vw,38rem); color: #f1eee8; font: 500 .68rem/1.4 "DM Mono",monospace; letter-spacing: .12em; text-transform: uppercase; }
    #portfolio-lightbox .lightbox-close { position: absolute; top: 1rem; right: 1rem; z-index: 2; }
    body.lightbox-open { overflow: hidden; }
    @media (max-width:640px) { #portfolio-lightbox { padding: .8rem; } #portfolio-lightbox .lightbox-stage { width: 100vw; height: 78vh; } #portfolio-lightbox .lightbox-toolbar { bottom: -3.5rem; } #portfolio-lightbox .lightbox-caption { top: .7rem; left: .7rem; right: 4rem; } }
  `;
  document.head.appendChild(css);

  function imageList() {
    return Array.from(document.images).filter((image) => !image.closest('#portfolio-lightbox'));
  }

  function createLightbox() {
    if (state.overlay) return;
    const overlay = document.createElement('div');
    overlay.id = 'portfolio-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Visionneuse d’images');
    overlay.innerHTML = `
      <div class="lightbox-stage">
        <p class="lightbox-caption"></p>
        <img class="lightbox-image" alt="" />
        <button class="lightbox-close" type="button" aria-label="Fermer la visionneuse">×</button>
        <div class="lightbox-toolbar">
          <button class="lightbox-prev" type="button" aria-label="Image précédente">←</button>
          <span class="lightbox-counter" aria-live="polite"></span>
          <button class="lightbox-next" type="button" aria-label="Image suivante">→</button>
          <button class="lightbox-zoom" type="button" aria-label="Activer ou désactiver le zoom">Zoom</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    state.overlay = overlay;
    state.image = overlay.querySelector('.lightbox-image');
    state.caption = overlay.querySelector('.lightbox-caption');
    state.counter = overlay.querySelector('.lightbox-counter');
    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    overlay.querySelector('.lightbox-prev').addEventListener('click', () => showImage(state.index - 1));
    overlay.querySelector('.lightbox-next').addEventListener('click', () => showImage(state.index + 1));
    overlay.querySelector('.lightbox-zoom').addEventListener('click', () => state.image.classList.toggle('is-zoomed'));
    state.image.addEventListener('click', () => state.image.classList.toggle('is-zoomed'));
    overlay.addEventListener('click', (event) => { if (event.target === overlay) closeLightbox(); });
  }

  function showImage(index) {
    if (!state.items.length) return;
    state.index = (index + state.items.length) % state.items.length;
    const item = state.items[state.index];
    state.image.classList.remove('is-zoomed');
    state.image.src = item.src;
    state.image.alt = item.alt || `Image ${state.index + 1}`;
    state.caption.textContent = item.alt || 'Image du portfolio';
    state.counter.textContent = `${String(state.index + 1).padStart(2, '0')} / ${String(state.items.length).padStart(2, '0')}`;
  }

  function openLightbox(image) {
    state.items = imageList().map((node) => ({ src: node.currentSrc || node.src, alt: node.alt || '' }));
    const index = imageList().indexOf(image);
    if (!state.items.length || index < 0) return;
    showImage(index);
    state.overlay.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    state.overlay.querySelector('.lightbox-close').focus();
  }

  function closeLightbox() {
    if (!state.overlay) return;
    state.overlay.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
  }

  function prepareImages() {
    imageList().forEach((image) => {
      if (image.dataset.interactionReady) return;
      image.dataset.interactionReady = 'true';
      image.dataset.zoomable = 'true';
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `${image.alt || 'Image'} — cliquer pour agrandir`);
    });
  }

  function prepareCards() {
    document.querySelectorAll('figure, article').forEach((card) => {
      card.classList.add('js-interaction-card');
      if (finePointer && !reducedMotion && !card.dataset.pointerReady) {
        card.dataset.pointerReady = 'true';
        card.addEventListener('pointermove', (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          card.style.transform = `perspective(900px) rotateX(${(-y * 2.6).toFixed(2)}deg) rotateY(${(x * 2.6).toFixed(2)}deg) translateY(-4px)`;
        });
        card.addEventListener('pointerleave', () => { card.style.transform = ''; });
      }
    });
  }

  function prepareReveals() {
    const nodes = document.querySelectorAll('section > div, section > article, h1, h2, h3, h4');
    nodes.forEach((node) => {
      if (node.closest('#portfolio-lightbox')) return;
      if (node.matches('h1,h2,h3,h4') || node.querySelector('h1,h2,h3')) node.classList.add('js-reveal');
      if (node.dataset.revealReady) return;
      node.dataset.revealReady = 'true';
      if (!state.revealObserver || reducedMotion) node.classList.add('is-inview');
      else state.revealObserver.observe(node);
    });
  }

  function refresh() {
    createLightbox();
    prepareImages();
    prepareCards();
    prepareReveals();
  }

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest('#portfolio-lightbox')) return;
    const image = target.closest('img[data-zoomable]');
    if (image) {
      event.preventDefault();
      event.stopPropagation();
      openLightbox(image);
    }
  }, true);

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target instanceof Element && target.matches('img[data-zoomable]') && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openLightbox(target);
    }
    if (!state.overlay || !state.overlay.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(state.index - 1);
    if (event.key === 'ArrowRight') showImage(state.index + 1);
  });

  if ('IntersectionObserver' in window && !reducedMotion) {
    state.revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-inview'); observer.unobserve(entry.target); }
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true });
  else refresh();
  new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true });
})();
