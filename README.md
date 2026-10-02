# Rosemarine Organic: website

A three-language website (Uzbek, Russian, English) for Rosemarine Organic, a brand of handmade organic soap and hair care.

- **Site source:** `scrollcraft/builds/rosemarine/` (see its README)
- **Ready-to-publish site:** `scrollcraft/builds/rosemarine/dist/`
- **Brand content brief:** `CONTENT.md`
- **Photos used by the site:** `assets/images/`

## Publish

Point any static host at `scrollcraft/builds/rosemarine/dist` (Netlify, Cloudflare Pages, GitHub Pages). No build step is needed on the host; `dist/` is committed.

## Change content (prices, texts, products)

1. Edit `scrollcraft/builds/rosemarine/src/data.mjs`
2. Rebuild (needs Node 18+ and ffmpeg):

       cd scrollcraft/builds/rosemarine
       node build.mjs

3. Commit and push. The host republishes `dist/`.
