/**
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Vite build configuration for DoomNextcloud.
 *
 * NC's script('doomnextcloud', 'main') serves from:  <app-root>/js/main.js
 * NC's style('doomnextcloud', 'app')  serves from:  <app-root>/css/app.css
 *
 * So Vite must write:
 *   js/main.js     → outDir = js/  (same dir as this config file, __dirname)
 *   css/app.css    → assetFileNames '../css/app.css' (one level up from outDir)
 *
 * emptyOutDir: false — prevents Vite from wiping src/, vite.config.js, package.json
 * that live alongside the output in the same js/ directory.
 */

import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    base: '/apps/doomnextcloud/',
    root: resolve(__dirname, 'src'),
    build: {
        // Output directly into js/ (the app-root js dir that NC's script() serves from)
        outDir: resolve(__dirname, '.'),
        emptyOutDir: false,  // MUST be false: outDir contains src/, package.json, etc.
        cssCodeSplit: false,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/main.js'),
            },
            output: {
                // IIFE wraps the whole bundle in a closure, preventing minified
                // variable names (e.g. '$') from leaking into the NC page's global
                // scope and colliding with jQuery or other NC globals.
                format: 'iife',
                name: 'DoomNextcloud',
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith('.css')) {
                        // js/ → ../css/ = css/ at app root, served by style()
                        return '../css/app.css'
                    }
                    return '[name].[ext]'
                },
            },
        },
        chunkSizeWarningLimit: 4096,
    },
})
