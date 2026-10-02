// Procedural monoline botanicals, drawn in the same single-weight line as the
// Rosemarine logo. Every drawing returns ONE path string whose subpaths are in
// drawing order, so a stroke-dashoffset sweep draws it the way a hand would.

const f = (n) => Math.round(n * 10) / 10;
const P = (x, y) => `${f(x)} ${f(y)}`;
const rad = (d) => (d * Math.PI) / 180;
const pol = (x, y, ang, r) => [x + Math.cos(rad(ang)) * r, y + Math.sin(rad(ang)) * r];

// point + tangent angle on a cubic bezier
function bez(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const x = mt ** 3 * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t ** 3 * p3[0];
  const y = mt ** 3 * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t ** 3 * p3[1];
  const dx = 3 * mt * mt * (p1[0] - p0[0]) + 6 * mt * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * mt * mt * (p1[1] - p0[1]) + 6 * mt * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI };
}
const curve = (c) => `M${P(...c[0])} C${P(...c[1])} ${P(...c[2])} ${P(...c[3])}`;

// A leaf from its base, pointing along `ang`. `w` is the half-width as a
// fraction of length. veins: 0 none, 1 midrib, 3 midrib + two laterals.
export function leaf(x, y, ang, len, w = 0.32, veins = 1, curl = 0) {
  const [tx, ty] = pol(x, y, ang + curl, len);
  const sp = 10 + w * 82;                    // how far the sides swell out
  const [a1x, a1y] = pol(x, y, ang + curl - sp, len * 0.5);
  const [a2x, a2y] = pol(tx, ty, ang + curl + 180 + sp * 0.62, len * 0.42);
  const [b1x, b1y] = pol(tx, ty, ang + curl + 180 - sp * 0.62, len * 0.42);
  const [b2x, b2y] = pol(x, y, ang + curl + sp, len * 0.5);
  let d = `M${P(x, y)} C${P(a1x, a1y)} ${P(a2x, a2y)} ${P(tx, ty)} C${P(b1x, b1y)} ${P(b2x, b2y)} ${P(x, y)}`;
  if (veins >= 1) {
    const [mx, my] = pol(x, y, ang + curl * 0.5, len * 0.82);
    d += ` M${P(x, y)} Q${P(...pol(x, y, ang + curl * 0.3, len * 0.45))} ${P(mx, my)}`;
  }
  if (veins >= 3) {
    for (const s of [-1, 1]) {
      const [sx, sy] = pol(x, y, ang, len * 0.08);
      const [ex, ey] = pol(x, y, ang + s * 13, len * 0.7);
      const [cx, cy] = pol(x, y, ang + s * 24, len * 0.36);
      d += ` M${P(sx, sy)} Q${P(cx, cy)} ${P(ex, ey)}`;
    }
  }
  return d;
}

// A closed rosebud: teardrop, one petal edge, two sepal strokes hugging it.
export function rosebud(x, y, ang, s) {
  const H = (a, r) => pol(x, y, ang + a, r);
  const [tx, ty] = H(0, s);
  const T = (a, r) => pol(tx, ty, ang + 180 + a, r);
  let d = `M${P(x, y)} C${P(...H(-58, s * 0.5))} ${P(...T(-30, s * 0.42))} ${P(tx, ty)}`;
  d += ` C${P(...T(30, s * 0.42))} ${P(...H(58, s * 0.5))} ${P(x, y)}`;
  d += ` M${P(...H(-30, s * 0.3))} C${P(...H(-6, s * 0.56))} ${P(...H(12, s * 0.7))} ${P(...H(4, s * 0.86))}`;
  for (const k of [-1, 1]) {
    d += ` M${P(x, y)} C${P(...H(k * 74, s * 0.32))} ${P(...H(k * 48, s * 0.56))} ${P(...H(k * 34, s * 0.74))}`;
  }
  return d;
}

