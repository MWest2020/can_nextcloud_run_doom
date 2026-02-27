# DoomNextcloud

DoomNextcloud is a Nextcloud app that delivers a 100% open, fully playable Doom-like experience directly inside the Nextcloud web UI—no proprietary downloads, no external CDNs, no external scripts. The game engine runs entirely as a WebAssembly module compiled from open-source code, and the default IWAD is Freedoom, distributed under its open license. Everything—engine, assets, and JS glue—is bundled inside the app and served by Nextcloud itself.

## MVP Definition

The Minimum Viable Product is:
- Launch the game from a Nextcloud personal page or app menu.
- A `<canvas>` element renders a playable level using the open Freedoom IWAD.
- Audio and keyboard/mouse input work in modern browsers (Chrome/Firefox/Safari latest-2).
- All assets are served locally—zero external network requests at runtime.
- No proprietary WAD files are required or downloaded automatically.

## Dev Quickstart (placeholders — see each step for details)

```bash
# 1. Install JS dependencies
cd js/
npm install

# 2. Build the front-end bundle
npm run build
# Output goes to public/ (configured in vite.config.js)

# 3. Build the WASM engine (requires Docker)
cd ../build/runtime/
docker build -t doomnextcloud-emcc .
# Then run build.sh inside the container (see build/runtime/README.md)

# 4. Place Freedoom assets
# Copy freedoom2.wad → public/assets/freedoom/
# See public/assets/freedoom/README.md for details

# 5. Install the Nextcloud app
# Copy/symlink this directory into <nextcloud>/apps/doomnextcloud/
# Enable via: php occ app:enable doomnextcloud

# 6. Navigate to <nextcloud>/index.php/apps/doomnextcloud
```

## App Store Readiness Checklist

- [ ] `appinfo/info.xml` valid and complete (categories, screenshot, description)
- [ ] All third-party notices in `THIRD_PARTY_NOTICES.md`
- [ ] License headers present in all source files
- [ ] `occ app:check-code` passes (CI enforced)
- [ ] App is code-signed (`build/packaging/sign.sh`)
- [ ] No external scripts or CDN references in any template or JS
- [ ] AGPL-3.0-or-later applies to all app code
- [ ] Freedoom assets explicitly attributed and license included
- [ ] Engine/runtime attributed and license included
- [ ] No user-uploaded files required for MVP
