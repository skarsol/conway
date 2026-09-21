# Conway's Game of Life

A zero-dependency browser implementation of Conway's Game of Life.

## Features

- Classic Conway B3/S23 rules
- 60 × 40 interactive grid
- Play, pause, and single-generation stepping
- Click-and-drag cell painting
- Adjustable simulation speed
- Adjustable random-board density
- Optional edge wrapping
- Glider, pulsar, and Gosper glider gun presets
- Keyboard shortcuts
- Unit-tested simulation engine

## Run locally

Because the browser app uses ES modules, serve the repository over HTTP rather than opening `index.html` directly.

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

No package installation or build step is required for the application.

## Tests

The tests use Node's built-in test runner and have no third-party dependencies.

```bash
npm test
```

Node 20 or newer is supported.

## Controls

- **Play / Pause** — run or pause the simulation
- **Step** — advance exactly one generation
- **Randomize** — seed the board using the selected density
- **Clear** — empty the board
- **Pattern** — load a centered predefined seed
- **Wrap edges** — treat the board as a torus instead of a bounded plane

Keyboard shortcuts:

- **Space** — play/pause
- **N** or **→** — step
- **R** — randomize
- **C** — clear

## Rules

For each generation:

1. A live cell with fewer than two live neighbors dies.
2. A live cell with two or three live neighbors survives.
3. A live cell with more than three live neighbors dies.
4. A dead cell with exactly three live neighbors becomes alive.
