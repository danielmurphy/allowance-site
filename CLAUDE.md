# allowance-site

Marketing site for the Allowance iOS app, served at https://getallowance.app.

## Deployment

**GitHub Pages**, source = `main` branch, root path. No build step — pushing to `main` publishes the site. Custom domain `getallowance.app` configured via the `CNAME` file. HTTPS enforced (Let's Encrypt cert auto-renewed by GitHub).

**To deploy:** commit and push to `origin/main`. Site is usually live within 1–2 minutes.

**To verify:**
- `gh api repos/danielmurphy/allowance-site/pages` shows current Pages config + last build status.
- `curl -I https://getallowance.app/` should return 200.

## Layout

- `index.html`, `privacy.html`, `style.css`, `images/` — marketing pages.
- `CNAME` — custom domain config (do not delete).
- `.well-known/apple-app-site-association` — Apple Universal Links manifest. Must be served as JSON with no extension and no redirects. Tied to the iOS app's Team ID + Bundle ID; touch only when those change.
- `invite/index.html` — landing page for `https://getallowance.app/invite/{familyId}/{inviteId}?t={token}` deep links. Reads path segments + `?t=` query param; offers "Open in Allowance" deep link + App Store fallback.

## Things to watch

- `.gitignore` doesn't exist. Don't commit `.DS_Store` or `.claude/settings.local.json`.
- AASA file changes can take up to 24h for iOS to refresh on installed devices (cached at install time and refreshed lazily). Plan AASA edits accordingly.