// An open rose seen from above at an angle: a spiral heart, then petals
// wrapping outward. Centre x,y, radius r.
export function roseBloom(x, y, r, tilt = 0) {
  const E = (a, rr, sq = 0.78) => {
    const t = rad(a);
    const px = Math.cos(t) * rr, py = Math.sin(t) * rr * sq;
    const ct = Math.cos(rad(tilt)), st = Math.sin(rad(tilt));
    return [x + px * ct - py * st, y + px * st + py * ct];
  };
  const arc = (a0, a1, r0, r1, sq) => {
    let out = '';
    const n = 14;
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      const rr = (r0 + ((r1 - r0) * i) / n) * (1 + 0.045 * Math.sin(rad(a) * 5));
      out += (i ? ' L' : 'M') + P(...E(a, rr, sq));
    }
    return out;
  };
  let d = arc(200, 560, r * 0.05, r * 0.26, 0.86);           // the heart spiral
  d += ' ' + arc(150, 380, r * 0.34, r * 0.4, 0.84);
  d += ' ' + arc(330, 560, r * 0.44, r * 0.5, 0.82);
  d += ' ' + arc(100, 290, r * 0.6, r * 0.7, 0.8);
  d += ' ' + arc(250, 460, r * 0.72, r * 0.8, 0.8);
  d += ' ' + arc(-30, 190, r * 0.88, r, 0.78);               // outer petal lip
  d += ' ' + arc(190, 330, r, r * 0.9, 0.78);
  return d;
}

// The Rosemarine mark, redrawn as one continuous line: the leaf and the wave
// first, then the stem rising, then the bud. Native box: 150 200 270 230.
export const LOGO_VIEWBOX = '150 196 272 226';
export const LOGO =
  'M250 350 C226 342 196 336 168 330 C164 360 184 392 214 402 C236 409 256 408 276 401 ' +
  'C294 395 304 384 314 380 C324 376 328 391 340 392 C356 393 372 384 390 378 ' +
  'M250 405 L250 262 ' +
  'M250 300 C220 300 199 274 202 224 C228 227 245 241 250 262 C255 241 272 227 298 224 C301 274 280 300 250 300';

// The thread leaving the logo's wave, as a separate path in the same box.
export const LOGO_TAIL = 'M390 378 C404 373 414 380 416 396 L416 422';
// On a wide title sheet the thread keeps going: right, then down the sheet's
// margin, clear of the headline, to its bottom edge.
export const LOGO_TAIL_LONG = 'M390 378 C520 352 760 372 860 470 C940 548 960 700 950 880 C942 1040 960 1220 990 1400';

