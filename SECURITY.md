# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.0.x (pre-release) | Security fixes best-effort |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report security issues by emailing: **security@PLACEHOLDER.example**
(Replace this address before publishing the app.)

You can also use [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
if enabled on this repository.

We aim to acknowledge reports within **5 business days** and provide a status
update within **14 days**.

## Security Design (MVP)

The MVP is deliberately minimal to reduce attack surface:

- **No user file uploads.** The app does not accept WAD uploads from users.
  Freedoom assets are placed by the server administrator and served read-only.
- **No remote code.** All JS, WASM, and assets are served from the Nextcloud
  server itself. There are no CDN dependencies, no dynamic script loading, and
  no `eval()` calls.
- **Content Security Policy.** The app will define a strict CSP (TBD in
  Agent C design) that disallows `unsafe-eval` and external sources.
  WASM execution requires `wasm-unsafe-eval` or equivalent; we will use the
  narrowest policy that allows WASM to run.
- **No server-side game execution.** The engine runs entirely in the browser
  (WebAssembly). The PHP backend only serves the shell template and static files.
- **App Store review.** The Nextcloud App Store review process includes a
  security check (`occ app:check-code`). Passing this check is a CI requirement.
- **Code signing.** App releases are signed. Unsigned packages will not be
  distributed.

## Out of Scope (MVP)

- Multiplayer / networked game features.
- Save-game uploads or any user-controlled file write paths.
- Admin settings UI that changes server state.
