/**
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * DoomNextcloud — keyboard and mouse input handler (placeholder)
 *
 * This module bridges browser input events to the WASM engine's input API.
 * The exact API depends on the engine chosen in DEC decisions (Agent B).
 *
 * PLACEHOLDER: Input bindings are not yet wired to the WASM engine.
 */

/**
 * Attach keyboard and mouse event listeners to the canvas.
 * The canvas must be focusable (tabindex="0").
 *
 * @param {HTMLCanvasElement} canvas
 */
export function initInput(canvas) {
    // Ensure the canvas can receive keyboard events
    if (canvas.tabIndex < 0) {
        canvas.tabIndex = 0
    }

    canvas.addEventListener('keydown', (e) => {
        // PLACEHOLDER: forward e.key / e.keyCode to WASM engine input queue
        // Prevent default for game keys (arrows, WASD, space, etc.)
        if (isGameKey(e.key)) {
            e.preventDefault()
        }
    })

    canvas.addEventListener('keyup', (e) => {
        // PLACEHOLDER: forward key-up events to WASM engine
        if (isGameKey(e.key)) {
            e.preventDefault()
        }
    })

    canvas.addEventListener('mousemove', (_e) => {
        // PLACEHOLDER: forward mouse delta to WASM engine (pointer lock needed for look)
    })

    canvas.addEventListener('click', () => {
        // Request pointer lock on click so mouse look works
        // PLACEHOLDER: enable once engine mouse input API is known
        // canvas.requestPointerLock()
    })

    console.info('[DoomNextcloud] Input handlers attached (placeholder).')
}

/**
 * Returns true if the key should be captured by the game (prevent browser default).
 *
 * @param {string} key
 * @returns {boolean}
 */
function isGameKey(key) {
    const GAME_KEYS = new Set([
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
        ' ', 'Enter', 'Escape',
        'Control', 'Alt', 'Shift',
    ])
    return GAME_KEYS.has(key)
}