// ---------------------------------------------------------------- the rose --
// Box 0 0 1200 800. A branch rising from lower left to upper right.
export function roseBranch() {
  const stem = [[40, 790], [360, 640], [620, 540], [930, 300]];
  let d = curve(stem);
  // thorns
  for (const t of [0.12, 0.27, 0.43, 0.61, 0.78]) {
    const p = bez(...stem, t);
    const [ax, ay] = pol(p.x, p.y, p.a - 90, 3);
    const [bx, by] = pol(p.x, p.y, p.a - 140, 20);
    const [cx, cy] = pol(p.x, p.y, p.a, 14);
    d += ` M${P(ax, ay)} L${P(bx, by)} L${P(cx, cy)}`;
  }
  // compound leaves: petiole + 5 leaflets
  const compound = (t, side, size) => {
    const p = bez(...stem, t);
    const pa = p.a + side * 52;
    const [ex, ey] = pol(p.x, p.y, pa, size * 1.9);
    let s = ` M${P(p.x, p.y)} Q${P(...pol(p.x, p.y, pa - side * 10, size))} ${P(ex, ey)}`;
    s += ' ' + leaf(ex, ey, pa, size * 0.95, 0.34, 3);
    for (const [k, fr] of [[0.38, 0.85], [0.72, 0.7]]) {
      const [lx, ly] = pol(p.x, p.y, pa - side * 4, size * 1.9 * k);
      s += ' ' + leaf(lx, ly, pa - 62, size * fr * 0.9, 0.34, 1);
      s += ' ' + leaf(lx, ly, pa + 62, size * fr * 0.9, 0.34, 1);
    }
    return s;
  };
  d += compound(0.2, -1, 92) + compound(0.36, 1, 84) + compound(0.55, -1, 96) + compound(0.7, 1, 78);
  // side shoot with two buds
  const sp = bez(...stem, 0.5);
  const shoot = [[sp.x, sp.y], [sp.x + 40, sp.y - 120], [sp.x + 10, sp.y - 230], [sp.x - 30, sp.y - 300]];
  d += ' ' + curve(shoot);
  const se = bez(...shoot, 1);
  d += ' ' + rosebud(se.x, se.y, se.a, 104);
  const sp2 = bez(...stem, 0.84);
  const shoot2 = [[sp2.x, sp2.y], [sp2.x + 70, sp2.y + 10], [sp2.x + 130, sp2.y + 40], [sp2.x + 160, sp2.y + 90]];
  d += ' ' + curve(shoot2);
  const se2 = bez(...shoot2, 1);
  d += ' ' + rosebud(se2.x, se2.y, se2.a, 88);
  // the main bud at the tip
  const tip = bez(...stem, 1);
  const [bx, by] = pol(tip.x, tip.y, tip.a, 92);
  d += ` M${P(tip.x, tip.y)} L${P(...pol(tip.x, tip.y, tip.a, 22))}`;
  d += ' ' + leaf(tip.x, tip.y, tip.a - 70, 64, 0.12, 0, 20) + ' ' + leaf(tip.x, tip.y, tip.a + 76, 58, 0.12, 0, -20);
  d += ' ' + roseBloom(bx, by, 96, tip.a + 90);
  return d;
}

// ---------------------------------------------------- rail specimens ------
// Box 0 0 300 360. Each is a herbarium specimen in the same line.

export function sidr() { // Ziziphus spina-christi: zigzag twig, three-veined leaves, small fruit
  const pts = [[150, 352], [138, 290], [166, 232], [140, 172], [164, 112], [146, 40]];
  let d = `M${P(...pts[0])}`;
  for (let i = 1; i < pts.length; i++) d += ` L${P(...pts[i])}`;
  pts.slice(1, -1).forEach((p, i) => {
    const s = i % 2 ? 1 : -1;
    d += ' ' + leaf(p[0], p[1], s > 0 ? -20 : 200, 74, 0.42, 3);
    if (i % 2 === 0) d += ` M${P(p[0] + 8, p[1] + 2)} a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0`;
  });
  d += ' ' + leaf(146, 40, -100, 46, 0.42, 1);
  return d;
}

export function orange() { // Citrus sinensis: fruit on a leafy twig, plus a slice
  let d = 'M60 30 C90 60 112 92 128 132';
  d += ' ' + leaf(84, 52, -10, 80, 0.36, 3) + ' ' + leaf(104, 86, 170, 66, 0.36, 1);
  d += ' M128 132 m-62 62 a62 62 0 1 0 124 0 a62 62 0 1 0 -124 0';
  d += ' M128 128 l0 10';
  const cx = 214, cy = 290, r = 52;
  d += ` M${P(cx - r, cy)} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`;
  d += ` M${P(cx - r + 8, cy)} a${r - 8} ${r - 8} 0 1 0 ${(r - 8) * 2} 0 a${r - 8} ${r - 8} 0 1 0 ${-(r - 8) * 2} 0`;
  for (let i = 0; i < 9; i++) {
    const [x2, y2] = pol(cx, cy, i * 40, r - 10);
    d += ` M${P(cx, cy)} L${P(x2, y2)}`;
  }
  return d;
}

