# Action Payloads — Input Simulation Reference

Reference for simulating game inputs via Playwright MCP.

## Keyboard Input

Use `browser_press_key` with these key names:

| Game Action | Key Name |
|------------|----------|
| Move left | `ArrowLeft` |
| Move right | `ArrowRight` |
| Move up | `ArrowUp` |
| Move down | `ArrowDown` |
| Jump/action | `Space` |
| Confirm | `Enter` |
| Pause | `Escape` |
| Fullscreen | `f` |
| Letters | `a` through `z` |

## Mouse Input

Use `browser_click` with coordinates relative to the game container:

```
browser_click at coordinates (x, y)
```

For canvas games, coordinates are relative to the canvas element's
bounding box.

## Multi-Step Sequences

To test complex interactions, combine inputs with time advancement:

### Example: Move right, then jump
```
1. browser_press_key "ArrowRight"
2. browser_evaluate "window.advanceTime(500)"   // 0.5s of movement
3. browser_press_key "Space"
4. browser_evaluate "window.advanceTime(1000)"  // 1s of jump arc
5. browser_take_screenshot                      // Verify result
6. browser_evaluate "window.render_game_to_text()" // Check state
```

### Example: Click menu button, then play
```
1. browser_click at "Start Game" button
2. browser_evaluate "window.advanceTime(500)"   // Transition
3. browser_take_screenshot                      // Verify game started
4. browser_evaluate "window.render_game_to_text()" // Confirm mode="playing"
```

## Testing Patterns

### Exhaustive Input Test
Test every possible input and verify state changes:
1. For each input (arrows, space, enter, click):
   - Capture state before
   - Apply input + advance time
   - Capture state after
   - Verify expected change occurred

### Boundary Test
Push game to edges:
1. Hold left until player reaches left boundary
2. Verify player stops (not wrapping, not going off-screen)
3. Repeat for right, top, bottom

### Rapid Input Test
Simulate fast button mashing:
1. Press multiple keys in quick succession
2. Advance minimal time between presses
3. Verify no crashes, errors, or state corruption
