#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# DoomNextcloud — WASM engine build script
#
# Run inside the doomnextcloud-builder Docker container (see Dockerfile).
#
# Usage (from repo root):
#   docker build -t doomnextcloud-builder build/runtime/
#   docker run --rm -v "$(pwd):/workspace" doomnextcloud-builder \
#       bash /workspace/build/runtime/build.sh
#
# Output: public/wasm/doom.js  public/wasm/doom.wasm

set -euo pipefail

# DOOMNEXTCLOUD_SCRIPT_DIR is set by the Dockerfile when scripts are baked in.
# When run from the repo via volume mount, fall back to the script's own directory.
if [ -n "${DOOMNEXTCLOUD_SCRIPT_DIR:-}" ]; then
    SCRIPT_DIR="${DOOMNEXTCLOUD_SCRIPT_DIR}"
    REPO_ROOT="/workspace"
else
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
fi

OUTPUT_DIR="${REPO_ROOT}/public/wasm"
DOOMGENERIC_SRC="/doomgeneric/doomgeneric"
PLATFORM_SRC="${SCRIPT_DIR}/doomgeneric_wasm.c"

echo "=== DoomNextcloud WASM Build ==="
echo "Emscripten: $(emcc --version | head -1)"
echo "doomgeneric: $(git -C /doomgeneric log -1 --oneline)"
echo "Output:     ${OUTPUT_DIR}"
echo ""

mkdir -p "${OUTPUT_DIR}"

# Collect doomgeneric Doom source files, excluding existing platform layers.
# doomgeneric_*.c  — platform implementations (allegro, emscripten, sdl, win, …)
# i_allegro*.c     — allegro-specific sound/music; excluded because allegro.h absent
# We supply our own platform layer: doomgeneric_wasm.c (added via PLATFORM_SRC).
DOOM_SOURCES=$(find "${DOOMGENERIC_SRC}" -maxdepth 1 -name '*.c' \
    ! -name 'doomgeneric_*.c' \
    ! -name 'i_allegro*.c' \
    | sort)

emcc \
    -O2 \
    -DFEATURE_SOUND \
    -s WASM=1 \
    -s ASYNCIFY=1 \
    -s ASYNCIFY_STACK_SIZE=262144 \
    -s USE_SDL=2 \
    -s USE_SDL_MIXER=2 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=67108864 \
    -s NO_EXIT_RUNTIME=1 \
    -s EXPORTED_FUNCTIONS='["_main","_DG_KeyEvent","_DG_MouseMoveEvent","_DG_MouseButtonEvent"]' \
    -s EXPORTED_RUNTIME_METHODS='["FS","callMain"]' \
    -I "${DOOMGENERIC_SRC}" \
    ${DOOM_SOURCES} \
    "${PLATFORM_SRC}" \
    -o "${OUTPUT_DIR}/doom.js"

echo ""
echo "=== Build complete ==="
ls -lh "${OUTPUT_DIR}/doom.js" "${OUTPUT_DIR}/doom.wasm"
