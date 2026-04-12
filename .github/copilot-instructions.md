# Project Guidelines

## Code Style
- Use ES6 modules for imports/exports.
- Keep code simple and readable, with comments for complex logic.

## Architecture
- Modular structure: `main.js` orchestrates the game flow, separate files for story (`story.js`), player state (`player.js`), UI rendering (`ui.js`), and battle logic (`battle.js`).
- Player state is a simple object in `player.js`.
- Story scenes are defined in `story.js` with choices, effects, and battle triggers.
- UI functions in `ui.js` handle rendering story, choices, status, battle, and map.
- Battle mechanics in `battle.js` manage turn-based combat.

## Build and Test
- No build system required; run the game by opening `index.html` in a web browser.
- No automated tests present; manual testing by playing the game.

## Conventions
- Game text and UI elements are in Chinese.
- Use simple object-based state management without external libraries.
- Functions are pure where possible, with side effects limited to DOM manipulation and state updates.