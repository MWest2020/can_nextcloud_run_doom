# public/wasm/ — WASM Runtime Output

This directory holds the compiled WebAssembly engine (doomgeneric + Emscripten).
The files here are **build artifacts** — do not commit them to git.

## Files

| File | Description |
|------|-------------|
| `doom.js` | Emscripten JS glue — loads and drives the WASM module |
| `doom.wasm` | Compiled WebAssembly binary of the doomgeneric engine |

## Building locally

Requires Docker.

```bash
# From the repo root:
docker build -t doomnextcloud-builder build/runtime/

docker run --rm \
    -v "$(pwd):/workspace" \
    doomnextcloud-builder \
    bash /workspace/build/runtime/build.sh
```

After the build, `public/wasm/doom.js` and `public/wasm/doom.wasm` will be present.

## Deploying (sysadmin)

Download `doom.js` and `doom.wasm` from the GitHub release assets and place them
in this directory inside the Nextcloud app installation:

```
/var/www/html/custom_apps/doomnextcloud/public/wasm/doom.js
/var/www/html/custom_apps/doomnextcloud/public/wasm/doom.wasm
```

Also place `freedoom1.wad` in `public/assets/freedoom/` — see that directory's README.

## Notes

- Files are in `.gitignore`; download from GitHub releases or build from source.
- CSP already allows `wasm-unsafe-eval` — no Nextcloud config changes needed.
- No SharedArrayBuffer / COOP/COEP headers required (single-threaded ASYNCIFY build).
