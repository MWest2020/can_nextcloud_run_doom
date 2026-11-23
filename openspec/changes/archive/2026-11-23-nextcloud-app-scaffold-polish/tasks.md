## 1. CSP Listener

- [x] 1.1 Create `lib/Listener/ContentSecurityPolicyListener.php` with namespace `OCA\DoomNextcloud\Listener`, `declare(strict_types=1)`, implementing `OCP\EventDispatcher\IEventListener`, with a typed `handle(Event $event): void` method
- [x] 1.2 Implement the `handle()` method to add `wasm-unsafe-eval` to `script-src` via `addAllowedScriptDomain('\'wasm-unsafe-eval\'')` on the `ContentSecurityPolicy` object from `AddContentSecurityPolicyEvent`
- [x] 1.3 Implement the `handle()` method to add `blob:` to `worker-src` via `addAllowedWorkerSrcDomain('blob:')` on the same policy object
- [x] 1.4 Add an app namespace scope check in `handle()` so the listener returns early without modifying the policy when the request does not belong to `doomnextcloud`
- [x] 1.5 Register the listener in `lib/AppInfo/Application.php` inside `register()` via `$context->registerEventListener(AddContentSecurityPolicyEvent::class, ContentSecurityPolicyListener::class)`
- [x] 1.6 Verify that `unsafe-inline` and `unsafe-eval` are absent from all `addAllowed*` calls in the listener, and that only additive methods are used (no reset or replace calls)

## 2. Vite Build Fix

- [x] 2.1 Add `base: '/apps/doomnextcloud/'` as a top-level option in `js/vite.config.js` inside `defineConfig`
- [x] 2.2 Set `cssCodeSplit: false` in the `build` options of `js/vite.config.js`
- [x] 2.3 Change `assetFileNames` in `rollupOptions.output` to return `'../css/app.css'` for CSS assets (replacing the current `../../public/css/app.css` path)
- [x] 2.4 Run `npm run build` inside `js/` and confirm `public/js/main.js` is emitted with no content hash in the filename
- [x] 2.5 Confirm `public/css/app.css` is emitted with no content hash in the filename after the build
- [x] 2.6 Inspect the built output to confirm no external URLs (`http://`, `https://`, CDN hostnames) appear in `public/js/main.js` or `public/css/app.css`

## 3. App Icon SVG Fix

- [x] 3.1 Replace `resources/img/app-dark.svg` with a path-based SVG using `viewBox="0 0 32 32"`, no `<text>` or `<image>` elements, no raster embeds, and a light fill suitable for dark backgrounds (or `fill="currentColor"`)
- [x] 3.2 Replace `resources/img/app-light.svg` (or `app.svg`) with a path-based SVG using `viewBox="0 0 32 32"`, no `<text>` or `<image>` elements, no raster embeds, and no `width`/`height` attributes on the root `<svg>` element

## 4. PHP Baseline (occ app:check-code)

- [x] 4.1 Verify `lib/AppInfo/Application.php` has `declare(strict_types=1)` at the top and that `register()` and `boot()` have explicit `void` return types
- [x] 4.2 Verify `lib/Controller/GameController.php` has `declare(strict_types=1)`, explicit parameter type hints, and `TemplateResponse` return type on all public methods
- [x] 4.3 Confirm `lib/Listener/ContentSecurityPolicyListener.php` uses only `OCP\` APIs (no `OC_` classes, no deprecated NC APIs), has correct namespace `OCA\DoomNextcloud\Listener`, and `declare(strict_types=1)`
- [x] 4.4 Manually audit all three PHP class files for deprecated API usage, missing type declarations, and any `OC_` class references; resolve any findings

## 5. Routing Verification

- [x] 5.1 Confirm `appinfo/routes.php` contains an entry with `name` equal to `game#index`, `verb` equal to `GET`, and `url` equal to `/`
- [x] 5.2 Confirm the `<route>` element inside the `<navigation>` block of `appinfo/info.xml` contains the value `doomnextcloud.game.index`
- [x] 5.3 Confirm `GameController::index()` carries the `#[NoAdminRequired]`, `#[NoCSRFRequired]`, and `#[FrontpageRoute(verb: 'GET', url: '/')]` attributes and that `#[FrontpageRoute]` matches the `routes.php` declaration

## 6. Template Verification

- [x] 6.1 Confirm `templates/game.php` calls `script(Application::APP_ID, 'main')` and `style(Application::APP_ID, 'app')` with filenames matching the Vite output (`main.js` and `app.css`)
- [x] 6.2 Confirm the canvas element in `templates/game.php` has `tabindex="0"` and an `aria-label` attribute
- [x] 6.3 Confirm `templates/game.php` contains no hardcoded `<script src="...">` or `<link href="...">` tags that bypass Nextcloud's `script()` and `style()` asset helpers

## 7. CI Check

- [x] 7.1 Update the `app-check-code` step comment in `.github/workflows/ci.yml` to note that the PHP files in this change have been manually audited and are check-code-ready
- [x] 7.2 Confirm the `js-build` CI step will succeed with the updated Vite config by verifying that `npm ci` followed by `npm run build` exits with code 0 in a clean environment