export function charcoal() { // Carbo activatus: a charred branch and broken pieces of charcoal
  let d = 'M36 96 C96 84 170 92 262 66';
  d += ' M36 122 C100 112 176 118 262 92';
  d += ' M36 96 C28 104 28 116 36 122 M262 66 C272 74 272 86 262 92';
  d += ' M70 100 l12 14 M118 96 l-8 18 M160 98 l14 12 M208 86 l-10 16';
  d += ' M150 70 C160 54 170 46 186 40 ' + leaf(186, 40, -30, 30, 0.4, 1);
  const chunk = (pts) => 'M' + pts.map((q) => P(...q)).join(' L') + ' Z';
  d += ' ' + chunk([[70, 236], [112, 206], [160, 222], [168, 270], [124, 300], [76, 284]]);
  d += ' M112 206 L124 250 L168 270 M124 250 L76 284';
  d += ' ' + chunk([[186, 250], [228, 232], [262, 262], [246, 304], [200, 306]]);
  d += ' M228 232 L222 276 L262 262 M222 276 L200 306';
  d += ' ' + chunk([[132, 318], [158, 306], [176, 330], [150, 348]]);
  d += ' M158 306 L156 334';
  return d;
}

export function coconut() { // Cocos nucifera with sweet almond: a split nut under a frond
  let d = 'M20 120 C90 60 180 40 286 52';
  for (let i = 1; i <= 11; i++) {
    const p = bez([20, 120], [90, 60], [180, 40], [286, 52], i / 12);
    d += ` M${P(p.x, p.y)} L${P(...pol(p.x, p.y, p.a - 70, 52 - i * 2))}`;
    d += ` M${P(p.x, p.y)} L${P(...pol(p.x, p.y, p.a + 70, 44 - i * 2))}`;
  }
  const cx = 150, cy = 262;
  d += ` M${P(cx - 92, cy)} C${P(cx - 92, cy + 70)} ${P(cx + 92, cy + 70)} ${P(cx + 92, cy)}`;
  d += ` M${P(cx - 92, cy)} C${P(cx - 60, cy - 26)} ${P(cx + 60, cy - 26)} ${P(cx + 92, cy)}`;
  d += ` M${P(cx - 72, cy + 2)} C${P(cx - 50, cy - 14)} ${P(cx + 50, cy - 14)} ${P(cx + 72, cy + 2)}`;
  d += ` M${P(cx - 72, cy + 2)} C${P(cx - 70, cy + 46)} ${P(cx + 70, cy + 46)} ${P(cx + 72, cy + 2)}`;
  d += ' ' + leaf(236, 320, -150, 46, 0.5, 1); // an almond
  return d;
}

export function laurel() { // Laurus nobilis: opposite lanceolate leaves, berries
  let d = 'M150 356 C146 270 158 160 150 30';
  const at = [[318, 62], [262, 70], [206, 76], [150, 72], [96, 60]];
  at.forEach(([y, len], i) => {
    const x = 150 + Math.sin(i) * 4;
    d += ' ' + leaf(x, y, -50 + i * 3, len, 0.24, 1, -6);
    d += ' ' + leaf(x, y, 230 - i * 3, len, 0.24, 1, 6);
  });
  d += ' ' + leaf(150, 30, -90, 40, 0.24, 1);
  for (const [x, y] of [[176, 238], [186, 252], [168, 254]]) d += ` M${P(x - 6, y)} a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0`;
  return d;
}

export function castor() { // Ricinus communis: three mottled beans and a drop of their oil
  let d = '';
  const bean = (x, y, ang, l) => {
    const [tx, ty] = pol(x, y, ang, l);
    const w = l * 0.36;
    const c = (k, side) => pol(x, y, ang + side * 90, w * k);
    let q = `M${P(x, y)} C${P(...pol(...c(1, -1), ang, l * 0.2))} ${P(...pol(...c(1.05, -1), ang, l * 0.86))} ${P(tx, ty)}`;
    q += ` C${P(...pol(...c(1.05, 1), ang, l * 0.86))} ${P(...pol(...c(1, 1), ang, l * 0.2))} ${P(x, y)}`;
    q += ` M${P(...pol(x, y, ang, l * 0.08))} L${P(...pol(x, y, ang, l * 0.2))}`;          // the caruncle
    for (const [k, s2] of [[0.38, -0.4], [0.55, 0.35], [0.72, -0.2], [0.48, 0.05]]) {
      const [mx, my] = pol(...pol(x, y, ang, l * k), ang + 90, w * s2);
      q += ` M${P(mx, my)} a5 3 ${ang} 1 0 10 0`;
    }
    return q;
  };
  d += bean(70, 220, -20, 92) + ' ' + bean(150, 290, 10, 86) + ' ' + bean(96, 318, -60, 74);
  // a drop of oil falling into a small pool
  d += ' M220 60 C220 60 182 118 182 142 C182 164 199 178 220 178 C241 178 258 164 258 142 C258 118 220 60 220 60 Z';
  d += ' M204 146 C206 156 212 162 222 164';
  d += ' M186 220 C204 212 236 212 254 220 C236 228 204 228 186 220';
  return d;
}

