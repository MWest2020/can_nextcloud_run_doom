## Context

The scaffold renders a black canvas. `initRuntime()` in `js/src/runtime/loader.js` is a no-op.
We need to wire a real Doom WASM engine into that canvas using the Emscripten Module pattern.

Key runtime constraints:
- No SharedArrayBuffer / COOP/COEP (standard Nextcloud deploy doesn't set those headers).
- No external URLs — all assets served from `public/` inside the app bundle.
- CSP already allows `wasm-unsafe-eval` and `blob:` worker-src.
- WAD file is large (~20 MB); it is placed by the sysadmin, not bundled in the JS build.

## Goals / Non-Goals

**Goals:**
- Render a fully playable Doom-like game in the existing `#doomnextcloud-canvas` element.
- Support keyboard and mouse input.
- Support audio (OPL music + SFX) via Web Audio API, unlocked on first user gesture.
- Provide a reproducible Emscripten build pipeline in Docker.
- No new Nextcloud PHP changes required.

**Non-Goals:**
- Savegame persistence (no IndexedDB / filesystem API in MVP).
- Multiplayer / demo recording.
- Custom IWAD upload by end user.
- WASM streaming compilation (requires correct MIME type on WAD delivery — deferred).

## Decisions

### D1: Engine — doomgeneric compiled with Emscripten (not an existing pre-compiled binary)

**Choice:** Fork/use [doomgeneric](https://github.com/ozkl/doomgeneric) and compile it ourselves
with Emscripten in a Docker container (Dockerfile + build.sh in `build/runtime/`).

**Why not a pre-compiled binary from a third-party repo?**
- No published release provides a no-SharedArrayBuffer build suitable for vanilla Nextcloud.
- We cannot verify supply-chain integrity of random GitHub binaries.
- Building ourselves gives reproducibility and control over flags.

**Why doomgeneric over chocolate-doom / prboom-plus?**
- doomgeneric abstracts platform I/O behind a minimal C API (`DG_DrawFrame`, `DG_GetKey`, etc.),
  making the Emscripten platform layer trivial to write.
- Smaller codebase; MIT-compatible license.
- Proven in browser targets by several community ports.

**Emscripten flags (key):**
```
-O2
-s WASM=1
-s ASYNCIFY=1           # main loop blocking without pthreads
-s ALLOW_MEMORY_GROWTH=1
-s USE_SDL=2            # SDL2 for audio via Emscripten audio backend
-s NO_EXIT_RUNTIME=1
-s EXPORTED_FUNCTIONS='["_main","_DG_KeyEvent","_DG_MouseMoveEvent","_DG_MouseButtonEvent"]'
-s EXPORTED_RUNTIME_METHODS='["FS","callMain"]'
# NO -s USE_PTHREADS — avoids SharedArrayBuffer requirement
```

### D2: WAD loading — fetch + FS.createDataFile before Module start

**Choice:** In `initRuntime()`, fetch `freedoom1.wad` via the Fetch API, then write the bytes
into the Emscripten virtual FS using `Module.FS.createDataFile('/', 'freedoom1.wad', bytes, true, true)`,
then call `Module.callMain(['-iwad', '/freedoom1.wad'])`.

**Why not `--preload-file` at build time?**
- WAD is ~20 MB — embedding it at build time couples the binary to a specific WAD version.
- Sysadmin places the WAD separately; the engine binary is version-independent.
- Fetch approach allows progress reporting on the loading overlay.

### D3: JS integration — dynamic script load, Module global pattern

**Choice:** `loader.js` uses a dynamic `<script>` insertion to load `public/wasm/doom.js`
(the Emscripten glue). The global `Module` object is configured before the script loads,
following the Emscripten pre-configuration pattern.

```javascript
window.Module = {
  canvas: document.getElementById('doomnextcloud-canvas'),
  noInitialRun: true,
  onRuntimeInitialized() { /* hide loading overlay, call main */ },
  print: (t) => console.log('[doom]', t),
  printErr: (t) => console.warn('[doom]', t),
};
```

**Why dynamic script over static import?**
- `doom.js` is a large Emscripten artifact that may not exist in development.
  A static import at module evaluation time would break dev builds.
- Dynamic load makes the engine truly optional at JS bundle time.

### D4: Audio unlock — single event listener on canvas

**Choice:** On the first `click` or `keydown` on the canvas, resume `AudioContext` if it exists.
Emscripten SDL2 creates the AudioContext lazily; we call `SDL_PauseAudio(0)` via the Module
after the context is unlocked.

**Why not unlock globally on any document click?**
- Scoping to the canvas is less invasive and more predictable.

### D5: Input mapping — lookup table of browser key codes → doomgeneric constants

doomgeneric defines its own key constants (e.g., `KEY_UPARROW = 0xac`).
`input.js` exports a function `setupInput(canvas, getModule)` that attaches event listeners
and calls `Module._DG_KeyEvent(pressed, doomKey)` using a static lookup table.

### D6: Build artifacts gitignored; delivered as GitHub release assets

`public/wasm/doom.wasm` and `public/wasm/doom.js` are in `.gitignore`.
The release CI job runs `build/runtime/build.sh` inside Docker and uploads both files
as GitHub release assets. Sysadmins download them and place in the app's `public/wasm/` dir
(or CI can automate this during deployment).

## Risks / Trade-offs

- **ASYNCIFY overhead** (~20–40% code size increase, ~10% perf hit) → Acceptable for MVP; can switch to Emscripten Fibers or pthreads-with-COOP later.
- **WAD fetch blocks startup** (20 MB download before game starts) → Show a progress bar on the loading overlay. Future: HTTP Range requests for streaming.
- **doomgeneric audio quality** (limited OPL2 emulation via SDL_mixer) → Acceptable for MVP; can add FluidSynth or WebMIDI later.
- **Safari WebAssembly limits** (older Safari versions limit WASM module size) → Target Safari latest-2 only; doomgeneric WASM is typically <3 MB compiled.
- **Emscripten version drift** → Pin specific `emscripten/emsdk` tag in Dockerfile.

## Migration Plan

1. Implement `build/runtime/Dockerfile` + `build/runtime/build.sh`.
2. Run Docker build locally → verify `public/wasm/doom.js` + `public/wasm/doom.wasm` produced.
3. Update `js/src/runtime/loader.js` with real Module loader.
4. Update `js/src/runtime/input.js` with key/mouse bridge.
5. Test in browser with `freedoom1.wad` placed at `public/assets/freedoom/freedoom1.wad`.
6. Deploy to Kubernetes pod for integration test.
7. Add CI WASM build job; add WASM artifacts to GitHub release.

**Rollback:** Revert `loader.js` to no-op placeholder; canvas goes black, no data loss.

## Open Questions

- Q1: Should we pin a specific doomgeneric commit hash in build.sh for reproducibility? (Recommend yes.)
- Q2: Should the loading overlay show WAD download progress (fetch + stream bytes)? (Nice to have.)
- Q3: Mouse pointer lock (`requestPointerLock`) for better aiming — in MVP or deferred?
