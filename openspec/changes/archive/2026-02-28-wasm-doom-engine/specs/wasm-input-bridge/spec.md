## ADDED Requirements

### Requirement: Keyboard events are forwarded to the Doom engine
The input bridge SHALL translate browser `keydown` and `keyup` events on the canvas into
doomgeneric key codes and call the Module's exported `DG_KeyEvent(pressed, doomKey)` function.

#### Scenario: Arrow key pressed
- **WHEN** the user presses ArrowUp while the canvas is focused
- **THEN** `DG_KeyEvent(1, DOOM_KEY_UP_ARROW)` is called on the Module

#### Scenario: Arrow key released
- **WHEN** the user releases ArrowUp
- **THEN** `DG_KeyEvent(0, DOOM_KEY_UP_ARROW)` is called

#### Scenario: Unmapped key
- **WHEN** a key with no Doom mapping is pressed
- **THEN** the event is ignored (no error thrown)

### Requirement: Mouse movement is forwarded as Doom mouse input
The input bridge SHALL translate `mousemove` events on the canvas into relative X/Y deltas
and call `DG_MouseMoveEvent(dx, dy)` on the Module.

#### Scenario: Mouse moves over canvas
- **WHEN** the pointer moves 10px right over the canvas
- **THEN** `DG_MouseMoveEvent(10, 0)` is called

### Requirement: Mouse buttons are forwarded as Doom button events
Left, right, and middle mouse button press/release SHALL map to Doom button flags.

#### Scenario: Left mouse button pressed
- **WHEN** the user clicks the left mouse button on the canvas
- **THEN** the Module receives a fire button press event

### Requirement: Canvas is focused on click to capture keyboard input
The canvas element SHALL receive `focus()` when clicked so subsequent keyboard events are captured.

#### Scenario: User clicks canvas
- **WHEN** the user clicks anywhere on `#doomnextcloud-canvas`
- **THEN** `document.activeElement` becomes the canvas

### Requirement: Default browser actions for game keys are suppressed
Arrow keys, Space, Enter, and Escape SHALL have their default browser actions prevented
when the canvas has focus.

#### Scenario: Arrow key while canvas focused
- **WHEN** ArrowDown is pressed while canvas is focused
- **THEN** `event.preventDefault()` is called, preventing page scroll
