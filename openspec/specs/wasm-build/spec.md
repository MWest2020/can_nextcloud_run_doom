## ADDED Requirements

### Requirement: doomgeneric is compiled with Emscripten in a reproducible Docker container
`build/runtime/Dockerfile` SHALL use `emscripten/emsdk` as base image and clone doomgeneric
from its canonical open-source repository. The build SHALL produce `doom.js` and `doom.wasm`.

#### Scenario: Docker build succeeds
- **WHEN** `docker build -t doomnextcloud-builder build/runtime/` runs to completion
- **THEN** the image exists and contains the Emscripten toolchain at the expected version

### Requirement: Build script produces artifacts at a defined output path
`build/runtime/build.sh` SHALL compile doomgeneric and write `doom.js` and `doom.wasm`
into `public/wasm/` relative to the repository root.

#### Scenario: Build script runs successfully
- **WHEN** `./build/runtime/build.sh` is executed inside the builder container
- **THEN** `public/wasm/doom.js` and `public/wasm/doom.wasm` are created with non-zero size

### Requirement: Emscripten build flags exclude SharedArrayBuffer and pthreads
The `emcc` invocation SHALL NOT include `-s USE_PTHREADS=1` or any flag that requires
COOP/COEP headers. ASYNCIFY SHALL be used instead for the main loop.

#### Scenario: Built doom.js inspected for SharedArrayBuffer usage
- **WHEN** `grep -i SharedArrayBuffer public/wasm/doom.js` is run after the build
- **THEN** the output is empty (no SharedArrayBuffer usage in the glue code)

### Requirement: WASM artifacts are excluded from version control
`public/wasm/doom.wasm` and `public/wasm/doom.js` SHALL be listed in `.gitignore`.
They are produced by the build pipeline and distributed as release artifacts, not tracked in git.

#### Scenario: Git status after build
- **WHEN** the build script has run and produced the artifacts
- **THEN** `git status` does not show `public/wasm/doom.wasm` or `public/wasm/doom.js` as untracked

### Requirement: CI workflow builds and uploads WASM artifacts on release tags
The GitHub Actions release workflow SHALL include a WASM build job that runs the Docker
build and uploads `doom.js` + `doom.wasm` as release assets when a `v*` tag is pushed.

#### Scenario: Release tag pushed
- **WHEN** a tag matching `v[0-9]*` is pushed to GitHub
- **THEN** the CI release workflow builds the WASM artifacts and attaches them to the GitHub release
