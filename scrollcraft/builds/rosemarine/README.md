# Rosemarine Organic website

Static site, three languages: `/` (Uzbek), `/ru/`, `/en/`.

    node build.mjs        # writes dist/
    node ~/.claude/skills/scroll-craft/scripts/serve.mjs --root dist --port 4517

Deploy: upload `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

Before launch:
- Set the real domain in `src/template.mjs` (`SITE`, used for canonical, hreflang and og tags).
- Confirm every price in `src/data.mjs` with the owner. They are the last plain-text prices the brand posted (Jun to Aug 2026).
- Have the owner read the founder's letter (`T.*.letter` in `src/data.mjs`). It is a draft built only from facts in their posts.
- Have a native speaker review the Uzbek and Russian copy.

Content: `src/data.mjs`. Drawings: `src/botany.mjs`. Page: `src/template.mjs`, `src/site.css`, `src/site.js`.
The engine (`src/scrollcraft.*`) is copied from the scroll-craft skill and must not be edited.
