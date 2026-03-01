/**
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * DoomNextcloud — WASM runtime loader
 *
 * Loads doom.js (Emscripten glue) + doom.wasm, mounts the Freedoom WAD
 * into the Emscripten virtual filesystem, then starts the game.
 *
 * Audio context is unlocked on the first user gesture (click / keydown).
 * No SharedArrayBuffer / COOP/COEP headers required (ASYNCIFY build).
 */

// Resolve the app web root at runtime.
// NC 32+ sets window._oc_appswebroots (not OC.appswebroots) for custom_apps/
// installations.  Check both globals so this works across NC versions.
const APP_BASE  =
    window._oc_appswebroots?.doomnextcloud ||
    (typeof OC !== 'undefined' && OC.appswebroots?.doomnextcloud) ||
    '/custom_apps/doomnextcloud'
const WASM_JS   = `${APP_BASE}/public/wasm/doom.js`
const WAD_URL   = `${APP_BASE}/public/assets/freedoom/freedoom1.wad`
const WAD_PATH  = '/freedoom1.wad'

/**
 * Resume the SDL/Web Audio context on the first user gesture.
 * Must be called after Module is initialised.
 */
function setupAudioUnlock(canvas) {
    let unlocked = false
    const unlock = () => {
        if (unlocked) return
        unlocked = true
        try {
            // Emscripten SDL2 audio backend exposes the AudioContext via SDL.audioContext
            const ac = window.Module?.SDL?.audioContext
            if (ac && ac.state === 'suspended') {
                ac.resume().catch(() => {})
            }
        } catch (e) {
            console.warn('[DoomNextcloud] Audio unlock failed (non-fatal):', e)
        }
    }
    canvas.addEventListener('click',   unlock, { once: false })
    canvas.addEventListener('keydown', unlock, { once: false })
}

/**
 * Fetch the Freedoom WAD file.
 * Throws a human-readable Error on 404 / network failure.
 *
 * @returns {Promise<Uint8Array>}
 */
async function fetchWad() {
    const resp = await fetch(WAD_URL)
    if (!resp.ok) {
        throw new Error(
            `Failed to load the game. Check that Freedoom assets are installed correctly. (HTTP ${resp.status} for ${WAD_URL})`
        )
    }
    const buf = await resp.arrayBuffer()
    return new Uint8Array(buf)
}

/**
 * Dynamically insert <script src="doom.js"> and resolve when loaded.
 *
 * @returns {Promise<void>}
 */
function loadDoomScript() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = WASM_JS
        script.onload  = resolve
        script.onerror = () => reject(new Error(`Failed to load WASM glue script: ${WASM_JS}`))
        document.head.appendChild(script)
    })
}

/**
 * Initialize the WASM runtime and attach it to the given canvas element.
 * Called by main.js after the DOM is ready.
 *
 * The loading overlay is hidden from inside onRuntimeInitialized (after
 * the WASM module is fully ready), not here.  main.js hides it only on
 * success; errors propagate as thrown Errors to be caught by main.js.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLElement|null}  loadingEl  loading overlay element
 * @returns {Promise<void>}
 */
export async function initRuntime(canvas, loadingEl) {
    // 1. Fetch WAD first — fast fail if not present
    const wadBytes = await fetchWad()

    // 2. Configure the Emscripten Module BEFORE doom.js is inserted.
    //    doom.js reads window.Module at load time.
    await new Promise((resolve, reject) => {
        window.Module = {
            canvas,
            noInitialRun: true,

            preRun: [function () {
                // Write the WAD into the Emscripten virtual filesystem
                window.Module.FS.createDataFile(
                    '/', WAD_PATH.slice(1), wadBytes, true, true, true
                )
            }],

            onRuntimeInitialized() {
                try {
                    // Hide loading overlay now that WASM is ready
                    if (loadingEl) loadingEl.hidden = true

                    // Start audio unlock handler
                    setupAudioUnlock(canvas)

                    // Boot the game
                    window.Module.callMain(['-iwad', WAD_PATH])
                    resolve()
                } catch (err) {
                    reject(err)
                }
            },

            print:    (t) => console.log('[doom]',  t),
            printErr: (t) => console.warn('[doom]', t),

            // Suppress the default "Downloading..." status from Emscripten
            setStatus: (text) => {
                if (text) console.debug('[doom status]', text)
            },
        }

        // 3. Load doom.js — triggers WASM compilation and calls onRuntimeInitialized
        loadDoomScript().catch(reject)
    })
}
