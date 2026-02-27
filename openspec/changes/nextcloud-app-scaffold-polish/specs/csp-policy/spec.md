# Spec: csp-policy

## ADDED Requirements

### Requirement: CSP listener registration

The app SHALL register a listener for Nextcloud's `AddContentSecurityPolicyEvent` inside `Application::register(IRegistrationContext $context)` using `$context->registerEventListener()`. The listener class SHALL be responsible for building and applying the app-specific CSP additions.

#### Scenario: Listener is registered during app bootstrap

WHEN Nextcloud initialises the `doomnextcloud` app and calls `Application::register()`
THEN `IRegistrationContext::registerEventListener()` MUST be called with `AddContentSecurityPolicyEvent::class` as the event and the app's CSP listener class as the handler
AND no CSP modification code SHALL appear directly in `Application::register()` or `Application::boot()`

---

### Requirement: No external origins added to fetch directives

The CSP listener SHALL NOT add any external origins (hostnames, schemes such as `https:`, or wildcard sources such as `*`) to `script-src`, `connect-src`, `img-src`, or `style-src`. All assets MUST be served from the Nextcloud origin itself.

#### Scenario: script-src contains no external URLs

WHEN the CSP listener runs for a doomnextcloud page request
THEN the resulting `script-src` directive MUST NOT include any `http://`, `https://`, or protocol-relative URL origins
AND it MUST NOT include the bare `*` wildcard

#### Scenario: connect-src contains no external URLs

WHEN the CSP listener runs for a doomnextcloud page request
THEN the resulting `connect-src` directive MUST NOT include any remote origin
AND network requests to third-party hosts SHALL be blocked by the policy

#### Scenario: img-src and style-src contain no external URLs

WHEN the CSP listener runs for a doomnextcloud page request
THEN the `img-src` and `style-src` directives MUST NOT contain any external origins
AND `data:` in `img-src` is permitted only if Nextcloud's default policy already includes it

---

### Requirement: wasm-unsafe-eval in script-src

The CSP listener SHALL add `wasm-unsafe-eval` to `script-src` to permit WebAssembly compilation and execution in the browser. This keyword is distinct from `unsafe-eval` and does not grant permission to evaluate arbitrary JavaScript strings.

Browser support caveat: `wasm-unsafe-eval` was introduced in Chrome 95, Firefox 102, and Safari 16. Browsers that do not recognise the keyword will fall back to blocking WASM execution; this is acceptable for the MVP because the minimum Nextcloud server version implies modern browser support, and the fallback is a safe failure (game does not load) rather than a security regression.

#### Scenario: WASM execution is permitted by the policy

WHEN the CSP listener builds the policy for a doomnextcloud page
THEN `wasm-unsafe-eval` MUST appear in the effective `script-src` directive
AND `unsafe-eval` MUST NOT appear in `script-src`

#### Scenario: Policy does not regress on older browsers

WHEN a browser that does not support `wasm-unsafe-eval` loads the page
THEN the browser applies its own safe default (WASM blocked)
AND no broader eval permission is granted as a fallback

---

### Requirement: blob: in worker-src

The CSP listener SHALL add `blob:` to `worker-src` to allow the browser to create Web Workers and Audio Worklet processors from Blob URLs. This is required for future audio worklet support in the WASM game runtime.

#### Scenario: Blob-based workers are permitted

WHEN the CSP listener builds the policy for a doomnextcloud page
THEN `blob:` MUST be present in the effective `worker-src` directive
AND no external origin SHALL be added to `worker-src`

---

### Requirement: No unsafe-inline for scripts

The CSP listener SHALL NOT add `unsafe-inline` to `script-src`. Nextcloud's framework already supplies per-request nonces for legitimately inlined scripts; adding `unsafe-inline` would nullify those nonces and greatly widen the XSS attack surface.

#### Scenario: unsafe-inline is absent from script-src

WHEN the CSP listener builds the policy for a doomnextcloud page
THEN `unsafe-inline` MUST NOT appear in the `script-src` directive produced by the listener
AND any inline script required by the app template MUST use the Nextcloud-provided CSP nonce attribute instead

---

### Requirement: Policy scoped to the doomnextcloud app namespace

The CSP additions registered by the listener SHALL apply only to responses generated within the `doomnextcloud` app namespace. The listener MUST inspect the active app context (for example via `IRequest` or the event payload) and skip policy modifications for requests that belong to a different app.

#### Scenario: CSP additions apply to doomnextcloud routes

WHEN `AddContentSecurityPolicyEvent` fires for a request routed to the `doomnextcloud` app
THEN the listener SHALL apply all CSP additions defined in this spec

#### Scenario: CSP additions do not apply to other apps

WHEN `AddContentSecurityPolicyEvent` fires for a request routed to any app other than `doomnextcloud`
THEN the listener SHALL return without modifying the policy object
AND the Nextcloud default policy for that app SHALL remain unchanged

---

### Requirement: Default Nextcloud CSP must not be broken

The app MUST NOT remove, replace, or narrow any directive that Nextcloud's framework sets by default. The listener SHALL only call additive methods on the `ContentSecurityPolicy` object (e.g., `addAllowedScriptDomain`, `addAllowedWorkerSrcDomain`). Calling methods that reset or override the full policy object is forbidden.

#### Scenario: Additive-only modifications are used

WHEN the listener modifies the CSP object received from `AddContentSecurityPolicyEvent`
THEN it MUST call only additive setter/adder methods
AND it MUST NOT call any method that clears or replaces existing directives

#### Scenario: Other installed apps are unaffected

WHEN multiple Nextcloud apps are installed alongside `doomnextcloud`
THEN each app's pages MUST retain Nextcloud's unmodified default CSP
AND no directive set by another app's CSP listener MUST be removed or overridden by the doomnextcloud listener
