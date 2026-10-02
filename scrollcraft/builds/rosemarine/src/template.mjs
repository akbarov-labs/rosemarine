import * as B from './botany.mjs';
import { PRODUCTS, RAIL, CONCERNS, REVIEWS, T, LANGS, money } from './data.mjs';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const SITE = 'https://rosemarine.uz'; // placeholder origin for canonical/hreflang; set to the real domain at deploy
const pathFor = (l) => (l === 'uz' ? '/' : `/${l}/`);

// a drawn path: pathLength=1 so a 0..1 dashoffset draws it; data-draw is the
// window of act progress it draws across
const drawn = (d, win, cls = '') =>
  `<path class="thread ${cls}" d="${d}" pathLength="1" data-draw="${win}"/>`;

// for stretched (preserveAspectRatio="none") svgs the dash trick breaks, so
// they reveal by clip instead: data-draw sits on the <svg>, data-dir picks the axis
const clipped = (vb, d, win, dir = 'h', cls = '') =>
  `<svg class="clipdraw ${cls}" viewBox="${vb}" preserveAspectRatio="none" data-draw="${win}" data-dir="${dir}" aria-hidden="true" focusable="false"><path class="thread thread--plain" d="${d}"/></svg>`;

const tape = (cls = '') => `<span class="tape ${cls}" aria-hidden="true"></span>`;
const print = (img, alt, cls = '', w = 600, h = 800, eager = false) =>
  `<figure class="print ${cls}">${tape()}<img src="${'IMG/' + img}.webp" width="${w}" height="${h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></figure>`;

const pickRow = (t, lang, p) => {
  const thumb = p.img
    ? `<img src="IMG/${p.img}.webp" alt="" width="96" height="96" loading="lazy" decoding="async">`
    : `<svg viewBox="0 0 300 360" aria-hidden="true" focusable="false"><path class="thread thread--static" d="${B.SPECIMENS[p.glyph || 'chamomile']()}"/></svg>`;
  return `<li class="pick"><span class="pick__thumb">${thumb}</span><span class="pick__txt"><strong>${esc(p.name[lang])}</strong>${p.note[lang] ? `<span>${esc(p.note[lang])}</span>` : ''}<em>${money(lang, p.price)}</em></span>${addBtn(t, p.id, p.name[lang])}</li>`;
};

const addBtn = (t, id, name) =>
  `<button class="add" type="button" data-add="${id}" aria-pressed="false" aria-label="${esc(name)}: ${esc(t.addAria)}"><span class="add__plus" aria-hidden="true"></span><span class="add__on">${esc(t.add)}</span><span class="add__off">${esc(t.added)}</span></button>`;

function specimenSvg(name, win, cls = '') {
  return `<svg class="specimen ${cls}" viewBox="0 0 300 360" aria-hidden="true" focusable="false">${drawn(B.SPECIMENS[name](), win)}</svg>`;
}

function railCard(t, lang, id, i) {
  const p = byId[id];
  return `
      <article class="leafsheet" style="--i:${i};--dy:${[16, 34, 20, 38, 12, 28][i % 6]}px;--rot:${[-1, 0.8, -0.4, 1.2, -0.9, 0.5][i % 6]}deg">
        <span class="peg" aria-hidden="true"></span>
        ${specimenSvg(p.glyph, i === 0 ? '-0.3 -0.05' : `${(i * 0.1).toFixed(2)} ${(0.24 + i * 0.1).toFixed(2)}`)}
        ${print(p.img, p.name[lang], 'print--rail')}
        <div class="label">
          <p class="label__latin">${esc(p.latin)}</p>
          <h3 class="label__name">${esc(p.name[lang])}</h3>
          <p class="label__note">${esc(p.note[lang])}</p>
          <p class="label__meta">${p.size ? `<span>${esc(p.size[lang])}</span>` : ''}<span class="label__price">${money(lang, p.price)}</span></p>
          ${addBtn(t, p.id, p.name[lang])}
        </div>
      </article>`;
}

