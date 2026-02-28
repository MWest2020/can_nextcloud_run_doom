# public/assets/freedoom/ — Freedoom Game Assets

This directory holds the Freedoom IWAD file(s) required to run the game.

## Why Freedoom?

DoomNextcloud is committed to 100% open playable out of the box.
[Freedoom](https://freedoom.github.io/) provides a complete, freely licensed
IWAD compatible with the Doom engine format. No proprietary Doom WAD is required.

## Required file

The app expects exactly:

```
public/assets/freedoom/freedoom1.wad
```

(Freedoom Phase 1 — episode format, ~12 MB)

## How to obtain Freedoom

```bash
# Download the latest Freedoom release zip
wget https://github.com/freedoom/freedoom/releases/download/v0.13.0/freedoom-0.13.0.zip

# Extract freedoom1.wad
unzip freedoom-0.13.0.zip freedoom-0.13.0/freedoom1.wad

# Place it in the app directory
cp freedoom-0.13.0/freedoom1.wad \
   /var/www/html/custom_apps/doomnextcloud/public/assets/freedoom/freedoom1.wad
```

**Verify the checksum** against the SHA256 published on the Freedoom releases page.

Latest releases: https://github.com/freedoom/freedoom/releases

## No auto-download

The app **intentionally does not auto-download** Freedoom assets. This is a deliberate
design decision (see openspec/config.yaml):
- Avoids unexpected outbound network connections from the Nextcloud server.
- Keeps the admin in control of what is served.
- Satisfies the "no remote asset loading" App Store constraint.

## License

Freedoom is distributed under the Freedoom License (BSD-like, open).
Full license text: https://github.com/freedoom/freedoom/blob/master/COPYING.adoc

Attribution is included in `THIRD_PARTY_NOTICES.md` at the repository root.
