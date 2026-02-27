# SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# DoomNextcloud — Emscripten WASM build container
#
# PLACEHOLDER: Pin the Emscripten version before the first release.
# Check latest stable at: https://github.com/emscripten-core/emsdk/releases
#
# Usage:
#   docker build -t doomnextcloud-emcc .
#   docker run --rm -v "$(git rev-parse --show-toplevel):/workspace" \
#       -w /workspace/build/runtime doomnextcloud-emcc bash build.sh

FROM emscripten/emsdk:3.1.50
# PLACEHOLDER: Replace 3.1.50 with the pinned version once engine requirements are known.

LABEL org.opencontainers.image.title="doomnextcloud-emcc"
LABEL org.opencontainers.image.description="Emscripten build environment for DoomNextcloud WASM engine"
LABEL org.opencontainers.image.licenses="AGPL-3.0-or-later"

# Install build dependencies
# PLACEHOLDER: Add any engine-specific dependencies (e.g., cmake, python3, SDL2 headers)
RUN apt-get update && apt-get install -y --no-install-recommends \
        cmake \
        make \
        python3 \
        git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Default command: print help (actual build is invoked via build.sh)
CMD ["bash", "-c", "echo 'Run: bash build/runtime/build.sh'; emcc --version"]
