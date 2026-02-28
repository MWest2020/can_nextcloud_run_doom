# Third-Party Notices

DoomNextcloud bundles or incorporates the following third-party components.
**No external CDN is used.** All components are bundled locally and served by Nextcloud.

---

## 1. Freedoom Assets (IWAD)

| Field       | Value |
|-------------|-------|
| Name        | Freedoom |
| Version     | Latest stable (pin to release SHA when deploying) |
| Source      | https://freedoom.github.io/ |
| Repository  | https://github.com/freedoom/freedoom |
| License     | BSD-3-Clause (Freedoom License) |
| Files       | `public/assets/freedoom/freedoom1.wad` (placed by sysadmin) |

Freedoom is a free-content replacement for the Doom engine IWAD files.
Full license: https://github.com/freedoom/freedoom/blob/master/COPYING.adoc

> Copyright © 2001-2024 Contributors to the Freedoom project.
> Redistribution and use in source and binary forms, with or without
> modification, are permitted provided that the following conditions are met:
> (1) Redistributions of source code must retain the above copyright notice,
> (2) Redistributions in binary form must reproduce the above copyright notice,
> (3) Neither the name "Freedoom" nor the names of contributors may be used to
> endorse or promote products derived from this software without specific prior
> written permission.

---

## 2. Game Engine — doomgeneric

| Field       | Value |
|-------------|-------|
| Name        | doomgeneric |
| Author      | Ola Björling (ozkl) |
| Source      | https://github.com/ozkl/doomgeneric |
| License     | GNU General Public License v2.0 or later (GPL-2.0+) |
| Files       | `public/wasm/doom.wasm`, `public/wasm/doom.js` (build artifacts) |
| Build tool  | Emscripten (see `build/runtime/`) |

doomgeneric is a portable Doom source port that abstracts platform I/O behind
a minimal C API.  It incorporates the original Doom source code released by
id Software under GPL-2.0-or-later.

GPL-2.0-or-later is compatible with AGPL-3.0-or-later (the license of this app).
The compiled WASM artifacts constitute a combined work distributed under AGPL-3.0-or-later.
Full license: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

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
