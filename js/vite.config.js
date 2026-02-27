/**
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Vite build configuration for DoomNextcloud.
 *
 * Output layout:
 *   public/js/main.js   ← loaded by templates/game.php via script(APP_ID, 'main')
 *   public/css/app.css  ← loaded by templates/game.php via style(APP_ID, 'app')
 *
 * base: '/apps/doomnextcloud/' ensures that dynamically imported chunks and
 * future WASM asset URLs are prefixed with the correct Nextcloud app path at runtime.
 */

import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    base: '/apps/doomnextcloud/',
    root: resolve(__dirname, 'src'),
    build: {
        outDir: resolve(__dirname, '../public/js'),
        emptyOutDir: true,
        // Collapse all CSS into a single app.css regardless of chunk boundaries.
        // Required so the custom assetFileNames path applies deterministically.
        cssCodeSplit: false,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/main.js'),
            },
            output: {
                // Deterministic filenames — no content hash — so Nextcloud's
                // script() helper can reference them by a stable name.
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith('.css')) {
                        // Emit CSS one level above outDir (public/js/ → public/css/).
                        // Resolves to public/css/app.css at the repository root.
                        return '../css/app.css'
                    }
                    return '[name].[ext]'
                },
            },
        },
        // Allow large WASM-adjacent chunks (the engine glue JS can be large).
        chunkSizeWarningLimit: 4096,
    },
})
