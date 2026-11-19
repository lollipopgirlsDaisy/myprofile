# Sasihong Hakrawee — Profile

Personal profile website (white & orange theme) built from my CV.

## Flow
1. **Verify code** — type the 6-digit code shown on screen.
2. **Human check** — select every image that matches the prompt (e.g. "all images with a laptop").
3. **Profile** — Education → Work experience → Highlight projects → Skills → Contact.

A visitor who passes the gate isn't asked again in the same browser tab (sessionStorage).

## Files
- `index.html` — page structure and content
- `assets/style.css` — theme and layout
- `assets/app.js` — gate logic, scroll reveal, active nav
- `assets/portrait.jpg` — profile photo
- `assets/Sasihong_Hakrawee_CV.pdf` — downloadable CV
- `assets/highlights/*.svg` — illustrations for the highlight project cards

No build step: deploy the repo root as a static site (Cloudflare, GitHub Pages, etc.).

> The gate runs in the browser, so it is a playful touch, not real access control.
