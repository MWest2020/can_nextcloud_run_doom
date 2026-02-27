/**
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * DoomNextcloud — main entry point
 *
 * This module bootstraps the WASM runtime when the DOM is ready.
 * It is the single entry point compiled by Vite (see vite.config.js).
 */

import { initRuntime } from './runtime/loader.js'
import { initInput } from './runtime/input.js'

/**
 * Wait for the Nextcloud DOM to be ready (it may load after DOMContentLoaded
 * in some Nextcloud versions), then boot the game.
 */
document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('doomnextcloud-canvas')
    const loadingEl = document.getElementById('doomnextcloud-loading')
    const errorEl = document.getElementById('doomnextcloud-error')

    if (!canvas) {
        console.error('[DoomNextcloud] Canvas mount not found in DOM.')
        return
    }

    try {
        // Initialize keyboard/mouse input before loading the WASM module
        initInput(canvas)

        // Load and start the WASM runtime
        await initRuntime(canvas)

        // Hide the loading overlay once the runtime reports ready
        if (loadingEl) loadingEl.hidden = true

    } catch (err) {
        console.error('[DoomNextcloud] Failed to initialize runtime:', err)
        if (loadingEl) loadingEl.hidden = true
        if (errorEl) errorEl.hidden = false
    }
})
