# build/runtime/ — WASM Engine Build System

This directory contains the Emscripten-based build system for compiling the
chosen Doom engine to WebAssembly.

## Overview

```
build/runtime/
├── Dockerfile    — Emscripten container image definition
└── build.sh      — Build script (runs inside the container)
```

The compiled output (`.wasm` + JS glue) is written to `../../public/wasm/`.

## Prerequisites

- Docker (or Podman) installed and running.
- The engine source code (TBD — see DEC decisions in openspec/agents/agent-b-compliance-licensing.md).

## Usage

```bash
# From this directory:

# 1. Build the Emscripten Docker image
docker build -t doomnextcloud-emcc .

# 2. Run the build inside the container
#    Mounts the repo root so the script can write to public/wasm/
docker run --rm \
    -v "$(git rev-parse --show-toplevel):/workspace" \
    -w /workspace/build/runtime \
    doomnextcloud-emcc \
    bash build.sh
```

## Reproducibility

The Dockerfile pins the Emscripten version (PLACEHOLDER: pin version before first release).
All dependencies fetched by the build script must also be pinned to exact versions
to ensure reproducible builds.

## CI integration

The WASM build step in `.github/workflows/ci.yml` is currently a placeholder.
When the engine is chosen, add a step that:
1. Builds the Docker image (or pulls from a registry cache).
2. Runs `build.sh` inside the container.
3. Uploads the WASM output as a build artifact.

## Engine choice

The specific engine to compile is a DEC decision resolved by Agent B.
Once chosen:
1. Update `Dockerfile` to fetch/clone the engine source.
2. Update `build.sh` with the correct Emscripten compilation flags.
3. Update `public/wasm/README.md` with the output filenames.
