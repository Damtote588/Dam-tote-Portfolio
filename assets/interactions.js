(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const state = {
    items: [], index: 0, overlay: null, image: null, viewport: null,
    caption: null, counter: null, focused: null, revealObserver: null, layers: new Map()
  };

  // First-pass hotspots: only clearly identifiable objects on the boards.
  const HOTSPOTS = {
    'fresha-case-study-1.jpg': [
      { label: 'Logo Fresha', x: .245, y: .19, w: .22, h: .16 },
      { label: 'Bouteille Ananas', x: .035, y: .36, w: .105, h: .32 },
      { label: 'Bouteille Orange', x: .135, y: .36, w: .105, h: .32 },
      { label: 'Bouteille Mangue', x: .235, y: .36, w: .105, h: .32 },
      { label: 'Bouteille Pastèque', x: .335, y: .36, w: .105, h: .32 },
      { label: 'Bouteille Gingembre', x: .435, y: .36, w: .105, h: .32 },
      { label: 'Bouteille Baobab', x: .535, y: .36, w: .105, h: .32 },
      { label: 'Bouteille Corossol', x: .635, y: .36, w: .105, h: .32 },
      { label: 'Bouteille Bissap', x: .735, y: .36, w: .105, h: .32 },
      { label: 'Bouteille Cocktail', x: .835, y: .36, w: .105, h: .32 }
    ],
    'beaufort-case-study-1.jpg': [
      { label: 'Bouteille Beaufort', x: .055, y: .34, w: .38, h: .47 },
      { label: 'Étiquette principale', x: .51, y: .31, w: .27, h: .24 },
      { label: 'Contre-étiquette', x: .51, y: .53, w: .21, h: .22 },
      { label: 'Collerette', x: .76, y: .53, w: .20, h: .16 }
    ],
    'bayas-system-1.jpg': [
      { label: 'Logo Bayas House', x: .12, y: .08, w: .30, h: .17 },
      { label: 'Cartes logo', x: .11, y: .22, w: .78, h: .16 },
      { label: 'Photo textile', x: .11, y: .36, w: .27, h: .30 },
      { label: 'T-shirts', x: .39, y: .36, w: .50, h: .15 },
      { label: 'Smartphone', x: .39, y: .51, w: .23, h: .17 },
      { label: 'Boîte packaging', x: .62, y: .51, w: .27, h: .17 },
      { label: 'Casquette', x: .11, y: .67, w: .28, h: .18 },
      { label: 'Badges', x: .40, y: .67, w: .49, h: .18 }
    ],
    'sgmt-goodies-1.jpg': [
      { label: 'Polo SGMT', x: .16, y: .24, w: .39, h: .29 },
      { label: 'Tablier SGMT', x: .52, y: .21, w: .30, h: .32 },
      { label: 'Toque', x: .19, y: .51, w: .30, h: .16 },
      { label: 'Tote bag', x: .63, y: .51, w: .28, h: .22 },
      { label: 'Objets et accessoires', x: .20, y: .67, w: .70, h: .25 }
    ]
  };

  const css = document.createElement('style');
  css.textContent = `
    @media (pointer: fine) {
      img[data-zoomable] { cursor: zoom-in; }
      a:hover, button:hover, [role="button"]:hover { transform: translateY(-2px); }
    }
    .js-interaction-card { transform: translateZ(0); transition: transform .42s cubic-bezier(.23,1,.32,1), box-shadow .42s cubic-bezier(.23,1,.32,1), border-color .32s ease; will-change: transform; }
    .js-interaction-card:hover, .js-interaction-card:focus-within { transform: translateY(-6px); box-shadow: 0 18px 42px rgba(23,22,20,.16); }
    .js-interaction-card img { transition: transform .6s cubic-bezier(.23,1,.32,1), filter .4s ease; }
    .js-interaction-card:hover img, .js-interaction-card:focus-within img { transform: scale(1.045); filter: saturate(1.08) contrast(1.03); }
    .js-reveal { opacity: 0; transform: translateY(22px); transition: opacity .72s ease, transform .72s cubic-bezier(.23,1,.32,1); }
    .js-reveal.is-inview { opacity: 1; transform: none; }
    @media (prefers-reduced-motion: reduce) { .js-reveal { opacity: 1; transform: none; } .js-interaction-card, .js-interaction-card img { transition: none !important; } }

    .focus-hotspot-layer { position: fixed; z-index: 2147482000; pointer-events: none; }
    .focus-hotspot { position: absolute; display: grid; place-items: center; min-width: 1.9rem; min-height: 1.9rem; padding: 0; border: 1px solid rgba(255,255,255,.92); border-radius: 999px; color: #fff; background: rgba(228,73,46,.78); box-shadow: 0 3px 12px rgba(0,0,0,.28); cursor: zoom-in; pointer-events: auto; transition: transform .2s ease, background .2s ease, opacity .2s ease; }
    .focus-hotspot::before { content: '+'; font: 700 1rem/1 Arial, sans-serif; }
    .focus-hotspot::after { content: attr(aria-label); position: absolute; left: 50%; bottom: calc(100% + .45rem); transform: translateX(-50%) translateY(3px); width: max-content; max-width: 13rem; padding: .35rem .5rem; border-radius: .25rem; color: #fff; background: rgba(13,18,16,.92); font: 500 .62rem/1.2 "DM Mono", monospace; letter-spacing: .04em; text-transform: uppercase; opacity: 0; pointer-events: none; transition: opacity .18s ease, transform .18s ease; }
    .focus-hotspot:hover, .focus-hotspot:focus-visible { transform: scale(1.16); background: #e4492e; outline: none; }
    .focus-hotspot:hover::after, .focus-hotspot:focus-visible::after { opacity: 1; transform: translateX(-50%) translateY(0); }
    @media (pointer: coarse) { .focus-hotspot { opacity: .82; } .focus-hotspot::after { display: none; } }

    #portfolio-lightbox { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center; padding: clamp(1rem,3vw,3rem); background: rgba(10,12,11,.94); opacity: 0; pointer-events: none; visibility: hidden; transition: opacity .28s ease, visibility .28s ease; }
    #portfolio-lightbox.is-open { opacity: 1; pointer-events: auto; visibility: visible; }
    #portfolio-lightbox .lightbox-stage { position: relative; display: grid; place-items: center; width: min(94vw,1180px); height: min(88vh,900px); overflow: hidden; }
    #portfolio-lightbox .lightbox-viewport { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 1rem; touch-action: pan-x pan-y; overscroll-behavior: contain; scrollbar-gutter: stable; }
    #portfolio-lightbox .lightbox-image { position: relative; z-index: 1; max-width: 100%; max-height: 100%; object-fit: contain; border: 1px solid rgba(241,238,232,.22); box-shadow: 0 30px 90px rgba(0,0,0,.46); cursor: zoom-in; user-select: none; }
    #portfolio-lightbox .lightbox-image.is-zoomed { max-width: none; max-height: none; width: 1600px; height: auto; cursor: grab; }
    #portfolio-lightbox .lightbox-toolbar { position: absolute; z-index: 4; inset: auto 1rem 1rem; display: flex; align-items: center; justify-content: center; gap: .55rem; color: #f1eee8; font: 500 .68rem/1.2 "DM Mono",monospace; letter-spacing: .12em; text-transform: uppercase; pointer-events: auto; }
    #portfolio-lightbox button { display: inline-grid; place-items: center; min-width: 2.45rem; min-height: 2.45rem; padding: .5rem .72rem; border: 1px solid rgba(241,238,232,.36); color: #f1eee8; background: rgba(23,22,20,.72); cursor: pointer; }
    #portfolio-lightbox button:hover, #portfolio-lightbox button:focus-visible { border-color: #e4492e; background: #e4492e; outline: none; }
    #portfolio-lightbox .lightbox-caption { position: absolute; z-index: 4; inset: 1rem auto auto 1rem; max-width: min(70vw,38rem); color: #f1eee8; font: 500 .68rem/1.4 "DM Mono",monospace; letter-spacing: .12em; text-transform: uppercase; pointer-events: none; }
    #portfolio-lightbox .lightbox-close { position: absolute; top: 1rem; right: 1rem; z-index: 5; }
    body.lightbox-open { overflow: hidden; }
    @media (max-width:640px) { #portfolio-lightbox { padding: .8rem; } #portfolio-lightbox .lightbox-stage { width: 100vw; height: 78vh; } #portfolio-lightbox .lightbox-toolbar { inset: auto .7rem .7rem; flex-wrap: wrap; } #portfolio-lightbox .lightbox-caption { top: .7rem; left: .7rem; right: 4rem; } }
  `;
  document.head.appendChild(css);

  function imageList() { return Array.from(document.images).filter((image) => !image.closest('#portfolio-lightbox')); }
  function hotspotKey(image) { const src = image.currentSrc || image.src || ''; return Object.keys(HOTSPOTS).find((key) => src.includes(key)); }

  function createLightbox() {
    if (state.overlay) return;
    const overlay = document.createElement('div');
    overlay.id = 'portfolio-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Visionneuse d’images');
    overlay.innerHTML = `
      <div class="lightbox-stage">
        <div class="lightbox-viewport"><img class="lightbox-image" alt="" /></div>
        <p class="lightbox-caption"></p>
        <button class="lightbox-close" type="button" aria-label="Fermer la visionneuse">×</button>
        <div class="lightbox-toolbar">
          <button class="lightbox-prev" type="button" aria-label="Image précédente">←</button>
          <span class="lightbox-counter" aria-live="polite"></span>
          <button class="lightbox-next" type="button" aria-label="Image suivante">→</button>
          <button class="lightbox-zoom" type="button" aria-label="Activer ou désactiver le zoom">Zoom</button>
          <button class="lightbox-fit" type="button" aria-label="Revenir à la vue entière">Vue entière</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    state.overlay = overlay;
    state.image = overlay.querySelector('.lightbox-image');
    state.viewport = overlay.querySelector('.lightbox-viewport');
    state.caption = overlay.querySelector('.lightbox-caption');
    state.counter = overlay.querySelector('.lightbox-counter');
    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    overlay.querySelector('.lightbox-prev').addEventListener('click', () => showImage(state.index - 1));
    overlay.querySelector('.lightbox-next').addEventListener('click', () => showImage(state.index + 1));
    overlay.querySelector('.lightbox-zoom').addEventListener('click', () => { state.focused = null; state.image.classList.toggle('is-zoomed'); });
    overlay.querySelector('.lightbox-fit').addEventListener('click', fitImage);
    state.image.addEventListener('click', () => { state.focused = null; state.image.classList.toggle('is-zoomed'); });
    overlay.addEventListener('click', (event) => { if (event.target === overlay) closeLightbox(); });
  }

  function centerFocus() {
    if (!state.viewport || !state.image || !state.focused || !state.image.classList.contains('is-zoomed')) return;
    const focus = state.focused;
    const rect = state.image.getBoundingClientRect();
    const left = state.image.offsetLeft + rect.width * focus.x - state.viewport.clientWidth / 2;
    const top = state.image.offsetTop + rect.height * focus.y - state.viewport.clientHeight / 2;
    state.viewport.scrollTo({ left: Math.max(0, left), top: Math.max(0, top), behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function showImage(index, focus = null) {
    if (!state.items.length) return;
    state.index = (index + state.items.length) % state.items.length;
    const item = state.items[state.index];
    state.focused = focus;
    state.image.classList.remove('is-zoomed');
    state.viewport.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    state.image.src = item.src;
    state.image.alt = item.alt || `Image ${state.index + 1}`;
    state.caption.textContent = focus ? `${item.alt || 'Image du portfolio'} — Focus : ${focus.label}` : (item.alt || 'Image du portfolio');
    state.counter.textContent = `${String(state.index + 1).padStart(2, '0')} / ${String(state.items.length).padStart(2, '0')}`;
    if (focus) state.image.classList.add('is-zoomed');
    state.image.onload = () => { if (state.focused) centerFocus(); };
    requestAnimationFrame(() => { if (state.focused) centerFocus(); });
  }

  function openLightbox(image, focus = null) {
    const nodes = imageList();
    state.items = nodes.map((node) => ({ src: node.currentSrc || node.src, alt: node.alt || '' }));
    const index = nodes.indexOf(image);
    if (!state.items.length || index < 0) return;
    showImage(index, focus);
    state.overlay.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    state.overlay.querySelector('.lightbox-close').focus();
  }

  function fitImage() { state.focused = null; state.image.classList.remove('is-zoomed'); state.viewport.scrollTo({ left: 0, top: 0, behavior: 'auto' }); }
  function closeLightbox() { if (!state.overlay) return; state.overlay.classList.remove('is-open'); document.body.classList.remove('lightbox-open'); }

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

  function updateHotspotLayers() {
    state.layers.forEach((layer, image) => {
      if (!image.isConnected || image.closest('#portfolio-lightbox')) { layer.remove(); state.layers.delete(image); return; }
      const rect = image.getBoundingClientRect();
      if (!rect.width || !rect.height) { layer.style.display = 'none'; return; }
      layer.style.display = 'block';
      layer.style.left = `${rect.left}px`; layer.style.top = `${rect.top}px`;
      layer.style.width = `${rect.width}px`; layer.style.height = `${rect.height}px`;
    });
  }

  function prepareHotspots() {
    imageList().forEach((image) => {
      const key = hotspotKey(image);
      if (!key || state.layers.has(image)) return;
      const layer = document.createElement('div');
      layer.className = 'focus-hotspot-layer';
      layer.setAttribute('aria-label', `Zones focalisables — ${key}`);
      HOTSPOTS[key].forEach((hotspot) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'focus-hotspot'; button.setAttribute('aria-label', hotspot.label);
        button.style.left = `${hotspot.x * 100}%`; button.style.top = `${hotspot.y * 100}%`;
        button.style.width = `${hotspot.w * 100}%`; button.style.height = `${hotspot.h * 100}%`;
        button.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); openLightbox(image, { ...hotspot, x: hotspot.x + hotspot.w / 2, y: hotspot.y + hotspot.h / 2 }); }, true);
        layer.appendChild(button);
      });
      document.body.appendChild(layer); state.layers.set(image, layer);
    });
    updateHotspotLayers();
  }

  function prepareCards() {
    document.querySelectorAll('figure, article').forEach((card) => {
      card.classList.add('js-interaction-card');
      if (finePointer && !reducedMotion && !card.dataset.pointerReady) {
        card.dataset.pointerReady = 'true';
        card.addEventListener('pointermove', (event) => { const rect = card.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width - .5; const y = (event.clientY - rect.top) / rect.height - .5; card.style.transform = `perspective(900px) rotateX(${(-y * 2.6).toFixed(2)}deg) rotateY(${(x * 2.6).toFixed(2)}deg) translateY(-4px)`; });
        card.addEventListener('pointerleave', () => { card.style.transform = ''; });
      }
    });
  }

  function prepareReveals() {
    const nodes = document.querySelectorAll('section > div, section > article, h1, h2, h3, h4');
    nodes.forEach((node) => { if (node.closest('#portfolio-lightbox')) return; if (node.matches('h1,h2,h3,h4') || node.querySelector('h1,h2,h3')) node.classList.add('js-reveal'); if (node.dataset.revealReady) return; node.dataset.revealReady = 'true'; if (!state.revealObserver || reducedMotion) node.classList.add('is-inview'); else state.revealObserver.observe(node); });
  }

  function refresh() { createLightbox(); prepareImages(); prepareHotspots(); prepareCards(); prepareReveals(); }

  document.addEventListener('click', (event) => { const target = event.target; if (!(target instanceof Element) || target.closest('#portfolio-lightbox') || target.closest('.focus-hotspot')) return; const image = target.closest('img[data-zoomable]'); if (image) { event.preventDefault(); event.stopPropagation(); openLightbox(image); } }, true);
  document.addEventListener('keydown', (event) => { const target = event.target; if (target instanceof Element && target.matches('img[data-zoomable]') && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openLightbox(target); } if (!state.overlay || !state.overlay.classList.contains('is-open')) return; if (event.key === 'Escape') closeLightbox(); if (event.key === 'ArrowLeft') showImage(state.index - 1); if (event.key === 'ArrowRight') showImage(state.index + 1); if (event.key === 'Home') fitImage(); });
  if ('IntersectionObserver' in window && !reducedMotion) state.revealObserver = new IntersectionObserver((entries, observer) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-inview'); observer.unobserve(entry.target); } }); }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  let raf = 0; const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(updateHotspotLayers); }; window.addEventListener('resize', schedule); window.addEventListener('scroll', schedule, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true }); else refresh();
  new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true });
})();
