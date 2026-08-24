(() => {
  'use strict';

  const BASE = '/Dam-tote-Portfolio/assets/';
  const PAGE_ASSETS = {
    2: `${BASE}illustrationile-full.png`,
    22: `${BASE}moonrise-full.png`,
    23: `${BASE}portfolio-page-23.png`,
  };

  const css = `
    .portfolio-source-page {
      position: relative;
      overflow: hidden;
      background: #171614;
      padding: clamp(3.5rem, 8vw, 8rem) clamp(1.25rem, 4vw, 4rem);
      color: #f3f1eb;
    }
    .portfolio-source-page__inner {
      width: min(100%, 1180px);
      margin: 0 auto;
    }
    .portfolio-source-page__label {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
      color: rgba(243, 241, 235, 0.6);
      font: 600 0.68rem/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .portfolio-source-page__image {
      display: block;
      width: 100%;
      height: auto;
      border: 1px solid rgba(243, 241, 235, 0.14);
      box-shadow: 0 28px 80px rgba(0, 0, 0, 0.26);
    }
    .portfolio-fullscreen-art {
      position: relative;
      min-height: 100svh;
      height: 100svh;
      overflow: hidden;
      padding: 0;
      background: #10202a;
    }
    .portfolio-fullscreen-art--illustrationile { background: #5c95a8; }
    .portfolio-fullscreen-art--moonrise { background: #07151c; }
    .portfolio-fullscreen-art__image {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }
    .portfolio-fullscreen-art__shade {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(180deg, rgba(0,0,0,.32), transparent 26%, transparent 72%, rgba(0,0,0,.44));
    }
    .portfolio-fullscreen-art__meta {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: clamp(1.25rem, 4vw, 4rem);
      color: #f7f3e9;
      pointer-events: none;
      font: 600 .68rem/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: .16em;
      text-transform: uppercase;
    }
    .portfolio-fullscreen-art__top,
    .portfolio-fullscreen-art__bottom {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 1rem;
      text-shadow: 0 2px 18px rgba(0,0,0,.45);
    }
    .portfolio-fullscreen-art__bottom { align-items: end; }
    .portfolio-art-copy {
      position: absolute;
      z-index: 2;
      pointer-events: none;
      text-shadow: 0 2px 18px rgba(0,0,0,.35);
    }
    .portfolio-art-copy--moonrise {
      left: clamp(1.25rem, 5vw, 5rem);
      top: 50%;
      transform: translateY(-50%);
      color: #f7f3e9;
      font-family: Haettenschweiler, Impact, sans-serif;
      font-size: clamp(3.5rem, 11vw, 10rem);
      line-height: .72;
      letter-spacing: .015em;
      writing-mode: vertical-rl;
      transform: translateY(-50%) rotate(180deg);
    }
    .portfolio-art-copy--moonrise small {
      position: absolute;
      left: clamp(5rem, 9vw, 9rem);
      bottom: clamp(1.25rem, 4vw, 4rem);
      width: max-content;
      color: rgba(247,243,233,.9);
      font: 600 clamp(.58rem, 1vw, .82rem)/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: .12em;
      text-transform: uppercase;
      writing-mode: horizontal-tb;
    }
    .portfolio-art-copy--island {
      inset: 0;
      color: #2d4144;
      font-family: Haettenschweiler, Impact, sans-serif;
    }
    .portfolio-art-copy--island .portfolio-art-copy__heading {
      position: absolute;
      top: 12%;
      left: 12%;
      max-width: min(42vw, 32rem);
      font-size: clamp(2.4rem, 6vw, 6.5rem);
      line-height: .78;
      letter-spacing: .015em;
      text-transform: uppercase;
    }
    .portfolio-art-copy--island .portfolio-art-copy__eyebrow {
      display: block;
      margin-bottom: 1rem;
      color: #e4492e;
      font: 700 clamp(.7rem, 1vw, 1rem)/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: .1em;
    }
    .portfolio-art-copy--island .portfolio-art-copy__rule {
      width: 9rem;
      height: .18rem;
      margin-top: 1.5rem;
      background: #e4492e;
    }
    .portfolio-art-copy--island .portfolio-art-copy__body {
      position: absolute;
      left: 12%;
      bottom: 12%;
      width: min(58vw, 46rem);
      color: #f7f3e9;
      font: 500 clamp(.72rem, 1.1vw, 1rem)/1.38 ui-sans-serif, system-ui, sans-serif;
      text-shadow: 0 1px 10px rgba(0,0,0,.2);
    }
    .portfolio-art-copy--island .portfolio-art-copy__body p { margin: 0 0 .85rem; }
    .portfolio-art-copy--island .portfolio-art-copy__quote { font-style: italic; }
    .portfolio-art-copy--island .portfolio-art-copy__cta {
      margin-top: 1.4rem;
      color: #2d4144;
      font: 700 clamp(.72rem, 1.1vw, 1rem)/1.15 ui-sans-serif, system-ui, sans-serif;
      text-transform: uppercase;
      text-shadow: none;
    }
    @media (max-width: 640px) {
      .portfolio-source-page { padding: 3rem 1rem; }
      .portfolio-source-page__label { font-size: 0.58rem; }
      .portfolio-fullscreen-art__meta { padding: 1rem; font-size: .56rem; }
      .portfolio-fullscreen-art__top,
      .portfolio-fullscreen-art__bottom { flex-direction: column; gap: .45rem; }
      .portfolio-art-copy--moonrise { left: .75rem; font-size: 3.6rem; }
      .portfolio-art-copy--moonrise small { left: 4.6rem; bottom: 1rem; font-size: .5rem; }
      .portfolio-art-copy--island .portfolio-art-copy__heading { top: 10%; left: 8%; max-width: 68vw; font-size: 3.4rem; }
      .portfolio-art-copy--island .portfolio-art-copy__body { left: 8%; bottom: 7%; width: 84vw; font-size: .67rem; line-height: 1.28; }
      .portfolio-art-copy--island .portfolio-art-copy__body p { margin-bottom: .55rem; }
      .portfolio-art-copy--island .portfolio-art-copy__cta { margin-top: .8rem; font-size: .65rem; }
    }
  `;

  const ensureStyles = () => {
    if (document.getElementById('portfolio-source-order-styles')) return;
    const style = document.createElement('style');
    style.id = 'portfolio-source-order-styles';
    style.textContent = css;
    document.head.appendChild(style);
  };

  const makeFullscreenPage = (pageNumber, title, assetName, variant, subtitle, artKind) => {
    const section = document.createElement('section');
    const padded = String(pageNumber).padStart(2, '0');
    section.id = `portfolio-page-${padded}`;
    section.className = `portfolio-fullscreen-art portfolio-fullscreen-art--${variant}`;
    section.dataset.sourcePage = padded;
    section.dataset.artKind = artKind;
    section.setAttribute('aria-label', `Page ${padded} — ${title}`);
    const customCopy = artKind === 'moonrise'
      ? `<div class="portfolio-art-copy portfolio-art-copy--moonrise" aria-hidden="true">MOONRISE<small>Illustration numérique<br>Création personnelle • 2019</small></div>`
      : `<div class="portfolio-art-copy portfolio-art-copy--island" aria-hidden="true">
          <div class="portfolio-art-copy__heading"><span class="portfolio-art-copy__eyebrow">CONCLUSION</span>MERCI<br>POUR VOTRE<br>INTÉRÊT.<div class="portfolio-art-copy__rule"></div></div>
          <div class="portfolio-art-copy__body">
            <p>Ce portfolio témoigne de ma passion pour le design graphique et de mon engagement à créer des solutions visuelles cohérentes, esthétiques et efficaces.</p>
            <p>Au fil de ces projets, j’ai cherché à allier créativité, rigueur et sens du détail afin de concevoir des expériences visuelles qui renforcent l’image des marques et valorisent leurs messages.</p>
            <p>Chaque réalisation représente une nouvelle occasion d’apprendre, d’innover et de transformer une idée en un projet concret.</p>
            <p class="portfolio-art-copy__quote">« Le design ne consiste pas uniquement à rendre les choses belles. Il consiste à résoudre des problèmes avec simplicité, intelligence et créativité. »</p>
            <p class="portfolio-art-copy__cta">PRÊT À DONNER VIE À VOTRE PROCHAIN PROJET ?<br>CRÉONS ENSEMBLE<br>UNE IDENTITÉ VISUELLE FORTE ET DES SUPPORTS DE COMMUNICATION QUI FERONT LA DIFFÉRENCE.</p>
          </div>
        </div>`;
    section.innerHTML = `
      <img class="portfolio-fullscreen-art__image" src="${BASE}${assetName}" alt="Page ${padded} du portfolio — ${title}" loading="lazy" decoding="async">
      <div class="portfolio-fullscreen-art__shade" aria-hidden="true"></div>
      ${customCopy}
      <div class="portfolio-fullscreen-art__meta">
        <div class="portfolio-fullscreen-art__top"><span>Page ${padded}</span><span>${title}</span></div>
        <div class="portfolio-fullscreen-art__bottom"><span>DSL / DOSSIER RELIÉ</span><span>${subtitle}</span></div>
      </div>
    `;
    return section;
  };

  const makePage = (pageNumber, title) => {
    const section = document.createElement('section');
    section.id = `portfolio-page-${String(pageNumber).padStart(2, '0')}`;
    section.className = 'portfolio-source-page';
    section.dataset.sourcePage = String(pageNumber).padStart(2, '0');
    section.setAttribute('aria-label', `Page ${String(pageNumber).padStart(2, '0')} — ${title}`);
    section.innerHTML = `
      <div class="portfolio-source-page__inner">
        <div class="portfolio-source-page__label">
          <span>Page ${String(pageNumber).padStart(2, '0')}</span>
          <span>${title}</span>
        </div>
        <img class="portfolio-source-page__image" src="${PAGE_ASSETS[pageNumber]}" alt="Page ${String(pageNumber).padStart(2, '0')} du portfolio — ${title}" loading="lazy" decoding="async">
      </div>
    `;
    return section;
  };

  const childWithImage = (section, filename) => Array.from(section.children).find((child) =>
    Array.from(child.querySelectorAll('img')).some((img) => img.src.includes(filename))
  );

  const reorderPrintSubblocks = (print) => {
    const children = Array.from(print.children);
    if (children.length < 5) return;
    const chapter = children.find((child) => child.classList.contains('chapter-number'));
    const grain = children.find((child) => child.classList.contains('paper-grain'));
    const intro = childWithImage(print, 'print-design-1.jpg');
    const fresha = childWithImage(print, 'fresha-compo-1.jpg');
    const archive = childWithImage(print, 'fresha-ananas-upload.webp');
    const beaufort = childWithImage(print, 'beaufort-case-study-1.jpg');
    const appBlock = childWithImage(print, 'afcet-case-study-1.jpg');
    const ordered = [chapter, grain, intro, fresha, archive, beaufort, appBlock].filter(Boolean);
    if (!chapter || !intro || !fresha || !archive || !beaufort || !appBlock) return;
    // Preserve every existing Print child and enforce the source order 08 → 09 → archive → 10 → 11–12.
    print.append(...ordered);
  };

  const reorderCampaignSubblocks = (campaigns) => {
    const children = Array.from(campaigns.children);
    if (children.length < 5) return;
    const chapter = children.find((child) => child.classList.contains('chapter-number'));
    const grain = children.find((child) => child.classList.contains('paper-grain'));
    const intro = childWithImage(campaigns, 'campaigns-intro-1.jpg');
    const divers = childWithImage(campaigns, 'divers-projects-1.jpg');
    const sgmt = childWithImage(campaigns, 'sgmt-digital-1.jpg');
    if (!chapter || !intro || !divers || !sgmt) return;
    // The supplied portfolio places page 13 (Divers) before page 14 (Campagnes), then pages 15–16.
    campaigns.append(chapter, grain, divers, intro, sgmt);
  };

  const removeStrayUndefined = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim() === 'undefined') nodes.push(node);
    }
    nodes.forEach((textNode) => textNode.remove());
  };

  const applyOrder = () => {
    const main = document.querySelector('main');
    if (!main || main.dataset.sourceOrderApplied === 'true') return Boolean(main);

    const accueil = main.querySelector('#accueil');
    const profil = main.querySelector('#profil');
    const identites = main.querySelector('#identites');
    const print = main.querySelector('#print');
    const campagnes = main.querySelector('#campagnes');
    const retouche = main.querySelector('#retouche');
    const creatifs = main.querySelector('#creatifs');
    const dossiers = main.querySelector('#dossiers');
    const autres = Array.from(main.children).find((child) => child.tagName === 'SECTION' && !child.id);
    const contact = main.querySelector('#contact');
    if (!accueil || !profil || !identites || !print || !campagnes || !retouche || !creatifs || !dossiers || !autres || !contact) return false;

    ensureStyles();
    let page02 = main.querySelector('#portfolio-page-02');
    let page23 = main.querySelector('#portfolio-page-23');
    if (!page02 || page02.dataset.artKind !== 'moonrise') {
      const replacement = makeFullscreenPage(2, 'Moonrise', 'moonrise-full.png', 'moonrise', 'Illustration numérique', 'moonrise');
      if (page02) page02.replaceWith(replacement);
      page02 = replacement;
    }
    if (!page23 || page23.dataset.artKind !== 'island-conclusion') {
      const replacement = makeFullscreenPage(23, 'Illustrationile', 'illustrationile-full.png', 'illustrationile', 'Conclusion', 'island-conclusion');
      if (page23) page23.replaceWith(replacement);
      page23 = replacement;
    }

    const legacyIce = Array.from(creatifs.querySelectorAll('article')).find((article) =>
      Array.from(article.querySelectorAll('img')).some((img) => img.src.includes('ice-premium-concept-1.jpg'))
    );
    if (legacyIce) legacyIce.remove();

    reorderPrintSubblocks(print);
    reorderCampaignSubblocks(campagnes);

    const hiddenFresha = main.querySelector('#fresha');
    // Hidden Fresha metadata remains available, while the visible sequence follows the supplied PDF.
    main.append(accueil, page02, profil, identites, dossiers, autres, print, campagnes, retouche, creatifs, page23, contact);
    // Keep the legacy hidden Fresha section available, but place it after the visible source-order sequence.
    if (hiddenFresha) main.append(hiddenFresha);
    removeStrayUndefined(main);
    main.dataset.sourceOrderApplied = 'true';
    document.documentElement.dataset.portfolioSourceOrder = '01-24';
    return true;
  };

  const start = () => {
    if (applyOrder()) return;
    const observer = new MutationObserver(() => {
      if (applyOrder()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
