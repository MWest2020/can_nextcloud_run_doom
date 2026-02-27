#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# DoomNextcloud — WASM engine build script (PLACEHOLDER)
#
# Run inside the doomnextcloud-emcc Docker container.
# See build/runtime/README.md for usage instructions.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
OUTPUT_DIR="${REPO_ROOT}/public/wasm"

echo "=== DoomNextcloud WASM Build ==="
echo "Emscripten version: $(emcc --version | head -1)"
echo "Output directory: ${OUTPUT_DIR}"
echo ""

# PLACEHOLDER: Clone or locate the engine source.
# Example (replace with actual engine repo and version):
#
# ENGINE_REPO="https://github.com/OWNER/some-open-doom-engine.git"
# ENGINE_VERSION="v1.2.3"
# ENGINE_DIR="${SCRIPT_DIR}/engine-src"
#
# if [ ! -d "${ENGINE_DIR}" ]; then
#     git clone --depth=1 --branch "${ENGINE_VERSION}" "${ENGINE_REPO}" "${ENGINE_DIR}"
# fi

echo "PLACEHOLDER: Engine source not yet configured."
echo "Edit build/runtime/build.sh to add the engine clone + emcc compilation step."
echo ""

# PLACEHOLDER: Compile the engine to WASM.
# Example emcc invocation (flags will depend on the engine):
#
# emcc \
#     -O2 \
#     -s USE_SDL=2 \
#     -s WASM=1 \
#     -s ALLOW_MEMORY_GROWTH=1 \
#     -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
#     -s MODULARIZE=1 \
#     -s EXPORT_NAME='DoomModule' \
#     --preload-file "${ENGINE_DIR}/base@/base" \
#     "${ENGINE_DIR}/src/*.c" \
#     -o "${OUTPUT_DIR}/engine.js"

# Ensure output directory exists
mkdir -p "${OUTPUT_DIR}"

echo "PLACEHOLDER: Build script complete (no-op). Replace with real build steps."
echo "Expected output: ${OUTPUT_DIR}/engine.wasm + ${OUTPUT_DIR}/engine.js"
