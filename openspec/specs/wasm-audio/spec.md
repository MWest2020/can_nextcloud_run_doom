## ADDED Requirements

### Requirement: AudioContext is created only after a user gesture
The audio subsystem SHALL NOT create or resume an `AudioContext` before the first user
interaction (click or key press) to comply with browser autoplay policies.

#### Scenario: Page loads without interaction
- **WHEN** the page loads and no user interaction has occurred
- **THEN** no AudioContext is created and no console warning about suspended audio is emitted

#### Scenario: User clicks canvas
- **WHEN** the user clicks the canvas for the first time
- **THEN** an AudioContext is created (or resumed if suspended) and audio playback begins

### Requirement: Audio failure does not prevent the game from running
If the AudioContext cannot be created or resumed (e.g., browser policy blocks it), the game
SHALL continue to run without audio rather than showing the error overlay.

#### Scenario: AudioContext creation fails
- **WHEN** `new AudioContext()` throws
- **THEN** the error is caught, a console warning is emitted, and the game continues without audio

### Requirement: Emscripten SDL2 audio backend is used
The doomgeneric Emscripten build SHALL be compiled with `-s USE_SDL=2` so that SDL_mixer
audio output routes through the Emscripten SDL2 audio backend, which uses Web Audio API
internally.

#### Scenario: Game plays a sound effect
- **WHEN** the player fires a weapon in-game
- **THEN** the corresponding sound effect is audible in the browser (when audio is unlocked)