export function chamomile() { // Matricaria chamomilla, for small glyphs
  const cx = 150, cy = 120;
  let d = `M${P(cx, cy + 22)} C150 220 140 290 150 352`;
  d += ` M${P(cx - 20, cy)} a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0`;
  for (let i = 0; i < 14; i++) d += ' ' + leaf(...pol(cx, cy, i * 25.7, 22), i * 25.7, 46, 0.22, 0);
  d += ' ' + leaf(148, 270, 210, 54, 0.18, 1) + ' ' + leaf(150, 230, -30, 48, 0.18, 1);
  return d;
}

// ---------------------------------------- hero foreground: a pressed sprig --
// Filled, not stroked: the one plane that is a physical object lying on the
// sheets. Box 0 0 600 220. Returns { stem, leaves } so they can be styled.
export function rosemarySprig() {
  const stem = [[10, 170], [180, 120], [380, 96], [590, 40]];
  const leaves = [];
  for (let i = 0; i < 26; i++) {
    const t = 0.04 + (i / 26) * 0.94;
    const p = bez(...stem, t);
    const side = i % 2 ? 1 : -1;
    const len = 58 - t * 26;
    leaves.push(needle(p.x, p.y, p.a + side * (38 + t * 12), len));
  }
  return { stem: curve(stem), leaves: leaves.join(' ') };
}
function needle(x, y, ang, len) {
  const [tx, ty] = pol(x, y, ang, len);
  const [a, b] = [pol(x, y, ang - 8, len * 0.55), pol(x, y, ang + 8, len * 0.55)];
  return `M${P(x, y)} Q${P(...a)} ${P(tx, ty)} Q${P(...b)} ${P(x, y)} Z`;
}

export const SPECIMENS = { sidr, orange, charcoal, coconut, laurel, castor, chamomile };

// Where the open bloom sits inside the 1200x800 rose box, as fractions, so
// the photograph can open exactly where the drawn flower is.
export function roseBloomAt() {
  const stem = [[40, 790], [360, 640], [620, 540], [930, 300]];
  const tip = bez(...stem, 1);
  const [bx, by] = pol(tip.x, tip.y, tip.a, 92);
  return { x: bx / 1200, y: by / 800, r: 96 / 1200 };
}

// Leaf shadows for the hero, as if a plant stood between the window and the
// sheets. Filled shapes, blurred in CSS. Box 0 0 1440 900.
export function dapple() {
  const spots = [[180, 120, 30, 150], [260, 180, -20, 120], [120, 260, 60, 130], [980, 90, 140, 170], [1080, 160, 110, 130],
    [1180, 70, 170, 150], [640, 820, -60, 160], [760, 760, -100, 130], [1320, 640, 200, 150], [40, 700, 20, 140]];
  return spots.map(([x, y, a, l]) => {
    const [tx, ty] = pol(x, y, a, l);
    const sp = 34;
    const c = (k, s2) => pol(x, y, a + s2 * sp, l * k);
    return `M${P(x, y)} C${P(...c(0.5, -1))} ${P(...pol(tx, ty, a + 180 + 20, l * 0.4))} ${P(tx, ty)} C${P(...pol(tx, ty, a + 180 - 20, l * 0.4))} ${P(...c(0.5, 1))} ${P(x, y)} Z`;
  }).join(' ');
}
