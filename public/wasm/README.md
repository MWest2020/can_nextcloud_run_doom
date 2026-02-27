# public/wasm/ — WASM Runtime Output

This directory receives the compiled WebAssembly output of the Doom engine.

## What goes here

After a successful WASM build (see `build/runtime/`), place the following files here:

| File | Description |
|------|-------------|
| `engine.wasm` | The compiled WebAssembly binary of the game engine |
| `engine.js` | The Emscripten JS glue/loader for the WASM module |
| *(other files as needed by the chosen engine)* | e.g., `engine.worker.js` for threaded builds |

## How it gets here

```bash
# From the repo root:
cd build/runtime/
docker build -t doomnextcloud-emcc .
docker run --rm -v "$(pwd)/../../public/wasm:/output" doomnextcloud-emcc bash build.sh
```

See `build/runtime/build.sh` and `build/runtime/Dockerfile` for details.

## Important notes

- **Do not commit compiled WASM binaries to git.** They are build artifacts.
  Add them to `.gitignore` or handle via a release artifact workflow.
- The WASM module is served by Nextcloud with `Content-Type: application/wasm`.
  Ensure your Nextcloud/web server MIME config includes `application/wasm`.
- The engine choice (and therefore the exact filenames) will be determined by
  Agent B (Compliance & Licensing) → DEC decisions. Update this README accordingly.

## Security note

WASM execution requires `wasm-unsafe-eval` in the Content Security Policy
(or the equivalent older `unsafe-eval` depending on browser).
The exact CSP policy is defined in the Agent C design document.
