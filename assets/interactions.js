(() => {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    :root {
      --interaction-ease: cubic-bezier(.23, 1, .32, 1);
    }

    @media (pointer: fine) {
      a, button, [role="button"] {
        transition: color .22s var(--interaction-ease), background-color .22s var(--interaction-ease), border-color .22s var(--interaction-ease), transform .22s var(--interaction-ease), opacity .22s ease;
      }
      a:hover, button:hover, [role="button"]:hover {
        transform: translateY(-2px);
      }
      img[data-zoomable] {
        cursor: zoom-in;
      }
    }

    .js-interaction-card {
      transform: translateZ(0);
      transition: transform .42s var(--interaction-ease), box-shadow .42s var(--interaction-ease), border-color .32s ease;
      will-change: transform;
    }
    .js-interaction-card:hover,
    .js-interaction-card:focus-within {
      transform: translateY(-6px);
      box-shadow: 0 18px 42px rgba(23, 22, 20, .16);
    }
    .js-interaction-card img {
      transition: transform .6s var(--interaction-ease), filter .4s ease;
    }
    .js-interaction-card:hover img,
    .js-interaction-card:focus-within img {
      transform: scale(1.045);
      filter: saturate(1.08) contrast(1.03);
    }

    .js-reveal {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity .72s ease, transform .72s var(--interaction-ease);
    }
    .js-reveal.is-inview {
      opacity: 1;
      transform: none;
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: .01ms !important;
      }
      .js-reveal { opacity: 1; transform: none; }
    }

    #portfolio-lightbox {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: grid;
      place-items: center;
      padding: clamp(1rem, 3vw, 3rem);
      background: rgba(10, 12, 11, .92);
      opacity: 0;
      pointer-events: none;
      transition: opacity .28s ease;
    }
    #portfolio-lightbox.is-open {
      opacity: 1;
      pointer-events: auto;
    }
    #portfolio-lightbox .lightbox-stage {
      position: relative;
      display: grid;
      place-items: center;
      width: min(94vw, 1180px);
      height: min(88vh, 900px);
    }
    #portfolio-lightbox .lightbox-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border: 1px solid rgba(241, 238, 232, .22);
      box-shadow: 0 30px 90px rgba(0, 0, 0, .46);
      transform: scale(.96);
      transition: transform .34s var(--interaction-ease);
      cursor: zoom-in;
      user-select: none;
    }
    #portfolio-lightbox.is-open .lightbox-image { transform: scale(1); }
    #portfolio-lightbox .lightbox-image.is-zoomed {
      max-width: none;
      max-height: none;
      width: min(150vw, 1800px);
      height: min(150vh, 1400px);
      object-fit: contain;
      cursor: zoom-out;
    }
    #portfolio-lightbox .lightbox-toolbar {
      position: absolute;
      inset: auto 0 -3.3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .55rem;
      color: #f1eee8;
      font: 500 .68rem/1.2 "DM Mono", monospace;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    #portfolio-lightbox button {
      display: inline-grid;
      place-items: center;
      min-width: 2.45rem;
      min-height: 2.45rem;
      padding: .5rem .72rem;
      border: 1px solid rgba(241, 238, 232, .36);
      color: #f1eee8;
      background: rgba(23, 22, 20, .72);
      cursor: pointer;
    }
    #portfolio-lightbox button:hover,
    #portfolio-lightbox button:focus-visible {
      border-color: #e4492e;
      background: #e4492e;
      outline: none;
    }
    #portfolio-lightbox .lightbox-caption {
      position: absolute;
      inset: 1rem auto auto 1rem;
      max-width: min(70vw, 38rem);
      color: #f1eee8;
      font: 500 .68rem/1.4 "DM Mono", monospace;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    #portfolio-lightbox .lightbox-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 2;
    }
    body.lightbox-open { overflow: hidden; }
    @media (max-width: 640px) {
      #portfolio-lightbox { padding: .8rem; }
      #portfolio-lightbox .lightbox-stage { width: 100vw; height: 78vh; }
      #portfolio-lightbox .lightbox-toolbar { bottom: -3.5rem; }
      #portfolio-lightbox .lightbox-caption { top: .7rem; left: .7rem; right: 4rem; }
    }
  `;
  document.head.appendChild(style);

  const state = { items: [], index: 0 };
  let overlay;
  let imageNode;
  let captionNode;
  let counterNode;

  const makeButton = (label, text, className) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.className = className || '';
    button.textContent = text;
    return button;
  };

  function createLightbox() {
    overlay = document.createElement('div');
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
          <button class="lightbox-zoom" type="button" aria-label="Activer le zoom">Zoom</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    imageNode = overlay.querySelector('.lightbox-image');
    captionNode = overlay.querySelector('.lightbox-caption');
    counterNode = overlay.querySelector('.lightbox-counter');

    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    overlay.querySelector('.lightbox-prev').addEventListener('click', () => showImage(state.index - 1));
    overlay.querySelector('.lightbox-next').addEventListener('click', () => showImage(state.index + 1));
    overlay.querySelector('.lightbox-zoom').addEventListener('click', () => imageNode.classList.toggle('is-zoomed'));
    imageNode.addEventListener('click', () => imageNode.classList.toggle('is-zoomed'));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeLightbox();
    });
  }

  function showImage(index) {
    if (!state.items.length) return;
    state.index = (index + state.items.length) % state.items.length;
    const item = state.items[state.index];
    imageNode.classList.remove('is-zoomed');
    imageNode.src = item.src;
    imageNode.alt = item.alt || `Image ${state.index + 1}`;
    captionNode.textContent = item.alt || 'Image du portfolio';
    counterNode.textContent = `${String(state.index + 1).padStart(2, '0')} / ${String(state.items.length).padStart(2, '0')}`;
  }

  function openLightbox(index) {
    state.items = Array.from(document.querySelectorAll('img[data-zoomable]')).map((node) => ({
      src: node.currentSrc || node.src,
      alt: node.alt || ''
    }));
    if (!state.items.length) return;
    showImage(index);
    overlay.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    overlay.querySelector('.lightbox-close').focus();
  }

  function closeLightbox() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
  }

  function enhanceImages() {
    const images = document.querySelectorAll('img:not(#portfolio-lightbox img)');
    images.forEach((image) => {
      if (!image.src || image.dataset.interactionReady) return;
      image.dataset.interactionReady = 'true';
      image.dataset.zoomable = 'true';
      image.setAttribute('tabindex', '0');
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `${image.alt || 'Image'} — cliquer pour agrandir`);
      image.addEventListener('click', () => openLightbox(Array.from(document.querySelectorAll('img[data-zoomable]')).indexOf(image)));
      image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(Array.from(document.querySelectorAll('img[data-zoomable]')).indexOf(image));
        }
      });
    });
  }

  function enhanceCards() {
    document.querySelectorAll('figure, article').forEach((element) => {
      element.classList.add('js-interaction-card');
    });
    document.querySelectorAll('section > div, section > article').forEach((element) => {
      if (element.querySelector('h1, h2, h3')) element.classList.add('js-reveal');
    });
    document.querySelectorAll('h1, h2, h3, h4').forEach((heading) => {
      if (heading.closest('#portfolio-lightbox')) return;
      heading.classList.add('js-reveal');
    });
  }

  function observeReveals() {
    const revealNodes = document.querySelectorAll('.js-reveal:not([data-reveal-ready])');
    revealNodes.forEach((node) => node.dataset.revealReady = 'true');
    if (!('IntersectionObserver' in window)) {
      revealNodes.forEach((node) => node.classList.add('is-inview'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    revealNodes.forEach((node) => observer.observe(node));
  }

  function enhancePointer() {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('figure, article').forEach((card) => {
      if (card.dataset.pointerReady) return;
      card.dataset.pointerReady = 'true';
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 2.6).toFixed(2)}deg) rotateY(${(x * 2.6).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  function run() {
    if (!overlay) createLightbox();
    enhanceImages();
    enhanceCards();
    observeReveals();
    enhancePointer();
  }

  document.addEventListener('keydown', (event) => {
    if (!overlay || !overlay.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(state.index - 1);
    if (event.key === 'ArrowRight') showImage(state.index + 1);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
})();
