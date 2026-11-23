## Context

DoomNextcloud is a Nextcloud app that will run a WASM-based Doom-like game inside the Nextcloud web UI. Before any game engine or WASM work begins, the PHP scaffold, Vite build pipeline, and CSP integration must be validated against real Nextcloud conventions. This design covers the scaffold polish change described in the proposal: routing, CSP listener placement, Vite output path correctness, asset base URL, SVG icon conformance, and the `occ app:check-code` baseline.

This change introduces three new capabilities (`app-routing`, `csp-policy`, `frontend-build`) and touches `appinfo/routes.php`, `appinfo/info.xml`, `lib/AppInfo/Application.php`, `lib/Controller/GameController.php`, `templates/game.php`, `js/vite.config.js`, and `resources/img/`. No WASM, no game engine code, and no external CDN dependencies are introduced or permitted.

Current state of the files read:

- `appinfo/routes.php` — already correct: `name: game#index`, `url: /`, `verb: GET`.
- `appinfo/info.xml` — navigation block present with `<route>doomnextcloud.game.index</route>` and `<icon>app.svg</icon>`. SVG files are placeholders.
- `lib/AppInfo/Application.php` — `register()` and `boot()` are empty stubs; no CSP listener is registered yet.
- `lib/Controller/GameController.php` — returns `TemplateResponse(APP_ID, 'game', [], RENDER_AS_USER)` with `#[NoAdminRequired]`, `#[NoCSRFRequired]`, and `#[FrontpageRoute]` attributes.
- `templates/game.php` — calls `script(Application::APP_ID, 'main')` and `style(Application::APP_ID, 'app')` correctly.
- `js/vite.config.js` — `outDir` is `../public/js` but CSS `assetFileNames` uses the path `../../public/css/app.css` relative to `outDir`, which resolves outside the Rollup asset pipeline correctly. The `base` option is missing.
- `js/package.json` — declares only `vite ^5.0.0` as a dev dependency; build script is `vite build`.

---

## Goals / Non-Goals

**Goals**

- Confirm the routing chain from URL to controller to template is correct and document why each choice was made.
- Decide where to place the CSP listener and specify the exact directives it must set.
- Fix the Vite config so that `public/css/app.css` is emitted reliably and the `base` URL is set correctly.
- Specify the minimal SVG icon fix required for Nextcloud compatibility.
- Establish what `occ app:check-code` checks and confirm the current PHP files satisfy those checks.

**Non-Goals**

- WASM loading, MIME-type handling for `.wasm` files, or any game runtime integration.
- Audio worklet implementation (blob worker-src is declared now as preparation; the worklet itself is future work).
- ESLint configuration or any JS linting toolchain.
- Accessibility audit beyond what is already in the template.
- Multi-instance or multi-user session handling.

---

## Decisions

### 1. Route name `doomnextcloud.game.index`

The route entry in `appinfo/routes.php` is:

```php
['name' => 'game#index', 'url' => '/', 'verb' => 'GET']
```

Nextcloud's router derives the fully qualified route name by prepending the app ID with a dot and converting the `#` separator to a dot, producing `doomnextcloud.game.index`. This matches the `<route>` element in `appinfo/info.xml` and the requirement in spec `app-routing` ("Route name follows Nextcloud convention"). No change is required to `routes.php`.

The `#[FrontpageRoute(verb: 'GET', url: '/')]` attribute on `GameController::index()` duplicates the route declaration for tools that read attributes rather than `routes.php`. Both must stay in sync; during this change both already agree.

### 2. `RENDER_AS_USER` is correct; `RENDER_AS_GUEST` must not be used

`TemplateResponse::RENDER_AS_USER` instructs Nextcloud to wrap the template output in the full authenticated user shell: top navigation bar, sidebar, and page chrome. This is required by spec `app-routing` ("Controller returns TemplateResponse with RENDER_AS_USER") and is the correct mode because:

- The game page is only reachable by authenticated users (unauthenticated requests are caught by Nextcloud's authentication middleware before the controller is invoked, per spec `app-routing` "Unauthenticated users are redirected to Nextcloud login").
- `RENDER_AS_GUEST` omits the user shell and is intended for pages that must be reachable without a session (login page, public shares). Using it here would remove the navigation bar and break the visual integration with Nextcloud.
- `RENDER_AS_BLANK` would produce a response with no surrounding HTML at all, which is appropriate only for API responses or iframes, not the main app entry point.

The `#[NoAdminRequired]` attribute on `GameController::index()` does not bypass session authentication; it only suppresses the admin-role check so that any authenticated non-admin user can access the page. This is the correct annotation for a game available to all users.

### 3. CSP listener placement: dedicated `Listener/ContentSecurityPolicyListener.php`

**Decision**: place the CSP logic in a new class `OCA\DoomNextcloud\Listener\ContentSecurityPolicyListener` in `lib/Listener/ContentSecurityPolicyListener.php`. Register it from `Application::register()` using:

```php
$context->registerEventListener(
    \OCP\Security\CSP\AddContentSecurityPolicyEvent::class,
    \OCA\DoomNextcloud\Listener\ContentSecurityPolicyListener::class
);
```

**Why not inline in `Application::register()`**: spec `csp-policy` ("CSP listener registration") explicitly requires that "no CSP modification code SHALL appear directly in `Application::register()` or `Application::boot()`". Beyond spec compliance, a dedicated listener class is independently testable, keeps `Application` a thin bootstrap entry point, and follows the pattern used by Nextcloud's own first-party apps.

**Why not in `Application::boot()`**: `boot()` runs after all apps are registered; event listener registration must happen during `register()` so the listener is in place before the event fires.

**Directives the listener must set**:

- Add `wasm-unsafe-eval` to `script-src` via `addAllowedScriptDomain('\'wasm-unsafe-eval\'')` (or the equivalent typed method if available in the target Nextcloud version). This satisfies spec `csp-policy` "wasm-unsafe-eval in script-src".
- Add `blob:` to `worker-src` via `addAllowedWorkerSrcDomain('blob:')`. This satisfies spec `csp-policy` "blob: in worker-src".

**Why `wasm-unsafe-eval` and not `unsafe-eval`**: `unsafe-eval` grants permission to evaluate arbitrary JavaScript strings via `eval()`, `new Function()`, and `setTimeout(string)`. This would nullify a significant portion of Nextcloud's XSS mitigations and is explicitly forbidden by spec `csp-policy` ("WASM execution is permitted by the policy": "`unsafe-eval` MUST NOT appear in `script-src`"). `wasm-unsafe-eval` is a narrower keyword introduced specifically for WASM compilation; it permits `WebAssembly.compile()` and related APIs but does not permit JS string evaluation. It is supported in Chrome 95+, Firefox 102+, and Safari 16+, which aligns with the "latest 2 major versions" requirement in `appinfo/info.xml`. Browsers that do not recognise `wasm-unsafe-eval` block WASM silently, which is a safe failure rather than a security regression (spec `csp-policy` "Policy does not regress on older browsers").

**Why not `unsafe-inline`**: Nextcloud's framework issues per-request nonces for any legitimately inlined scripts. Adding `unsafe-inline` would cause browsers to ignore all nonces, nullifying that protection across the entire page. Spec `csp-policy` ("No unsafe-inline for scripts") explicitly prohibits it. The current `templates/game.php` contains no inline `<script>` blocks; if any are added later they must use the `$nonce` variable provided by Nextcloud's template engine.

**App namespace scoping**: The listener must check that the current request belongs to the `doomnextcloud` app before modifying the policy (spec `csp-policy` "Policy scoped to the doomnextcloud app namespace"). The standard approach is to inject `IRequest` and inspect the route or to check the appName from the event context. The listener must return early without modifying the `ContentSecurityPolicy` object if the request is for a different app.

**Additive-only modifications**: The listener must call only additive methods (`addAllowedScriptDomain`, `addAllowedWorkerSrcDomain`) on the `ContentSecurityPolicy` object it receives from the event. It must not call any method that clears or replaces existing directives. This preserves Nextcloud's default policy for all other pages (spec `csp-policy` "Default Nextcloud CSP must not be broken").

### 4. Vite CSS output path fix

**The problem**: The current `vite.config.js` sets `outDir` to `resolve(__dirname, '../public/js')` and then uses `assetFileNames` returning `'../../public/css/app.css'`. The `assetFileNames` return value is interpreted by Rollup as a path relative to `outDir`. A path starting with `../..` escapes the `outDir` and writes the CSS file relative to the repository root's parent directory. On most file systems this resolves to `public/css/app.css` at the repository root only if `outDir` is exactly two levels deep from the root, which is coincidentally true for this layout — but the path is fragile: it breaks if `outDir` is changed, if the repository is nested, or if Vite/Rollup tightens its handling of `assetFileNames` paths that escape `outDir`.

**Decision**: set a separate explicit `outDir` for CSS by configuring Vite's `build.assetsDir` and overriding the CSS extraction path using a deterministic approach. The recommended fix is:

1. Keep `outDir` as `resolve(__dirname, '../public/js')`.
2. Change `assetFileNames` to return `'../css/app.css'` for CSS assets. This emits the file at `outDir/../css/app.css` which resolves to `public/css/app.css` at the repository root. One level of `..` is less fragile than two and is consistent with `outDir` being `public/js`.
3. Set `cssCodeSplit: false` in `build` options to ensure all CSS from the entire module graph is gathered into a single `app.css` rather than being split into per-chunk files with hashed names. Without `cssCodeSplit: false`, Vite may emit additional CSS chunks alongside `main.js` that bypass the custom `assetFileNames` pattern.

The resulting config section:

```js
build: {
    outDir: resolve(__dirname, '../public/js'),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
        input: { main: resolve(__dirname, 'src/main.js') },
        output: {
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            assetFileNames: (assetInfo) => {
                if (assetInfo.name?.endsWith('.css')) {
                    return '../css/app.css'
                }
                return '[name].[ext]'
            },
        },
    },
    chunkSizeWarningLimit: 4096,
},
```

This satisfies spec `frontend-build` "CSS extracted to `public/css/app.css`" without introducing a PostCSS pipeline or a separate CSS entry point, which would add build complexity not required by the specs.

An alternative approach — adding a dedicated CSS entry file and using `vite-plugin-css-entry` or a custom PostCSS step — would also work but introduces additional dependencies and configuration surface. The `cssCodeSplit: false` + corrected relative path approach is simpler, has no additional dependencies, and remains within the declared `devDependencies` of `js/package.json` (only `vite`).

### 5. Vite `base` URL

**Decision**: add `base: '/apps/doomnextcloud/'` to `vite.config.js` at the top level of `defineConfig`.

This satisfies spec `frontend-build` "Vite config sets correct `base` path for runtime asset resolution".

**Why it is required**: when `base` is not set, Vite defaults it to `/`. Any asset URL that Vite embeds in the built bundle — for dynamic `import()` calls, chunk URLs, or future WASM `fetch()` references — is then emitted as an absolute path from the document root (e.g., `/js/worker.js`). Nextcloud serves app assets under `/apps/doomnextcloud/`, not at the root. A chunk or asset fetched from `/js/worker.js` returns a 404; the same chunk at `/apps/doomnextcloud/js/worker.js` is found. Setting `base: '/apps/doomnextcloud/'` causes Vite to prefix all embedded asset references with that path, making them correct for Nextcloud's URL structure.

This is especially important for the WASM phase that follows this scaffold work: WASM module URLs, audio worklet URLs, and dynamically imported engine glue will all be embedded by Vite's bundler and must resolve correctly under the Nextcloud app path.

The constraint "No external CDNs" (proposal and spec `frontend-build` "build MUST NOT reference external URLs") is unaffected by the `base` setting; `base` controls only relative-to-root paths within the same origin.

### 6. App icon SVG fix

**The problem**: Nextcloud expects app icons to be plain SVG files with:
- A square `viewBox` (e.g., `viewBox="0 0 64 64"` or `viewBox="0 0 16 16"`).
- No embedded raster data (`<image>` elements or `data:` URIs containing PNG/JPEG/WebP).
- Shapes rendered with vector primitives (`<path>`, `<circle>`, `<rect>`, `<polygon>`, etc.) so the icon scales cleanly at any resolution and renders identically across all environments without font dependencies.

The current placeholder SVGs in `resources/img/` use a `<text>` element to render a glyph. `<text>` rendering is font-dependent: the output varies by operating system, browser, installed fonts, and whether the specified font is available. The icon may render as a blank square (tofu) on systems where the font is not installed. Nextcloud's icon pipeline may also rasterise SVGs server-side using a headless renderer that does not load web fonts, producing incorrect output.

**Decision**: replace the `<text>`-based placeholder in both `resources/img/app.svg` and `resources/img/app-dark.svg` with a minimal path-based SVG. The fix must satisfy:

1. A square `viewBox` (e.g., `viewBox="0 0 64 64"`).
2. No `<text>`, `<image>`, `<use href="external">`, or embedded raster data.
3. Visual content expressed entirely as `<path>` or other geometric primitives.
4. No `width`/`height` attributes on the root `<svg>` element (Nextcloud controls sizing via CSS).
5. `app-dark.svg` must use a light fill suitable for dark backgrounds; `app.svg` may use a darker fill for light backgrounds. Using `currentColor` as the fill value is acceptable and allows Nextcloud's theme system to apply the correct colour automatically.

A minimal conformant SVG skeleton:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path fill="currentColor" d="M8 8h48v48H8z"/>
</svg>
```

The actual path data should represent a recognisable icon for the app (a stylised skull, joystick, or similar). The exact artwork is out of scope for this design; the requirement is that it uses only path data and meets the structural constraints above.

### 7. `occ app:check-code` baseline

**What the tool checks**: `occ app:check-code <appid>` performs static analysis of the app's PHP files. Its main checks are:

1. **Deprecated API usage** — flags calls to OCP/OCA APIs that have been marked `@deprecated` in the Nextcloud version targeted by `appinfo/info.xml`. The app targets Nextcloud 27–31; any API deprecated before NC 27 or after NC 31 will produce a violation.
2. **Missing or incorrect return type hints and parameter type hints** — the tool enforces that public methods in controllers and other OCP-interfacing classes carry PHP type declarations.
3. **Incorrect namespace usage** — the app namespace declared in `appinfo/info.xml` (`<namespace>DoomNextcloud</namespace>`) must match the PHP namespace used in class files (`OCA\DoomNextcloud\...`). Mismatches produce violations.
4. **Missing `declare(strict_types=1)`** — required at the top of every PHP file.
5. **Use of private/internal Nextcloud APIs** — classes under `OC\` (as opposed to `OCP\`) are considered private; using them produces violations.

**Current PHP file status**:

- `lib/AppInfo/Application.php` — uses only `OCP\AppFramework\App`, `IBootContext`, `IBootstrap`, `IRegistrationContext`. All are public OCP interfaces. `declare(strict_types=1)` is present. `register()` and `boot()` have correct return type `void`. No violations expected.
- `lib/Controller/GameController.php` — uses `OCP\AppFramework\Controller`, `OCP\AppFramework\Http\Attribute\FrontpageRoute`, `OCP\AppFramework\Http\Attribute\NoAdminRequired`, `OCP\AppFramework\Http\Attribute\NoCSRFRequired`, `OCP\AppFramework\Http\TemplateResponse`, `OCP\IRequest`. All are public OCP APIs. `declare(strict_types=1)` is present. `index()` has return type `TemplateResponse`. The `@return TemplateResponse` docblock is redundant alongside the PHP return type but is not a violation. No violations expected.
- `appinfo/routes.php` — not a class file; `app:check-code` does not analyse it for type hints. No violations expected.
- `templates/game.php` — template files are not checked by `app:check-code`.

**What must be true after this change**: the new `lib/Listener/ContentSecurityPolicyListener.php` must:

- Declare `namespace OCA\DoomNextcloud\Listener;` at the top.
- Include `declare(strict_types=1);`.
- Implement `OCP\EventDispatcher\IEventListener` (the public interface for event listeners).
- Use only `OCP\` APIs (`OCP\Security\CSP\AddContentSecurityPolicyEvent`, `OCP\AppFramework\Http\ContentSecurityPolicy`, `OCP\IRequest`).
- Provide a typed `handle(Event $event): void` method (or the typed variant matching the target Nextcloud version).

No deprecated APIs are used in the current files. `app:check-code` is expected to pass with zero violations after this change provided the listener class is written to the standards above.

---

## Risks / Trade-offs

**CSS path fragility (partially mitigated)**: the `../css/app.css` relative path in `assetFileNames` is less fragile than `../../public/css/app.css` but still depends on the relationship between `outDir` and the intended CSS output directory. If `outDir` is changed in a future refactor without updating `assetFileNames`, CSS will be emitted at the wrong path. Mitigation: use `resolve(__dirname, '../public/css/app.css')` as the full target and compute the relative path from `outDir` programmatically. This is deferred as an enhancement; the simple `../css/app.css` is sufficient for the current layout.

**`wasm-unsafe-eval` browser support**: the keyword is not recognised by browsers older than Chrome 95 / Firefox 102 / Safari 16. On those browsers WASM execution fails silently rather than producing a CSP violation. This is acceptable (safe failure) for the MVP, but will result in a blank screen with no error message for users on older browsers. A future enhancement could detect WASM support and show an explicit "unsupported browser" message before attempting to load the engine.

**CSP scope check overhead**: the listener fires for every page request in Nextcloud, not just `doomnextcloud` pages. The app namespace check adds a small amount of per-request overhead. This is negligible in practice; the same pattern is used by other Nextcloud apps.

**`emptyOutDir: true` deletes all files in `public/js/` on each build**: if any manually placed files (e.g., WASM binaries, WAD files) are placed in `public/js/`, they will be deleted by the next build. Future work must either place WASM assets outside `public/js/` or add them to a pre-build copy step. `public/css/` is not inside `outDir` and is not affected.

**SVG icon artwork is a placeholder**: the minimal path-based SVG specified here is structurally correct for Nextcloud but visually nondescript. A proper icon should be designed before any public release. This is a non-functional risk only.

---

## Migration Plan

This change applies only to the development scaffold; there is no production installation to migrate. The steps are:

1. Update `js/vite.config.js`: add `base: '/apps/doomnextcloud/'`, set `cssCodeSplit: false`, correct `assetFileNames` to `'../css/app.css'` for CSS.
2. Create `lib/Listener/ContentSecurityPolicyListener.php` implementing `IEventListener`, adding `wasm-unsafe-eval` to `script-src` and `blob:` to `worker-src`, scoped to the `doomnextcloud` app namespace.
3. Update `lib/AppInfo/Application.php` to call `$context->registerEventListener(AddContentSecurityPolicyEvent::class, ContentSecurityPolicyListener::class)` inside `register()`.
4. Replace `resources/img/app.svg` and `resources/img/app-dark.svg` with conformant path-based SVGs.
5. Run `occ app:check-code doomnextcloud` and confirm zero violations.
6. Run `npm run build` inside `js/` and confirm `public/js/main.js` and `public/css/app.css` are emitted.
7. Load the app in a Nextcloud instance and confirm: navigation entry appears, route returns HTTP 200, user shell wraps the template, CSP header on the response includes `wasm-unsafe-eval` and `blob:`.

---

## Open Questions

1. **`IEventListener` handle method signature across Nextcloud versions**: Nextcloud 27 introduced a typed `handle(Event $event): void` signature on `IEventListener`. The app targets NC 27–31. The listener must not use a pre-NC27 untyped signature. Confirm that the `AddContentSecurityPolicyEvent` class is available under `OCP\Security\CSP\AddContentSecurityPolicyEvent` in all supported versions (27–31) before finalising the listener implementation.

2. **`cssCodeSplit: false` interaction with future chunk splitting**: once the WASM engine glue is added, the JS bundle may be deliberately split into multiple chunks for load performance. `cssCodeSplit: false` collapses all CSS into a single file regardless of chunk boundaries. If different chunks need different CSS loaded at different times, this approach will not work. Revisit when the WASM integration spec is written.

3. **SVG icon artwork**: a structurally valid but visually placeholder icon is specified here. A decision on the final icon design (skull motif, controller, or other) is deferred. Does the project have a designer or a preferred icon source?

4. **`occ app:check-code` version**: the tool's strictness varies across Nextcloud versions. Which Nextcloud version will be used for CI checks? The minimum supported version (NC 27) is the safest target; running against a higher version may flag APIs that are valid on NC 27 but deprecated on the CI version.
