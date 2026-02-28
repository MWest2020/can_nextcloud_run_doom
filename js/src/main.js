/**
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * DoomNextcloud — main entry point
 *
 * Bootstraps the WASM runtime when the DOM is ready.
 * Single entry point compiled by Vite (see vite.config.js).
 */

import { initRuntime } from './runtime/loader.js'
import { setupInput }  from './runtime/input.js'

document.addEventListener('DOMContentLoaded', async () => {
    const canvas    = document.getElementById('doomnextcloud-canvas')
    const loadingEl = document.getElementById('doomnextcloud-loading')
    const errorEl   = document.getElementById('doomnextcloud-error')

    if (!canvas) {
        console.error('[DoomNextcloud] Canvas element not found in DOM.')
        return
    }

    try {
        // Wire keyboard + mouse input. getModule() is a lazy getter so it
        // resolves window.Module only after initRuntime has set it up.
        setupInput(canvas, () => window.Module)

        // Load WASM engine, mount WAD, start game loop.
        // initRuntime hides loadingEl itself from onRuntimeInitialized.
        await initRuntime(canvas, loadingEl)

    } catch (err) {
        console.error('[DoomNextcloud] Failed to initialize runtime:', err)
        if (loadingEl) loadingEl.hidden = true
        if (errorEl)   errorEl.hidden   = false
    }
})
