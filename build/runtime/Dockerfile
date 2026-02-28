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

FROM docker.io/emscripten/emsdk:3.1.50

LABEL org.opencontainers.image.title="doomnextcloud-builder"
LABEL org.opencontainers.image.description="Emscripten build environment for DoomNextcloud WASM engine"
LABEL org.opencontainers.image.licenses="AGPL-3.0-or-later"

# Install build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        make \
    && rm -rf /var/lib/apt/lists/*

# Pinned commit for reproducible builds (verified 2026-02-28).
# To update: bump SHA and rebuild image.
ENV DOOMGENERIC_COMMIT=fc601639494e089702a1ada082eb51aaafc03722

RUN git clone https://github.com/ozkl/doomgeneric.git /doomgeneric \
    && git -C /doomgeneric checkout ${DOOMGENERIC_COMMIT}

WORKDIR /workspace

# Copy build scripts into the image so they can be executed without volume exec issues
COPY build.sh /build/build.sh
COPY doomgeneric_wasm.c /build/doomgeneric_wasm.c
RUN chmod +x /build/build.sh

ENV DOOMNEXTCLOUD_SCRIPT_DIR=/build

CMD ["bash", "-c", "echo 'DoomNextcloud builder ready.'; emcc --version | head -1"]
