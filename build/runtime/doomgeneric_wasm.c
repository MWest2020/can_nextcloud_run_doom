/*
 * SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * DoomNextcloud — doomgeneric platform layer for Emscripten/WebAssembly
 *
 * Implements the doomgeneric API (doomgeneric.h) targeting a browser canvas.
 *
 * Pixel format: doomgeneric stores DG_ScreenBuffer as uint32 XRGB
 * (little-endian bytes: [B, G, R, X]).  Canvas ImageData expects [R, G, B, A].
 * DG_DrawFrame swizzles accordingly.
 *
 * Input: JS calls the exported DG_KeyEvent / DG_MouseMoveEvent /
 * DG_MouseButtonEvent which queue events for DG_GetKey / DG_GetMouseState.
 *
 * Main loop: ASYNCIFY allows emscripten_sleep() to yield to the browser
 * event loop between frames without blocking the main thread.
 */

#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <emscripten.h>
#include <emscripten/html5.h>
#include "doomgeneric.h"

/* ── Canvas / frame rendering ─────────────────────────────────────── */

EM_JS(void, js_init_canvas, (int w, int h), {
    const canvas = document.getElementById('doomnextcloud-canvas');
    if (!canvas) return;
    canvas.width  = w;
    canvas.height = h;
    /* pixelated scaling so 320×200 fills the CSS-sized canvas crisply */
    canvas.style.imageRendering = 'pixelated';
})

EM_JS(void, js_blit_frame, (int w, int h, const uint8_t* pixels), {
    const canvas = document.getElementById('doomnextcloud-canvas');
    if (!canvas) return;
    /* Debug: log first 5 frames to confirm the game loop is running */
    if (!canvas._doomFrameCount) canvas._doomFrameCount = 0;
    canvas._doomFrameCount++;
    if (canvas._doomFrameCount <= 5) {
        console.debug('[DoomNextcloud] frame', canvas._doomFrameCount);
    }
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(w, h);
    const dst = imageData.data;
    /* doomgeneric pixel: uint32 XRGB — little-endian bytes [B,G,R,X] */
    for (let i = 0, n = w * h; i < n; i++) {
        const base = pixels + i * 4; /* byte offset in WASM memory */
        dst[i * 4 + 0] = HEAPU8[base + 2]; /* R */
        dst[i * 4 + 1] = HEAPU8[base + 1]; /* G */
        dst[i * 4 + 2] = HEAPU8[base + 0]; /* B */
        dst[i * 4 + 3] = 255;              /* A */
    }
    ctx.putImageData(imageData, 0, 0);
})

void DG_Init(void) {
    js_init_canvas(DOOMGENERIC_RESX, DOOMGENERIC_RESY);
}

void DG_DrawFrame(void) {
    js_blit_frame(DOOMGENERIC_RESX, DOOMGENERIC_RESY, (const uint8_t*)DG_ScreenBuffer);
}

/* ── Timing / sleep ──────────────────────────────────────────────── */

uint32_t DG_GetTicksMs(void) {
    return (uint32_t)emscripten_get_now();
}

void DG_SleepMs(uint32_t ms) {
    /* ASYNCIFY: yields back to the browser event loop between frames */
    emscripten_sleep(ms ? ms : 1);
}

/* ── Window title ────────────────────────────────────────────────── */

void DG_SetWindowTitle(const char* title) {
    (void)title; /* no-op in browser; page title is set by Nextcloud */
}

/* ── Keyboard input ──────────────────────────────────────────────── */

#define KEY_QUEUE_SIZE 512

static int           s_key_pressed[KEY_QUEUE_SIZE];
static unsigned char s_key_code[KEY_QUEUE_SIZE];
static int           s_key_head = 0;
static int           s_key_tail = 0;

/*
 * Called by JS: Module._DG_KeyEvent(pressed, doomKey)
 * pressed: 1 = key down, 0 = key up
 * doomKey: doomgeneric key code (see doomkeys.h)
 */
EMSCRIPTEN_KEEPALIVE
void DG_KeyEvent(int pressed, int doom_key) {
    int next = (s_key_tail + 1) % KEY_QUEUE_SIZE;
    if (next == s_key_head) return; /* queue full, drop event */
    s_key_pressed[s_key_tail] = pressed;
    s_key_code[s_key_tail]    = doom_key;
    s_key_tail = next;
}

/* Called by doomgeneric each tick to drain the key queue */
int DG_GetKey(int* pressed, unsigned char* doom_key) {
    if (s_key_head == s_key_tail) return 0;
    *pressed  = s_key_pressed[s_key_head];
    *doom_key = s_key_code[s_key_head];
    s_key_head = (s_key_head + 1) % KEY_QUEUE_SIZE;
    return 1;
}

/* ── Mouse input ─────────────────────────────────────────────────── */

static int s_mouse_dx      = 0;
static int s_mouse_dy      = 0;
static int s_mouse_buttons = 0;

/*
 * Called by JS: Module._DG_MouseMoveEvent(dx, dy)
 * Accumulates relative motion until the next game tick reads it.
 */
EMSCRIPTEN_KEEPALIVE
void DG_MouseMoveEvent(int dx, int dy) {
    s_mouse_dx += dx;
    s_mouse_dy += dy;
}

/*
 * Called by JS: Module._DG_MouseButtonEvent(buttons)
 * buttons: bitmask matching Doom's ev_mouse data1 field
 *   bit 0 = fire (left button)
 *   bit 1 = strafe (right button)
 *   bit 2 = use (middle button)
 */
EMSCRIPTEN_KEEPALIVE
void DG_MouseButtonEvent(int buttons) {
    s_mouse_buttons = buttons;
}

/*
 * DG_GetMouseState: called by doomgeneric's i_system.c each tick.
 * Note: vanilla doomgeneric does not declare this function — it is an
 * extension added by doomgeneric_wasm.c.  If the doomgeneric i_system.c
 * does not call it, mouse support is absent until i_system.c is patched.
 */
void DG_GetMouseState(int* buttons, int* dx, int* dy) {
    *buttons = s_mouse_buttons;
    *dx      = s_mouse_dx;
    *dy      = s_mouse_dy;
    s_mouse_dx = 0;
    s_mouse_dy = 0;
}

/* ── Entry point ─────────────────────────────────────────────────── */

/*
 * main() is required by Emscripten.  It is invoked from JS via
 * Module.callMain(['-iwad', '/freedoom1.wad']) after the WAD has been
 * written to the in-memory filesystem.
 *
 * doomgeneric_Create() calls D_DoomMain() which contains the infinite
 * game loop.  ASYNCIFY transforms emscripten_sleep() calls in DG_SleepMs()
 * into coroutine-style yields so the browser event loop stays alive
 * between frames.
 */
int main(int argc, char **argv) {
    doomgeneric_Create(argc, argv);
    return 0; /* never reached */
}
