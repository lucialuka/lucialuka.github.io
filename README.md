# Lucas Fang · Engineering across layers

Personal portfolio for Lucas Fang, a hardware–software co-design engineer.
Plain HTML, CSS, JavaScript and SVG. No framework, no build step, no third-party scripts, no API keys.

**Site:** https://lucialuka.github.io/ · **Repo:** https://github.com/lucialuka/lucialuka.github.io

## Contents

1. [Quick start](#quick-start)
2. [Project layout](#project-layout)
3. [How to change things](#how-to-change-things)
4. [Light and dark mode](#light-and-dark-mode)
5. [The hero diagram](#the-hero-diagram)
6. [Font sizes](#font-sizes)
7. [Debugging checklist](#debugging-checklist)
8. [Publishing](#publishing)
9. [Content rules](#content-rules)

## Quick start

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Reload after each edit. If a change does not show up, hard-reload (⌘⇧R) because the browser caches `styles.css` and `app.js`.

Do not open `index.html` by double-clicking it. Dialogs, fonts and absolute paths in `404.html` behave differently from `file://`, so always test through the local server.

## Project layout

| File | What it does |
| --- | --- |
| `index.html` | All page content, the hero SVG, and a small inline script that sets the theme before first paint |
| `styles.css` | Theme tokens, layout, components, responsive rules (one declaration per line, grouped by section) |
| `app.js` | Theme toggle, hero interactions, project filters, case-study text, dialogs, command palette |
| `404.html` | Standalone error page with its own inline styles and the same theme logic |
| `assets/` | Résumé PDF, favicon, social card, local fonts (Manrope, DM Mono) with their licenses |
| `docs/content-sources.md` | Where each factual claim comes from and how it is qualified |
| `.github/workflows/pages.yml` | Copies the public files into `_site/` and deploys to GitHub Pages |
| `output/` | Local screenshots. Git-ignored. Never deployed |

`styles.css` section order: tokens → base → header → hero → work → about/experience → contact/footer → dialogs → animations → breakpoints (1560, 1200, 960, 720, 370 px) → theme and small-screen fixes at the end. Later rules win over earlier ones, so when an edit has no effect, search the file for the same selector further down.

## How to change things

| I want to change… | Edit |
| --- | --- |
| Name, bio, experience, contact links | `index.html`. Update the email in `app.js` (`copy-email` handler) too |
| Case-study text (OpenAssembler, Grand Tool) | `caseStudies` object in `app.js` |
| Colors | Tokens at the top of `styles.css` (see below). Avoid adding raw hex values to components |
| Résumé | Replace `assets/Lucas-Fang-Resume.pdf`, keeping the file name |
| Domain | Canonical and `og:` URLs in `index.html`, plus `robots.txt` and `sitemap.xml` |

## Light and dark mode

- **Default:** follows the visitor's OS setting (`prefers-color-scheme`).
- **Toggle:** the sun/moon button in the header. The choice is saved in `localStorage` under the key `theme` (`light` or `dark`). Until the visitor clicks it, the site keeps following the OS.
- **No flash:** a tiny inline script in `<head>` sets `<html data-theme="…">` before the CSS paints. Do not move it into `app.js`.
- **Where colors live:** `:root` holds the light values and `:root[data-theme=dark]` overrides them.

| Token | Use |
| --- | --- |
| `--paper`, `--paper-deep`, `--raised` | Page, tinted sections, cards |
| `--ink`, `--muted`, `--faint` | Primary, secondary, tertiary text |
| `--line`, `--line-strong` | Borders |
| `--copper` | Accent |
| `--contact-bg` | Contact band background |

To add a new color, add the token to both `:root` blocks and use `var(--name)` in the component. The OpenAssembler panel (dark in both themes) and the contact band intentionally keep fixed colors.

To test: toggle in the header, or in DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme". To reset a saved choice, run `localStorage.removeItem('theme')` in the console.

## The hero diagram

The "Fig. 01" illustration is static SVG in `index.html` inside `<svg class="chip-svg">`. It shows three stacked layers that share one footprint: glass software plane, copper processor, circuit board.

- **Groups:** `.software-plane`, `.processor-plane`, `.hardware-plane`. The "Hardware / Software / The intersection" buttons set `data-layer` on `.chip-scene`, and CSS in the "Source, compute, silicon" section moves and fades the groups.
- **Colors:** every shape uses a `.d-*` class whose colors come from the `--d-*` variables on `.chip-scene` (one block for light, one for dark).
- **Labels:** the three callouts on the right (`.diagram-label`) sit outside the drawing so text never overlaps shapes. Below 720 px they are hidden and the plain-text `.layer-legend` appears instead.
- **Geometry:** isometric, slope 0.577, centre (290, 372) in a 640×520 viewBox. A point (u, v, height z) maps to `x = 290 + u − v`, `y = 372 + (u + v)·0.577 − z`. Planes are ±100 wide, so their corners line up vertically with the dashed guides. To move a shape, recompute with that formula; do not nudge one point by eye.
- **Signal animation:** `.signal-path` and `.signal-packet` run while `.chip-scene.is-running` is set by the "Send a signal" button.

## Font sizes

Rules of thumb used throughout `styles.css`:

- Real text is at least 10 px (labels), usually 11–13 px (small text) and 15 px for body text.
- The miniature dashboard inside the Grand Tool card (`.mini-*`, `.demo-*`) is a picture of a UI, so it keeps a smaller scale (7–12 px).
- Narrow-screen blocks no longer shrink text below the desktop value. If something overflows on a phone, fix the layout (wrap, stack, hide a label) before reducing the font.

Quick check for tiny text: in DevTools console, run the snippet in `Debugging checklist` below.

## Debugging checklist

| Symptom | Likely cause and fix |
| --- | --- |
| Style change has no effect | A later rule or media block overrides it. Search `styles.css` for the selector, and check the breakpoint blocks and the end of the file |
| Page shows the wrong theme | Check `document.documentElement.dataset.theme` in the console, then `localStorage.getItem('theme')`. Remove the key to follow the OS again |
| Something is unreadable in dark mode | It uses a hard-coded hex color. Replace it with a token, or add an override under `:root[data-theme=dark]` |
| Horizontal scrollbar on mobile | Find the element: `[...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth)` |
| Hero diagram text overlaps | Labels must stay at x ≥ 510 in the SVG, outside the drawing (right edge is x = 490). Keep at least 20 units between label baselines |
| Hero buttons do nothing | Open the console. A JavaScript error stops the rest of `app.js` from running |
| Fonts look wrong | Confirm `assets/fonts/*.ttf` load (Network tab, status 200) and the path matches `@font-face` |
| Works locally, not live | Pages deploys from `main` only; check the Actions tab. `index.html`, `404.html`, `styles.css`, `app.js`, `robots.txt`, `sitemap.xml`, `.nojekyll` and `assets/` are the only files copied |

Find text smaller than 10 px (excluding the mock dashboard):

```js
[...document.querySelectorAll('body *')].filter(e =>
  !e.closest('svg, .demo-browser') && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) &&
  parseFloat(getComputedStyle(e).fontSize) < 10).map(e => e.className || e.tagName)
```

## Publishing

Nothing is published automatically from your machine. The site goes live only when you push to `main`.

1. Review changes: `git status` and `git diff`.
2. Commit and push `main` when you are ready.
3. In **Settings → Pages**, the source must be **GitHub Actions**. The workflow deploys on every push to `main` and can be re-run from the Actions tab.
4. The live URL is shown in the workflow's `github-pages` environment.

## Content rules

- Benchmark numbers and gates are **repository-reported** and were not re-run for this site. Keep the qualifying notes next to them. Details: `docs/content-sources.md`.
- The prompt-to-demo widget is a **simulation** with preset content. It calls no model or API.
- Do not add employers, degrees or results that are not in the résumé.
- Fonts keep their SIL Open Font License notices. Project source code is linked, not copied.

## Last verified

Checked locally in headless Chromium after the light/dark mode and hero redesign: no console errors, no horizontal overflow at 320, 390, 768, 1024 and 1440 px in either theme, no real text under 10 px, and the theme toggle, theme persistence, OS-change following, layer buttons, signal animation, case-study dialogs, quick navigation, project filters and compiler stages all working. Not re-verified: Safari and Firefox, and the live deployment.
