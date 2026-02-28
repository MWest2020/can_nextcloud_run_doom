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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
OUTPUT_DIR="${REPO_ROOT}/public/wasm"
DOOMGENERIC_SRC="/doomgeneric/doomgeneric"
PLATFORM_SRC="${SCRIPT_DIR}/doomgeneric_wasm.c"

echo "=== DoomNextcloud WASM Build ==="
echo "Emscripten: $(emcc --version | head -1)"
echo "doomgeneric: $(git -C /doomgeneric log -1 --oneline)"
echo "Output:     ${OUTPUT_DIR}"
echo ""

mkdir -p "${OUTPUT_DIR}"

# Collect all doomgeneric Doom source files.
# doomgeneric/doomgeneric/*.c contains the Doom game source; the DG_* platform
# functions are provided by our doomgeneric_wasm.c (not from any platforms/ dir).
DOOM_SOURCES=$(find "${DOOMGENERIC_SRC}" -maxdepth 1 -name '*.c' | sort)

emcc \
    -O2 \
    -s WASM=1 \
    -s ASYNCIFY=1 \
    -s ASYNCIFY_STACK_SIZE=65536 \
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
