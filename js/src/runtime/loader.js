/**
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * DoomNextcloud — WASM runtime loader (placeholder)
 *
 * This module will be responsible for:
 *  1. Fetching the WASM module from /apps/doomnextcloud/wasm/<engine>.wasm
 *  2. Fetching the Freedoom WAD from /apps/doomnextcloud/assets/freedoom/freedoom2.wad
 *  3. Instantiating the WASM module with the correct imports (canvas, audio, FS).
 *  4. Starting the game loop.
 *
 * PLACEHOLDER: The actual WASM engine has not been chosen or compiled yet.
 * See openspec/agents/agent-b-compliance-licensing.md (DEC decisions) and
 * build/runtime/README.md for the build pipeline.
 */

/**
 * Initialize the WASM runtime and attach it to the given canvas element.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<void>}
 */
export async function initRuntime(canvas) {
    // PLACEHOLDER: Replace with actual WASM loader once engine is chosen.
    console.warn('[DoomNextcloud] initRuntime: WASM engine not yet integrated.')
    console.info('[DoomNextcloud] Canvas ready:', canvas)

    // Example of what this function will eventually do:
    //
    // const wasmPath = OC.filePath('doomnextcloud', 'wasm', 'engine.wasm')
    // const wadPath  = OC.filePath('doomnextcloud', 'assets/freedoom', 'freedoom2.wad')
    //
    // const wasmModule = await WebAssembly.compileStreaming(fetch(wasmPath))
    // const wadData    = await fetch(wadPath).then(r => r.arrayBuffer())
    //
    // await bootEngine(wasmModule, wadData, canvas)
}