export function render(lang) {
  const t = T[lang];
  const logoSvg = (cls, win, tail = true, label = true) => `
        <svg class="logo ${cls}" viewBox="${B.LOGO_VIEWBOX}" ${label ? 'role="img" aria-label="Rosemarine"' : 'aria-hidden="true" focusable="false"'}>
          ${drawn(B.LOGO, win, 'thread--logo')}
          ${tail ? drawn(B.LOGO_TAIL_LONG, '0.04 0.62', 'thread--tail') : ''}
        </svg>`;
  const bloom = B.roseBloomAt();
  const sprig = B.rosemarySprig();
  const tabs = Object.entries(t.tabs);
  const alt = Object.fromEntries(LANGS.map((l) => [l, SITE + pathFor(l)]));

  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.description)}">
<meta name="theme-color" content="#15261C">
<link rel="canonical" href="${alt[lang]}">
${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${alt[l]}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${alt.uz}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.description)}">
<meta property="og:locale" content="${t.locale}">
<meta property="og:image" content="${SITE}/img/gift-set-teacher.webp">
<link rel="icon" href="ROOT/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&text=%CA%BB%CA%BC&display=swap">
<link rel="stylesheet" href="ROOT/scrollcraft.css">
<link rel="stylesheet" href="ROOT/site.css">
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Store', name: 'Rosemarine Organic', url: alt[lang],
    description: t.description, areaServed: 'UZ',
    sameAs: ['https://www.instagram.com/rosemarine_organic/', 'https://t.me/rosemarine_organic'],
  })}</script>
</head>
<body class="lang-${lang}">
<a class="skip" href="#maktub">${esc(t.skip)}</a>
<div class="sc-grain" aria-hidden="true"></div>

