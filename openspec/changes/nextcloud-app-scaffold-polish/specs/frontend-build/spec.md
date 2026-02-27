# Spec: frontend-build

Defines the Vite build pipeline: entry points, output paths, filename conventions, and how built assets are referenced from PHP templates using Nextcloud's `script()` and `style()` helpers.

## ADDED Requirements

### Requirement: JS entry point produces `public/js/main.js`

Running `npm run build` from the `js/` directory SHALL produce the file `public/js/main.js` at the repository root level. The output filename MUST NOT include a content hash suffix. The entry point for the build is `js/src/main.js`.

This filename convention is required because Nextcloud's `script('doomnextcloud', 'main')` helper resolves to `/apps/doomnextcloud/js/main.js` at runtime, making the filename a fixed contract between the build and the PHP template.

#### Scenario: successful build emits main.js without hash

- WHEN `npm run build` is executed inside the `js/` directory
- THEN the file `public/js/main.js` SHALL exist at the repository root
- THEN no file matching the pattern `public/js/main-*.js` or `public/js/main.[hash].js` SHALL exist

#### Scenario: template references built JS via script() helper

- WHEN the `game.php` template calls `script(Application::APP_ID, 'main')`
- THEN Nextcloud SHALL serve the file at the URL path `/apps/doomnextcloud/js/main.js`
- THEN the served file SHALL be the file emitted by the Vite build at `public/js/main.js`

---

### Requirement: CSS extracted to `public/css/app.css`

CSS imported within the JS source tree SHALL be extracted by Vite during the build and output to `public/css/app.css`. The filename MUST NOT include a content hash suffix.

This is required because Nextcloud's `style('doomnextcloud', 'app')` helper resolves to `/apps/doomnextcloud/css/app.css` at runtime.

#### Scenario: build emits app.css without hash

- WHEN `npm run build` completes successfully
- THEN the file `public/css/app.css` SHALL exist at the repository root
- THEN no file matching the pattern `public/css/app-*.css` or `public/css/app.[hash].css` SHALL exist

#### Scenario: template references built CSS via style() helper

- WHEN the `game.php` template calls `style(Application::APP_ID, 'app')`
- THEN Nextcloud SHALL serve the file at the URL path `/apps/doomnextcloud/css/app.css`
- THEN the served file SHALL be the file emitted by the Vite build at `public/css/app.css`

---

### Requirement: Vite config sets correct `base` path for runtime asset resolution

The Vite configuration SHALL set the `base` option to the Nextcloud public path for the app (`/apps/doomnextcloud/`). This ensures that any asset URLs embedded in the built bundle (for dynamic imports, worker scripts, or other references) resolve correctly when the app is served by Nextcloud.

#### Scenario: dynamically imported chunk resolves at runtime

- WHEN the built `main.js` contains a dynamic `import()` or worker instantiation referencing a chunk URL
- THEN the resolved URL SHALL begin with `/apps/doomnextcloud/js/`
- THEN the browser SHALL be able to fetch that URL from the Nextcloud server without a 404

#### Scenario: build without base set causes broken asset paths

- WHEN the Vite config omits the `base` option or sets it to `/`
- THEN any dynamically referenced assets SHALL resolve relative to the document root
- THEN those URLs SHALL NOT match the Nextcloud app public path and SHALL fail at runtime
- THEN this configuration SHALL be considered non-conformant with this requirement

---

### Requirement: build MUST NOT reference external URLs

The Vite configuration and all JS source files under `js/src/` MUST NOT import from or reference any external URL (CDN, unpkg, esm.sh, or any `http://` / `https://` URL). All dependencies MUST be bundled from `node_modules` or inlined.

#### Scenario: source contains no CDN import statements

- WHEN all files under `js/src/` are scanned for import declarations
- THEN no import path SHALL start with `http://` or `https://`
- THEN no import path SHALL reference an external hostname

#### Scenario: Vite config contains no external URL references

- WHEN `js/vite.config.js` is inspected
- THEN the `external` rollup option SHALL NOT list any URL-shaped strings
- THEN no `define` or `resolve.alias` entry SHALL redirect imports to an external URL

---

### Requirement: `npm run build` exits with code 0 on success and non-zero on error

The `build` script defined in `js/package.json` SHALL exit with process exit code 0 when the build completes without errors. It SHALL exit with a non-zero exit code when any compilation, module resolution, or output error occurs, so that CI pipelines can detect build failures.

#### Scenario: clean build succeeds with exit code 0

- WHEN `npm run build` is executed in a clean environment with all dependencies installed
- THEN the process SHALL exit with code 0
- THEN `public/js/main.js` and `public/css/app.css` SHALL be present

#### Scenario: build with missing entry point exits non-zero

- WHEN the entry point `js/src/main.js` does not exist
- THEN `npm run build` SHALL exit with a non-zero exit code
- THEN no partial output files SHALL be left in a state that could be mistaken for a successful build

#### Scenario: build with invalid JS syntax exits non-zero

- WHEN `js/src/main.js` contains a syntax error
- THEN `npm run build` SHALL exit with a non-zero exit code
- THEN Vite SHALL emit an error message to stderr describing the failure

---

### Requirement: built `main.js` is served with `Content-Type: application/javascript`

The file `public/js/main.js`, as served by Nextcloud to the browser, SHALL have the HTTP response header `Content-Type: application/javascript` (or `text/javascript`). The browser MUST NOT receive a MIME-type that causes it to refuse execution of the script.

#### Scenario: browser loads main.js without MIME-type error

- WHEN the browser requests `/apps/doomnextcloud/js/main.js`
- THEN the Nextcloud server SHALL respond with `Content-Type: application/javascript` or `Content-Type: text/javascript`
- THEN the browser SHALL execute the script without a MIME-type blocking error in the console

#### Scenario: MIME type mismatch blocks script execution

- WHEN the server responds to the `main.js` request with `Content-Type: text/plain` or any non-JS MIME type
- THEN browsers with strict MIME checking SHALL refuse to execute the script
- THEN this outcome SHALL be considered non-conformant with this requirement

---

### Requirement: `js/package.json` declares all build dependencies explicitly

The `js/package.json` file MUST list every package required to execute `npm run build` under `dependencies` or `devDependencies`. The build MUST NOT rely on any package that is globally installed on the host system, injected by the CI environment, or otherwise not declared in `package.json`.

#### Scenario: build succeeds from a fresh install

- WHEN `npm ci` (or `npm install`) is run in the `js/` directory against a clean `node_modules`
- THEN `npm run build` SHALL complete successfully using only the packages declared in `package.json`
- THEN no `MODULE_NOT_FOUND` or missing-dependency error SHALL occur

#### Scenario: undeclared global dependency causes failure in clean environment

- WHEN a package used by the build is available globally on the developer machine but not listed in `package.json`
- THEN `npm run build` in a fresh CI environment SHALL fail with a module resolution error
- THEN this SHALL be treated as a missing declaration in `package.json` that MUST be corrected
