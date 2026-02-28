## 1. Build Infrastructure

- [x] 1.1 Write `build/runtime/Dockerfile` — `emscripten/emsdk` base, install git, clone doomgeneric at pinned commit, set workdir
- [x] 1.2 Write `build/runtime/build.sh` — run `emcc` with ASYNCIFY, USE_SDL=2, no pthreads, export `_DG_KeyEvent`, `_DG_MouseMoveEvent`, `_DG_MouseButtonEvent`; write output to `public/wasm/`
- [x] 1.3 Add `public/wasm/doom.wasm` and `public/wasm/doom.js` to `.gitignore`
- [x] 1.4 Update `public/wasm/README.md` with concrete build + placement instructions

## 2. Emscripten Platform Layer (C)

- [x] 2.1 Write `build/runtime/doomgeneric_wasm.c` — implement `DG_Init`, `DG_DrawFrame` (blit pixel buffer to canvas via JS interop), `DG_SleepMs`, `DG_GetTicksMs`, `DG_SetWindowTitle`
- [x] 2.2 Add EM_JS / EM_ASM blocks for `DG_DrawFrame` to call `ctx.putImageData` on the canvas
- [x] 2.3 Verify doomgeneric's `DG_KeyEvent` / `DG_MouseMoveEvent` / `DG_MouseButtonEvent` are exported and callable from JS

## 3. JS — WASM Engine Loader

- [x] 3.1 Replace placeholder `initRuntime(canvas)` in `js/src/runtime/loader.js` with the real loader
- [x] 3.2 Configure `window.Module` before loading `doom.js`: set `canvas`, `noInitialRun: true`, `onRuntimeInitialized`, `print`, `printErr`
- [x] 3.3 Fetch `freedoom1.wad` from `/apps/doomnextcloud/public/assets/freedoom/freedoom1.wad` as `ArrayBuffer`; on 404 throw a descriptive error caught by `main.js`
- [x] 3.4 On WAD fetch success: `Module.FS.createDataFile('/', 'freedoom1.wad', new Uint8Array(wadBytes), true, true)`
- [x] 3.5 Call `Module.callMain(['-iwad', '/freedoom1.wad'])` inside `onRuntimeInitialized`
- [x] 3.6 Dynamically insert `<script src="/apps/doomnextcloud/public/wasm/doom.js">` and resolve a Promise when it loads; reject on error

## 4. JS — Input Bridge

- [x] 4.1 Rewrite `js/src/runtime/input.js` to export `setupInput(canvas, getModule)` instead of the placeholder
- [x] 4.2 Build a lookup table mapping browser `event.key` strings to doomgeneric key constants (arrow keys, WASD, Space, Ctrl, Alt, Shift, Enter, Escape, F1–F12, 0–9)
- [x] 4.3 Attach `keydown` / `keyup` listeners on canvas; call `Module._DG_KeyEvent(1|0, doomKey)`; call `event.preventDefault()` for mapped keys
- [x] 4.4 Attach `mousemove` listener; compute `movementX` / `movementY` (or delta from last position); call `Module._DG_MouseMoveEvent(dx, dy)`
- [x] 4.5 Attach `mousedown` / `mouseup` listeners; map button index to Doom button flags; call `Module._DG_MouseButtonEvent(buttons)`
- [x] 4.6 Focus canvas on click so keyboard events are captured without tabbing first

## 5. JS — Audio Unlock

- [x] 5.1 Add audio unlock logic in `loader.js` or a new `js/src/runtime/audio.js`: on first canvas `click` or `keydown`, resume the AudioContext if `SDL` exposes it via `Module.SDL`
- [x] 5.2 Wrap audio unlock in try/catch; log warning and continue if AudioContext is unavailable

## 6. Integration Wiring in main.js

- [x] 6.1 Update `js/src/main.js` to call `setupInput(canvas, () => window.Module)` after `initRuntime` resolves (pass a getter so Module is available after async load)
- [x] 6.2 Verify loading overlay hides after `onRuntimeInitialized` fires (not after script load)
- [x] 6.3 Verify error overlay shows with correct message when WAD fetch fails

## 7. CI & Release

- [x] 7.1 Add `wasm-build` job to `.github/workflows/ci.yml` that runs `docker build` + `docker run build.sh` and uploads artifacts
- [x] 7.2 Add `wasm-build` job to `.github/workflows/release.yml` that attaches `doom.wasm` + `doom.js` to the GitHub release
- [x] 7.3 Update `.github/workflows/ci.yml` upload-artifact path from `public/js/` to `public/wasm/` for WASM artifacts

## 8. Attribution & Docs

- [x] 8.1 Add doomgeneric entry to `THIRD_PARTY_NOTICES.md` (license: BSD-like, link to upstream)
- [x] 8.2 Add Freedoom entry to `THIRD_PARTY_NOTICES.md` (license: BSD-3-Clause)
- [x] 8.3 Update `public/assets/freedoom/README.md` with exact download URL and placement path for sysadmins
