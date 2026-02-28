## ADDED Requirements

### Requirement: Loader fetches WASM engine artifacts from app bundle
The loader SHALL fetch `doom.js` and `doom.wasm` exclusively from `/apps/doomnextcloud/public/wasm/`.
No external URLs SHALL be used at runtime.

#### Scenario: Artifacts present and correct
- **WHEN** both `doom.js` and `doom.wasm` are present in `public/wasm/`
- **THEN** the loader fetches them without network errors and initialises the Emscripten Module

#### Scenario: Artifact missing
- **WHEN** `doom.wasm` returns a 404
- **THEN** the loader catches the error, hides the loading overlay, shows the error overlay

### Requirement: Loader mounts the Freedoom WAD into the virtual filesystem
Before the Emscripten Module is started the loader SHALL fetch `freedoom1.wad` from
`/apps/doomnextcloud/public/assets/freedoom/freedoom1.wad` and write it into the Emscripten FS
at path `/freedoom1.wad`, passing `-iwad /freedoom1.wad` on the command line.

#### Scenario: WAD fetch succeeds
- **WHEN** `freedoom1.wad` is present and the fetch returns 200
- **THEN** the file is available at `/freedoom1.wad` inside the WASM environment and Doom boots to the title screen

#### Scenario: WAD not found
- **WHEN** `freedoom1.wad` returns a 404 or network error
- **THEN** the loader shows the error overlay with the message "Failed to load the game. Check that Freedoom assets are installed correctly."

### Requirement: Loader passes the existing canvas element to the Emscripten Module
The Module SHALL use `document.getElementById('doomnextcloud-canvas')` as its rendering target.
No new canvas elements SHALL be created.

#### Scenario: Canvas found in DOM
- **WHEN** the `#doomnextcloud-canvas` element exists when the loader runs
- **THEN** the Emscripten Module renders frames into that element

#### Scenario: Canvas absent from DOM
- **WHEN** `document.getElementById('doomnextcloud-canvas')` returns null
- **THEN** the loader logs an error and returns early without throwing an unhandled exception

### Requirement: Loading overlay is hidden once the engine is ready
The loader SHALL hide `#doomnextcloud-loading` after the Emscripten Module fires its `onRuntimeInitialized` callback.

#### Scenario: Successful init
- **WHEN** `Module.onRuntimeInitialized` fires
- **THEN** `#doomnextcloud-loading` has `hidden` set to true

### Requirement: Loader runs without SharedArrayBuffer
The loader SHALL NOT require `SharedArrayBuffer`, `crossOriginIsolated`, or COOP/COEP headers.
The Emscripten build MUST be compiled without `-s USE_PTHREADS`.

#### Scenario: Page loaded without COOP/COEP headers
- **WHEN** `crossOriginIsolated` is false
- **THEN** the game still loads and renders correctly