<header class="chrome">
  <a class="chrome__mark chip" href="#muqova" aria-label="Rosemarine">
    <svg viewBox="${B.LOGO_VIEWBOX}" aria-hidden="true" focusable="false"><path d="${B.LOGO}"/></svg>
    <span>ROSEMARINE</span>
  </a>
  <div class="chrome__right chip">
    <nav class="langs" aria-label="Til / Язык / Language">
      ${LANGS.map((l) => `<a href="ROOT${pathFor(l) === '/' ? '/' : pathFor(l)}" hreflang="${l}" lang="${l}" ${l === lang ? 'aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('')}
    </nav>
    <button class="chrome__index" type="button" aria-expanded="false" aria-controls="index" aria-label="${esc(t.index)}"><span class="chrome__index-txt">${esc(t.index)}</span><svg class="chrome__index-ico" viewBox="0 0 20 14" aria-hidden="true" focusable="false"><path d="M1 1h18M1 7h18M1 13h12"/></svg></button>
    <a class="chrome__cta" href="#varaqa"><span class="cta-long">${esc(t.cta)}</span><span class="cta-short">${esc(t.ctaShort)}</span><span class="count" data-count hidden>0</span></a>
  </div>
</header>

<nav class="index" id="index" aria-label="${esc(t.index)}">
  <button class="index__close" type="button">${esc(t.close)}</button>
  <ol>
    ${tabs.map(([id, label]) => `<li><a href="#${id}" data-tab="${id}">${esc(label)}</a></li>`).join('\n    ')}
  </ol>
</nav>

<main>

  <!-- 1 · TITLE SHEET. Tenderness. pin + independent planes + the thread drawing the logo. -->
  <section id="muqova" class="act-hero ground-dark" data-sc-act="pin" data-sc-span="1.7">
    <div data-sc-stage class="hero">
      <div class="hero__light" aria-hidden="true"></div>
      <div class="sheet sheet--back" aria-hidden="true">
        ${print('gift-set-teacher', '', 'print--back', 800, 800, true)}
        <p class="sheet__tag">${esc(t.heroPrintA)}</p>
      </div>
      <div class="sheet sheet--mid" aria-hidden="true">
        ${print('soap-sidr-massager', '', 'print--mid', 600, 404, true)}
        <p class="sheet__tag">${esc(t.heroPrintB)}</p>
      </div>
      <div class="sheet sheet--front on-paper">
        ${logoSvg('logo--hero', 'intro')}
        <div class="hero__copy">
          <h1 class="display hero__h1">${esc(t.heroH1)}</h1>
          <p class="hero__sub">${esc(t.heroSub)}</p>
          <a class="btn" href="#gerbariy">${esc(t.heroCta)}</a>
        </div>
      </div>
      <svg class="hero__sprig" viewBox="0 0 600 220" aria-hidden="true" focusable="false">
        <path class="sprig__stem" d="${sprig.stem}"/>
        <path class="sprig__leaves" d="${sprig.leaves}"/>
      </svg>
      <svg class="hero__dapple" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><path d="${B.dapple()}"/></svg>
    </div>
  </section>

  <!-- 2 · THE LETTER. Intimacy. reveal (the letter unfolds). -->
  <section id="maktub" class="act-letter ground-dark sc-section" data-sc-act="flow" tabindex="-1">
    <div class="sc-wrap letter-grid">
      <article class="letter on-paper" data-sc-reveal="down" data-sc-reveal-at="0.08 0.4">
        ${clipped('0 0 40 600', 'M20 0 L20 600', '0.2 0.62', 'v', 'letter__stitch')}
        <h2 class="display letter__hi">${esc(t.letterHi)}</h2>
        ${t.letter.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
        <p class="letter__sign">${esc(t.letterSign)}<br><span>Rosemarine</span><br><em>${esc(t.letterSignName)}</em></p>
      </article>
      <figure class="letter__pin" data-sc-in>
        ${print('brand-stamp', 'Rosemarine', 'print--pin', 619, 800)}
        <figcaption>${esc(t.letterPrint)}</figcaption>
      </figure>
    </div>
  </section>

  <!-- 3 · THE STRIKE. Recognition, then hush. flow; the thread strikes each word from --sc-p. -->
  <section id="tarkib" class="act-strike ground-paper" data-sc-act="flow">
    <div class="sc-wrap strike">
      <ul class="strike__list">
        ${t.strike.map((w, i) => `<li><span class="struck">${esc(w)}${clipped('0 0 100 20', i % 2 ? 'M2 12 C26 6 52 15 98 8' : 'M2 9 C30 15 60 5 98 12', `${(0.2 + i * 0.07).toFixed(2)} ${(0.3 + i * 0.07).toFixed(2)}`)}</span></li>`).join('\n        ')}
      </ul>
      <p class="strike__note">${esc(t.strikeNote)}</p>
      <p class="hush display">${esc(t.hush)}</p>
    </div>
  </section>

  <!-- 4 · THE ROSE. Awe, the peak. Longest pin: the thread draws a rose, the drawing becomes the soap. -->
  <section id="atirgul" class="act-rose ground-paper" data-sc-act="pin" data-sc-span="2.6">
    <div data-sc-stage class="rose">
      <h2 class="display rose__h" data-sc-cue="0 0.34 0" data-sc-kinetic="lines">${esc(t.roseH)}</h2>
      <div class="rose__box" style="--bx:${(bloom.x * 100).toFixed(2)}%;--by:${(bloom.y * 100).toFixed(2)}%">
        <svg class="rose__drawing" viewBox="0 0 1200 800" aria-hidden="true" focusable="false" data-fade="0.44 0.6">${drawn(B.roseBranch(), '0.17 0.45').replace('data-draw=', 'data-life data-draw=')}</svg>
        <figure class="rose__photo" data-sc-reveal="iris" data-sc-reveal-at="0.4 0.6">
          <img src="IMG/soap-shea-pink-clay.webp" width="600" height="404" alt="${esc(t.roseAlt)}" loading="lazy" decoding="async">
        </figure>
      </div>
      <div class="label label--rose on-paper" data-sc-cue="0.56 1 0.08 0">
        <p class="label__latin">${esc(byId.rose.latin)} · argilla rosea</p>
        <h3 class="label__name">${esc(byId.rose.name[lang])}</h3>
        <p class="label__note">${esc(byId.rose.note[lang])}</p>
        <p class="label__meta"><span>${esc(byId.rose.size[lang])}</span><span class="label__price">${money(lang, byId.rose.price)}</span></p>
        ${addBtn(t, 'rose', byId.rose.name[lang])}
      </div>
    </div>
  </section>

  <!-- 5 · THE DRYING LINE. Abundance. pan: specimen sheets hang from the thread. -->
  <section id="gerbariy" class="act-rail ground-dark" data-sc-act="pan" data-sc-span="2.6">
    <div data-sc-stage class="railstage">
      ${clipped('0 0 1000 40', 'M0 14 C250 30 500 30 750 22 S1000 10 1000 10', '0.04 0.27', 'h', 'line').replace('data-draw=', 'data-life data-draw=')}
      <div class="rail" data-sc-pan="0.04">
        <div class="rail__lead">
          <h2 class="display">${esc(t.railH)}</h2>
          <p>${esc(t.railP)}</p>
        </div>
        ${RAIL.map((id, i) => railCard(t, lang, id, i)).join('')}
        <div class="rail__end on-paper">
          ${specimenSvg('chamomile', '0.7 0.98', 'specimen--end')}
          <p>${esc(t.railEnd)}</p>
          <a class="link" href="#barchasi" data-open-all>${esc(t.railEndLink)}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- 6 · THE FINDER. Being understood. flow + in: the brand's own Muammo / Nima qilaman? -->
  <section id="muammo" class="act-finder ground-paper sc-section" data-sc-act="flow">
    <div class="sc-wrap finder">
      <div class="finder__ask" data-sc-in data-sc-stagger="60">
        <h2 class="display">${esc(t.finderH)}</h2>
        <p class="finder__p">${esc(t.finderP)}</p>
        <div class="chips" role="group" aria-label="${esc(t.finderH)}">
          ${CONCERNS.map((c, i) => `<button type="button" class="chip-btn" data-concern="${c.id}" aria-pressed="${i === 0}">${esc(t.concerns[c.id])}</button>`).join('\n          ')}
        </div>
      </div>
      <div class="finder__answer on-paper" aria-live="polite">
        ${CONCERNS.map((c, i) => `
        <div class="answer" data-answer="${c.id}" ${i ? 'hidden' : ''}>
          <p class="answer__q">${esc(t.concerns[c.id])}</p>
          <ul class="answer__list">
            ${c.items.map((id) => pickRow(t, lang, byId[id])).join('\n            ')}
          </ul>
          ${t.concernNote[c.id] ? `<p class="answer__note">${esc(t.concernNote[c.id])}</p>` : ''}
        </div>`).join('')}
      </div>
      <details class="all on-paper" id="barchasi">
        <summary><span>${esc(t.allH)}</span><span class="all__n">${PRODUCTS.filter((p) => !p.set).length}</span></summary>
        <ul class="answer__list all__list">
          ${PRODUCTS.filter((p) => !p.set).map((p) => pickRow(t, lang, p)).join('\n          ')}
        </ul>
      </details>
    </div>
  </section>

  <!-- 7 · VOICES. Warmth. parallax: real notes taped in at different depths. -->
  <section id="fikrlar" class="act-voices ground-dark sc-section" data-sc-act="flow">
    <div class="sc-wrap voices">
      <div class="voices__head" data-sc-in data-sc-stagger="60">
        <h2 class="display">${esc(t.voicesH)}</h2>
        <p>${esc(t.voicesP)}</p>
      </div>
      <div class="notes">
        ${REVIEWS.map((r, i) => `
        <figure class="note on-paper note--${i}" data-sc-parallax="${[-0.9, 0.5, -0.4, 0.9][i]}">
          ${tape()}
          ${lang === 'uz'
            ? `<blockquote><p>${esc(r.uz)}</p></blockquote>`
            : `<blockquote><p>${esc(r[lang])}</p></blockquote><p class="note__tr" lang="uz">${esc(r.uz)}</p>`}
          <figcaption>${esc(r.by)}${t.translated ? ` · <span>${esc(t.translated)}</span>` : ''}</figcaption>
        </figure>`).join('')}
      </div>
    </div>
  </section>

  <!-- 8 · GIFTS. Generosity. reveal: the box opens. -->
  <section id="sovga" class="act-gift ground-paper sc-section" data-sc-act="flow">
    <div class="sc-wrap gift">
      <figure class="gift__photo" data-sc-reveal="up" data-sc-reveal-at="0.12 0.42">
        <img src="IMG/gift-set-teacher.webp" width="800" height="800" alt="${esc(t.giftAlt)}" loading="lazy" decoding="async">
      </figure>
      <div class="gift__copy" data-sc-in data-sc-stagger="60">
        <h2 class="display gift__h">${esc(t.giftH)}</h2>
        <p>${esc(t.giftP)}</p>
        <ul class="ledger">
          ${PRODUCTS.filter((p) => p.set).map((p) => `<li><span class="ledger__name">${esc(p.name[lang])}${p.note[lang] ? `<small>${esc(p.note[lang])}</small>` : ''}</span><span class="ledger__dots" aria-hidden="true"></span><span class="ledger__price">${money(lang, p.price)}</span>${addBtn(t, p.id, p.name[lang])}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  </section>

  <!-- 9 · THE ORDER SLIP. Resolve. A plain section on every screen: the order
       form must never depend on scroll position or be clipped by a pinned frame.
       The thread still ties itself back into the logo when the slip comes into view. -->
  <section id="varaqa" class="act-close ground-dark" data-sc-act="flow">
    <div class="close">
      <div class="close__copy">
        <h2 class="display"><span data-when="full" hidden>${esc(t.slipH)}</span><span data-when="empty">${esc(t.slipHEmpty)}</span></h2>
        <p><span data-when="full" hidden>${esc(t.slipP)}</span><span data-when="empty">${esc(t.slipPEmpty)}</span></p>
      </div>
      <div class="slip on-paper">
        ${logoSvg('logo--slip', 'inview', false, false)}
        <h3 class="slip__title">${esc(t.slipTitle)}</h3>
        <ul class="slip__list" data-slip-list></ul>
        <div class="slip__start" data-slip-empty>
          <p class="slip__empty">${esc(t.startH)}</p>
          <ul class="slip__picks">
            ${['balm', 'sidr', 'cream'].map((id) => `<li><span>${esc(byId[id].name[lang])}</span><em>${money(lang, byId[id].price)}</em>${addBtn(t, id, byId[id].name[lang])}</li>`).join('')}
          </ul>
        </div>
        <p class="slip__total" data-slip-total hidden><span>${esc(t.slipTotal)}</span><strong data-total>0</strong></p>
        <div class="slip__actions">
          <a class="btn" data-send href="https://t.me/rmehrchi" target="_blank" rel="noopener">${esc(t.cta)}</a>
          <button class="btn btn--quiet" type="button" data-copy hidden>${esc(t.copy)}</button>
        </div>
        <p class="slip__help">${esc(t.help)}</p>
        <p class="slip__fine">${esc(t.priceNote)}</p>
      </div>
      <div class="delivery">
        <h3>${esc(t.deliveryH)}</h3>
        ${t.delivery.map((d) => `<p>${esc(d)}</p>`).join('')}
      </div>
      <footer class="foot">
        <p>${esc(t.foot)} © 2026 Rosemarine Organic</p>
        <p class="foot__links">
          <a href="https://t.me/rmehrchi" target="_blank" rel="noopener">@rmehrchi</a>
          <a href="https://t.me/rosemarine_organic" target="_blank" rel="noopener">${esc(t.channels)}</a>
          <a href="https://t.me/rousemarine_otziv" target="_blank" rel="noopener">${esc(t.reviewsChannel)}</a>
          <a href="https://www.instagram.com/rosemarine_organic/" target="_blank" rel="noopener">Instagram</a>
        </p>
      </footer>
    </div>
  </section>

</main>

<script id="catalog" type="application/json">${JSON.stringify({
    lang,
    currency: { uz: ' soʻm', ru: ' сум', en: ' UZS' }[lang],
    t: { cta: t.cta, maxed: t.maxed, copy: t.copy, copied: t.copied, remove: t.remove, more: t.more, less: t.less, msgHi: t.msgHi, msgTotal: t.msgTotal, add: t.add, added: t.added },
    products: Object.fromEntries(PRODUCTS.map((p) => [p.id, { name: p.name[lang], price: p.price, priceText: money(lang, p.price) }])),
  }).replace(/</g, '\\u003c')}</script>
<script src="ROOT/scrollcraft.js"></script>
<script src="ROOT/site.js"></script>
</body>
</html>
`;
}
