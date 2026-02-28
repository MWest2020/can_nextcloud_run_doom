# SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# DoomNextcloud — Emscripten WASM build container
#
# Compiles doomgeneric (portable Doom source port) to doom.wasm + doom.js.
# Pin DOOMGENERIC_COMMIT for reproducible builds; verify with:
#   git -C /doomgeneric log -1 --oneline
#
# Usage:
#   docker build -t doomnextcloud-builder build/runtime/
#   docker run --rm \
#       -v "$(git rev-parse --show-toplevel):/workspace" \
#       doomnextcloud-builder \
#       bash /workspace/build/runtime/build.sh

FROM emscripten/emsdk:3.1.50

LABEL org.opencontainers.image.title="doomnextcloud-builder"
LABEL org.opencontainers.image.description="Emscripten build environment for DoomNextcloud WASM engine"
LABEL org.opencontainers.image.licenses="AGPL-3.0-or-later"

# Install build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        make \
    && rm -rf /var/lib/apt/lists/*

# Pin doomgeneric to a known-good commit for reproducibility.
# To update: set to the desired commit SHA and rebuild the image.
ENV DOOMGENERIC_COMMIT=a15ca44ac6f45f2ce73a7d3cfcf38aee7aaef82d

RUN git clone https://github.com/ozkl/doomgeneric.git /doomgeneric \
    && git -C /doomgeneric checkout ${DOOMGENERIC_COMMIT}

WORKDIR /workspace

CMD ["bash", "-c", "echo 'DoomNextcloud builder ready.'; emcc --version | head -1"]
