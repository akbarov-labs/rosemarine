// Builds dist/: / (uz), /ru/, /en/, shared css/js, webp images.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { render } from './src/template.mjs';
import { LOGO, LOGO_VIEWBOX } from './src/botany.mjs';

const DIST = 'dist';
const SRC_IMG = '../../../assets/images';
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'img'), { recursive: true });

for (const f of ['scrollcraft.css', 'scrollcraft.js', 'site.css', 'site.js']) fs.copyFileSync(path.join('src', f), path.join(DIST, f));
fs.writeFileSync(path.join(DIST, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO_VIEWBOX}"><rect x="150" y="196" width="272" height="226" rx="40" fill="#f1e8d8"/><path d="${LOGO}" fill="none" stroke="#1d3628" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></svg>`);

const pages = { uz: '.', ru: '..', en: '..' };
const used = new Set();
for (const [lang, root] of Object.entries(pages)) {
  let html = render(lang);
  for (const m of html.matchAll(/IMG\/([\w-]+)\.webp/g)) used.add(m[1]);
  html = html.replaceAll('IMG/', `${root}/img/`).replaceAll('ROOT', root);
  const dir = lang === 'uz' ? DIST : path.join(DIST, lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}
used.add('gift-set-teacher');
for (const name of used) {
  const src = path.join(SRC_IMG, name + '.jpg');
  if (!fs.existsSync(src)) { console.warn('missing image', name); continue; }
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', src, '-c:v', 'libwebp', '-quality', '82', path.join(DIST, 'img', name + '.webp')]);
}
console.log('built', Object.keys(pages).join(', '), '·', used.size, 'images');
