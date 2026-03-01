/**
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * DoomNextcloud — input bridge (keyboard + mouse → doomgeneric)
 *
 * Key codes from doomkeys.h (doomgeneric):
 *   ASCII printable chars use their ASCII value directly.
 *   Special keys use constants below.
 *
 * Mouse button bitmask (Doom ev_mouse data1):
 *   bit 0 = fire     (left button)
 *   bit 1 = strafe   (right button)
 *   bit 2 = use/open (middle button)
 */

/* doomgeneric special key constants (from doomkeys.h) */
const KEY_RIGHTARROW = 0xae
const KEY_LEFTARROW  = 0xac
const KEY_UPARROW    = 0xad
const KEY_DOWNARROW  = 0xaf
const KEY_ESCAPE     = 27
const KEY_ENTER      = 13
const KEY_BACKSPACE  = 127
const KEY_RCTRL      = 0x80 + 0x1d   // 0x9d — fire
const KEY_RALT       = 0x80 + 0x38   // 0xb8 — strafe modifier
const KEY_RSHIFT     = 0x80 + 0x36   // 0xb6 — speed/run
const KEY_F1         = 0x80 + 0x3b
const KEY_F2         = 0x80 + 0x3c
const KEY_F3         = 0x80 + 0x3d
const KEY_F4         = 0x80 + 0x3e
const KEY_F5         = 0x80 + 0x3f
const KEY_F6         = 0x80 + 0x40
const KEY_F7         = 0x80 + 0x41
const KEY_F8         = 0x80 + 0x42
const KEY_F9         = 0x80 + 0x43
const KEY_F10        = 0x80 + 0x44
const KEY_F11        = 0x80 + 0x57
const KEY_F12        = 0x80 + 0x58

/**
 * Maps browser event.key → doomgeneric key code.
 * Unmapped keys return undefined (event is ignored).
 */
const KEY_MAP = {
    ArrowUp:    KEY_UPARROW,
    ArrowDown:  KEY_DOWNARROW,
    ArrowLeft:  KEY_LEFTARROW,
    ArrowRight: KEY_RIGHTARROW,
    Escape:     KEY_ESCAPE,
    Enter:      KEY_ENTER,
    Backspace:  KEY_BACKSPACE,
    Control:    KEY_RCTRL,
    Alt:        KEY_RALT,
    Shift:      KEY_RSHIFT,
    ' ':        32,   // space = use/open door
    F1: KEY_F1, F2: KEY_F2, F3: KEY_F3,  F4: KEY_F4,
    F5: KEY_F5, F6: KEY_F6, F7: KEY_F7,  F8: KEY_F8,
    F9: KEY_F9, F10: KEY_F10, F11: KEY_F11, F12: KEY_F12,
    // WASD — Doom handles these as ASCII
    w: 'w'.charCodeAt(0), W: 'w'.charCodeAt(0),
    a: 'a'.charCodeAt(0), A: 'a'.charCodeAt(0),
    s: 's'.charCodeAt(0), S: 's'.charCodeAt(0),
    d: 'd'.charCodeAt(0), D: 'd'.charCodeAt(0),
    // Number row
    '1': 49, '2': 50, '3': 51, '4': 52, '5': 53,
    '6': 54, '7': 55, '8': 56, '9': 57, '0': 48,
}

/** Keys that need preventDefault to avoid browser scroll/shortcuts */
const PREVENT_KEYS = new Set([
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    ' ', 'Enter', 'Escape', 'Control', 'Alt', 'Shift',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
    'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
])

/** Returns true if el is a text input that should consume keyboard events */
const isTextInput = (el) => {
    if (!el) return false
    const tag = el.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

/**
 * Attach keyboard and mouse event listeners.
 * Keyboard events are captured at document level so they work regardless of
 * which element has focus — events are only skipped when a text input is
 * focused (search boxes, NC dialogs, etc).
 * getModule() must return the live Emscripten Module object (may be null
 * before the WASM runtime is fully initialised — calls are silently skipped).
 *
 * @param {HTMLCanvasElement} canvas
 * @param {() => object|null} getModule  getter for window.Module
 */
export function setupInput(canvas, getModule) {
    // Ensure canvas is focusable (for click-to-focus and pointer lock)
    if (canvas.tabIndex < 0) canvas.tabIndex = 0

    /* ── Keyboard: document-level so canvas focus is not required ── */

    const sendKey = (pressed, browserKey) => {
        const doomKey = KEY_MAP[browserKey]
        if (doomKey === undefined) return
        const mod = getModule()
        if (mod?._DG_KeyEvent) mod._DG_KeyEvent(pressed ? 1 : 0, doomKey)
    }

    document.addEventListener('keydown', (e) => {
        if (isTextInput(document.activeElement)) return
        if (PREVENT_KEYS.has(e.key)) e.preventDefault()
        sendKey(true, e.key)
    })

    document.addEventListener('keyup', (e) => {
        if (isTextInput(document.activeElement)) return
        if (PREVENT_KEYS.has(e.key)) e.preventDefault()
        sendKey(false, e.key)
    })

    /* ── Mouse: focus canvas on click ──────────────────────────── */

    canvas.addEventListener('click', () => canvas.focus())

    /* ── Mouse: movement ────────────────────────────────────────── */

    canvas.addEventListener('mousemove', (e) => {
        const mod = getModule()
        if (!mod?._DG_MouseMoveEvent) return
        // Use pointer-lock relative movement if available, else absolute delta
        const dx = e.movementX ?? 0
        const dy = e.movementY ?? 0
        if (dx !== 0 || dy !== 0) mod._DG_MouseMoveEvent(dx, dy)
    })

    /* ── Mouse: buttons ─────────────────────────────────────────── */

    const sendMouseButtons = (e) => {
        const mod = getModule()
        if (!mod?._DG_MouseButtonEvent) return
        // Doom bitmask: bit0=fire(left), bit1=strafe(right), bit2=use(middle)
        let flags = 0
        if (e.buttons & 1) flags |= 1  // left
        if (e.buttons & 2) flags |= 2  // right
        if (e.buttons & 4) flags |= 4  // middle
        mod._DG_MouseButtonEvent(flags)
    }

    canvas.addEventListener('mousedown', sendMouseButtons)
    canvas.addEventListener('mouseup',   sendMouseButtons)
}
