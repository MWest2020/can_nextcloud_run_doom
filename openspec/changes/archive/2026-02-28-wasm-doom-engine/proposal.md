## Why

The scaffold is deployed and the PHP/JS plumbing works, but the canvas renders black because `initRuntime()` is a no-op placeholder. To fulfil the core promise of the app — a playable Doom-like game in the browser — we need a real WASM Doom engine connected to the canvas, WAD loader, input handling, and audio.

## What Changes

- Replace the placeholder `initRuntime()` in `js/src/runtime/loader.js` with a real Emscripten Module loader that drives the Doom engine.
- Update `js/src/runtime/input.js` to forward keyboard events into the Emscripten Module's input queue.
- Add `build/runtime/Dockerfile` and `build/runtime/build.sh` that compile **doomgeneric** (a portable Doom source port) to `doom.wasm` + `doom.js` using Emscripten.
- Provide a CI job that runs the Docker build and uploads `public/wasm/doom.wasm` + `public/wasm/doom.js` as release artifacts.
- Update `public/wasm/README.md` and `public/assets/freedoom/README.md` with concrete placement instructions.
- Update `THIRD_PARTY_NOTICES.md` with doomgeneric (BSD-like) and Freedoom (BSD-3-Clause) attribution.

## Capabilities

### New Capabilities

- `wasm-engine-loader`: Fetch `doom.js` (Emscripten glue) and `doom.wasm`, configure the Emscripten Module with our canvas element, load the Freedoom WAD into the virtual FS, then start the game loop.
- `wasm-input-bridge`: Map browser keyboard/mouse events to doomgeneric's `DG_GetKey()` callback so the game receives input.
- `wasm-audio`: Unlock Web Audio context on first user gesture and wire it to the Emscripten audio subsystem (SDL_mixer via Emscripten SDL2 audio backend).
- `wasm-build`: Docker + Emscripten build pipeline that produces reproducible `doom.wasm` / `doom.js` artifacts from doomgeneric source.

### Modified Capabilities

- `frontend-build`: The Vite build now must copy `public/wasm/doom.js` into the output so the loader can import it; and the `public/assets/` tree must be reachable at runtime. No requirement-level change to the Vite config itself, only the loader code changes.

## Impact

- `js/src/runtime/loader.js` — full replacement of placeholder.
- `js/src/runtime/input.js` — extend key/mouse mapping for Doom key codes.
- `build/runtime/Dockerfile`, `build/runtime/build.sh` — concrete Emscripten build.
- `.github/workflows/ci.yml` — add WASM build job.
- `public/wasm/` — receives built `doom.wasm` + `doom.js` (binary artifacts, gitignored).
- `THIRD_PARTY_NOTICES.md` — add doomgeneric + Freedoom entries.
- No PHP changes required; no new Nextcloud routes; no CSP changes (already allows `wasm-unsafe-eval` + `blob:`).
- Runtime dependency: `public/wasm/doom.wasm`, `public/wasm/doom.js`, `public/assets/freedoom/freedoom1.wad` — all placed by sysadmin or CI artifact download step.
