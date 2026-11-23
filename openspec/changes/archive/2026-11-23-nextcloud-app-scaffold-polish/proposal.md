## Why

The repository scaffold was created with stub files that compile and route correctly in theory, but the PHP controller, Vite config, CSP integration, and template wiring have not been validated against real Nextcloud conventions. Before any WASM or game-runtime work begins, the app must actually load in a Nextcloud instance with correct routing, a working JS bundle served at the expected path, and a Content Security Policy that satisfies Nextcloud's framework without blocking the canvas.

## What Changes

- **Routing** — Verify `appinfo/routes.php` and `GameController` produce the correct Nextcloud URL (`/index.php/apps/doomnextcloud`) with no 404 or redirect loop.
- **Template** — Ensure `templates/game.php` uses `script()` / `style()` helpers with correct file paths matching Vite output; add CSP nonce passthrough for any inline elements if needed.
- **Vite config** — Fix output paths so `public/js/main.js` and `public/css/app.css` are emitted at exactly the filenames the PHP helpers reference; configure asset `base` URL correctly.
- **CSP** — Hook into Nextcloud's `AddContentSecurityPolicyEvent` (or equivalent) to declare the narrowest policy that allows canvas rendering and WASM preparation (`wasm-unsafe-eval`); document which directives are added and why.
- **Navigation entry** — Confirm the `<navigation>` entry in `appinfo/info.xml` renders the app icon and name in the Nextcloud sidebar correctly.
- **App icon** — Replace SVG placeholders in `resources/img/` with valid Nextcloud-compatible icon SVGs (correct viewBox, no raster embeds).
- **`occ app:check-code` baseline** — Ensure the PHP skeleton passes `app:check-code` with zero violations.

## Capabilities

### New Capabilities

- `app-routing`: Defines the complete request path from Nextcloud navigation entry → controller → template response, including URL structure and middleware.
- `csp-policy`: Defines the Content Security Policy the app registers via Nextcloud's event system, including directives required for canvas and future WASM execution.
- `frontend-build`: Defines the Vite build pipeline: entry points, output paths, filename conventions, and how built assets are referenced from PHP templates.

### Modified Capabilities

<!-- No existing specs yet — this is the first change. -->

## Impact

- `appinfo/info.xml` — minor update to icon reference and navigation block.
- `appinfo/routes.php` — validate and potentially adjust route name/URL.
- `lib/Controller/GameController.php` — may add CSP event registration or middleware hook.
- `lib/AppInfo/Application.php` — register `AddContentSecurityPolicyEvent` listener if needed.
- `templates/game.php` — ensure nonce attribute and correct `script()`/`style()` calls.
- `js/vite.config.js` — fix `base`, `outDir`, and asset filename patterns.
- `resources/img/app-dark.svg`, `app-light.svg` — replace placeholder with valid SVGs.
- `css/app.css` — no structural change; verify it loads correctly.
- CI (`ci.yml`) — `occ app:check-code` step must pass (zero violations).
