# tests/js/ — JavaScript Unit Tests

JS tests for DoomNextcloud front-end code (runtime loader, input handler, settings UI).

## Status

**PLACEHOLDER** — Tests have not been written yet. This directory exists as a structural
placeholder.

## Planned test coverage

| Module | Test cases | Priority |
|--------|-----------|----------|
| `src/runtime/loader.js` | `initRuntime` rejects gracefully when WASM unavailable | High |
| `src/runtime/input.js` | `initInput` attaches event listeners; game keys are captured | High |
| `src/ui/settings.js` | `initSettings` is a no-op in MVP (trivial) | Low |

## Setup (future)

```bash
# From the js/ directory:
npm install
npm test
```

## Framework

Vitest is the planned test runner (compatible with the Vite build setup).
Add `vitest` to `js/package.json` devDependencies when ready.

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}
```
