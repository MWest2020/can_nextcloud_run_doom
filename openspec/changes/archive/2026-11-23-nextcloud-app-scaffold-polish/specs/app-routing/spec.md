# Spec: app-routing

## ADDED Requirements

### Requirement: Navigation entry registration

The app SHALL register a navigation entry in the Nextcloud sidebar via the `<navigations>` block in `appinfo/info.xml`. The entry MUST include a display name, a route pointing to `doomnextcloud.game.index`, and an icon filename referencing `app.svg`. The navigation entry MUST be visible to any authenticated user without requiring admin privileges.

#### Scenario: Sidebar entry appears for authenticated user

- WHEN an authenticated user loads the Nextcloud web UI
- THEN a navigation entry labelled "DoomNextcloud" SHALL appear in the Nextcloud sidebar
- THEN the entry SHALL link to the route `doomnextcloud.game.index`
- THEN the entry SHALL display the icon referenced by `app.svg`

#### Scenario: Navigation entry absent for unauthenticated user

- WHEN a user is not authenticated
- THEN the DoomNextcloud navigation entry SHALL NOT be rendered in the sidebar

---

### Requirement: Route resolves without 404 or redirect

A GET request to `/index.php/apps/doomnextcloud` MUST resolve to a successful HTTP 200 response. The Nextcloud router SHALL map this URL to `GameController::index()` using the route defined in `appinfo/routes.php` with name `game#index`, verb `GET`, and url `/`.

#### Scenario: Main app URL returns 200

- WHEN an authenticated user sends `GET /index.php/apps/doomnextcloud`
- THEN the HTTP response status SHALL be 200
- THEN no redirect SHALL occur before serving the response

#### Scenario: Route is registered in routes.php

- WHEN the Nextcloud framework loads `appinfo/routes.php`
- THEN the routes array SHALL contain an entry with `name` equal to `game#index`, `verb` equal to `GET`, and `url` equal to `/`

---

### Requirement: Controller returns TemplateResponse with RENDER_AS_USER

`GameController::index()` MUST return a `TemplateResponse` constructed with the app ID `doomnextcloud`, the template name `game`, an empty parameters array, and the render mode `TemplateResponse::RENDER_AS_USER`. This render mode MUST cause Nextcloud to wrap the template output in the standard authenticated user shell (header, navigation, footer).

#### Scenario: Response is a TemplateResponse with user shell

- WHEN `GameController::index()` is invoked
- THEN the return value SHALL be an instance of `OCP\AppFramework\Http\TemplateResponse`
- THEN the render mode SHALL be `TemplateResponse::RENDER_AS_USER`
- THEN the rendered HTML SHALL include the Nextcloud user shell (navigation bar and page chrome)

#### Scenario: Template name resolves to templates/game.php

- WHEN Nextcloud renders the TemplateResponse with template name `game`
- THEN it SHALL load the file `templates/game.php` from the `doomnextcloud` app directory

---

### Requirement: Route name follows Nextcloud convention

The fully qualified Nextcloud route name for the main game page MUST be `doomnextcloud.game.index`. This name is derived from the app ID (`doomnextcloud`), the controller name (`game`), and the method name (`index`), following the standard Nextcloud `<appid>.<controller>.<method>` convention.

#### Scenario: Route name resolves correctly via URL helper

- WHEN the Nextcloud URL generator is asked to resolve the route `doomnextcloud.game.index`
- THEN it SHALL produce the URL `/index.php/apps/doomnextcloud`

#### Scenario: Navigation entry references correct route name

- WHEN the `<navigation>` block in `appinfo/info.xml` is parsed
- THEN the `<route>` element SHALL contain the value `doomnextcloud.game.index`

---

### Requirement: No CSRF token required for the game page

Because the game page is a read-only GET endpoint that does not mutate server state, CSRF protection SHALL be suppressed for `GameController::index()`. The method MUST be annotated with `#[NoCSRFRequired]` so that Nextcloud does not reject requests lacking a CSRF token.

#### Scenario: GET request succeeds without CSRF token

- WHEN an authenticated user sends `GET /index.php/apps/doomnextcloud` without a CSRF token in the request
- THEN the response status SHALL be 200
- THEN Nextcloud SHALL NOT return a CSRF error or 401 response

#### Scenario: NoCSRFRequired attribute is present on index method

- WHEN the PHP reflection of `GameController::index()` is inspected
- THEN the attribute `OCP\AppFramework\Http\Attribute\NoCSRFRequired` SHALL be present on the method

---

### Requirement: Unauthenticated users are redirected to Nextcloud login

Any request to `/index.php/apps/doomnextcloud` from a session that is not authenticated MUST be handled by Nextcloud's standard authentication middleware. The middleware SHALL redirect the unauthenticated request to the Nextcloud login page. The controller method SHALL NOT be reachable without a valid session.

#### Scenario: Unauthenticated GET is redirected to login

- WHEN a user without an active session sends `GET /index.php/apps/doomnextcloud`
- THEN the HTTP response SHALL be a redirect (3xx) to the Nextcloud login URL
- THEN `GameController::index()` SHALL NOT be executed

#### Scenario: NoAdminRequired does not bypass authentication

- WHEN the `#[NoAdminRequired]` attribute is present on `GameController::index()`
- THEN it SHALL only suppress the admin-role check
- THEN standard Nextcloud session authentication SHALL still be enforced for all requests to the route
