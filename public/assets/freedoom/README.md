# public/assets/freedoom/ — Freedoom Game Assets

This directory holds the Freedoom IWAD file(s) required to run the game.

## Why Freedoom?

DoomNextcloud is committed to 100% open playable out of the box.
[Freedoom](https://freedoom.github.io/) provides a complete, freely licensed
IWAD compatible with the Doom engine format. No proprietary Doom WAD is required.

## What to place here

| File | Description | Required for MVP? |
|------|-------------|-------------------|
| `freedoom2.wad` | Freedoom Phase 2 — full 32-level campaign (recommended) | Yes |
| `freedoom1.wad` | Freedoom Phase 1 — episode format | Optional |

## How to obtain Freedoom

Freedoom is **not bundled** in this repository because the WAD file is large (~50 MB).
Download it from the official release page:

```
https://github.com/freedoom/freedoom/releases
```

Pick the latest stable release and download `freedoom-<version>.zip`.
Extract `freedoom2.wad` from the archive and place it in this directory.

**Verify the checksum** against the published SHA256 on the releases page before deploying.

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
