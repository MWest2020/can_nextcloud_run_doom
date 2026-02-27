# Third-Party Notices

DoomNextcloud bundles or incorporates the following third-party components.
**No external CDN is used.** All components are bundled locally and served by Nextcloud.

---

## 1. Freedoom Assets (IWAD)

| Field       | Value |
|-------------|-------|
| Name        | Freedoom |
| Version     | TBD (pin to a specific release during asset integration) |
| Source      | https://freedoom.github.io/ |
| License     | Freedoom License (BSD-like, open; see full text below) |
| Files       | `public/assets/freedoom/freedoom2.wad` (to be added manually) |

**PLACEHOLDER:** Copy the full Freedoom license text here when assets are integrated.
The Freedoom project license is available at:
  https://github.com/freedoom/freedoom/blob/master/COPYING.adoc

---

## 2. Game Engine / Runtime (TBD)

| Field       | Value |
|-------------|-------|
| Name        | TBD — to be determined by Agent C (Architect) |
| Source      | TBD |
| License     | TBD — must be GPL-compatible for App Store acceptance |
| Files       | `public/wasm/` (output of build/runtime/ compilation) |
| Build tool  | Emscripten (see build/runtime/Dockerfile) |

**PLACEHOLDER:** Fill in engine name, version, source URL, and license text once chosen.
The engine must be 100% open-source and App Store-license-compatible.

---

## 3. Build Toolchain — Emscripten

| Field       | Value |
|-------------|-------|
| Name        | Emscripten |
| Version     | TBD (pin in build/runtime/Dockerfile) |
| Source      | https://emscripten.org/ |
| License     | MIT / LLVM Exceptions |
| Usage       | Compile C engine to WASM; not bundled in app output |

Emscripten is a build-time dependency only. Its runtime support files (e.g.,
`emscripten.js` glue code) may be included in the WASM bundle — those are
covered by the Emscripten license (permissive; compatible with AGPL).

---

## 4. JavaScript / Frontend Dependencies

**PLACEHOLDER:** List npm dependencies here once `js/package.json` is finalized.
Run `npm ls --prod` and record each package, its version, and its license.

| Package | Version | License | Notes |
|---------|---------|---------|-------|
| (TBD)   | TBD     | TBD     | TBD   |

---

## Summary

All bundled assets and code are open-source and license-compatible with AGPL-3.0-or-later.
No proprietary components. No external CDN references in production builds.
