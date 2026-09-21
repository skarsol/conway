import { LifeGrid } from "./game.js";

const WIDTH = 60;
const HEIGHT = 40;

const PATTERNS = {
  glider: [
    [1, 0],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
  ],
  pulsar: [
    [2, 0], [3, 0], [4, 0], [8, 0], [9, 0], [10, 0],
    [0, 2], [5, 2], [7, 2], [12, 2],
    [0, 3], [5, 3], [7, 3], [12, 3],
    [0, 4], [5, 4], [7, 4], [12, 4],
    [2, 5], [3, 5], [4, 5], [8, 5], [9, 5], [10, 5],
    [2, 7], [3, 7], [4, 7], [8, 7], [9, 7], [10, 7],
    [0, 8], [5, 8], [7, 8], [12, 8],
    [0, 9], [5, 9], [7, 9], [12, 9],
    [0, 10], [5, 10], [7, 10], [12, 10],
    [2, 12], [3, 12], [4, 12], [8, 12], [9, 12], [10, 12],
  ],
  gosper: [
    [0, 4], [0, 5], [1, 4], [1, 5],
    [10, 4], [10, 5], [10, 6], [11, 3], [11, 7], [12, 2], [12, 8],
    [13, 2], [13, 8], [14, 5], [15, 3], [15, 7], [16, 4], [16, 5],
    [16, 6], [17, 5],
    [20, 2], [20, 3], [20, 4], [21, 2], [21, 3], [21, 4], [22, 1],
    [22, 5], [24, 0], [24, 1], [24, 5], [24, 6],
    [34, 2], [34, 3], [35, 2], [35, 3],
  ],
};

const canvas = document.querySelector("#board");
const context = canvas.getContext("2d");
const playButton = document.querySelector("#play");
const stepButton = document.querySelector("#step");
const clearButton = document.querySelector("#clear");
const randomizeButton = document.querySelector("#randomize");
const speedInput = document.querySelector("#speed");
const speedValue = document.querySelector("#speed-value");
const densityInput = document.querySelector("#density");
const densityValue = document.querySelector("#density-value");
const wrapInput = document.querySelector("#wrap");
const patternSelect = document.querySelector("#pattern");
const generationOutput = document.querySelector("#generation");
const liveOutput = document.querySelector("#live");

const grid = new LifeGrid(WIDTH, HEIGHT);

let generation = 0;
let running = false;
let animationFrame = null;
let previousTimestamp = null;
let accumulator = 0;
let painting = false;
let paintAlive = true;

function updateStatus() {
  generationOutput.textContent = String(generation);
  liveOutput.textContent = String(grid.countLive());
  speedValue.textContent = `${speedInput.value} gen/s`;
  densityValue.textContent = `${densityInput.value}%`;
}

function draw() {
  const bounds = canvas.getBoundingClientRect();
  const cellWidth = bounds.width / grid.width;
  const cellHeight = bounds.height / grid.height;
  const styles = getComputedStyle(document.documentElement);
  const boardColor = styles.getPropertyValue("--board").trim();
  const cellColor = styles.getPropertyValue("--cell").trim();
  const gridColor = styles.getPropertyValue("--grid").trim();

  context.clearRect(0, 0, bounds.width, bounds.height);
  context.fillStyle = boardColor;
  context.fillRect(0, 0, bounds.width, bounds.height);

  context.fillStyle = cellColor;

  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      if (!grid.get(x, y)) {
        continue;
      }

      const inset = Math.min(1, cellWidth * 0.08, cellHeight * 0.08);
      context.fillRect(
        x * cellWidth + inset,
        y * cellHeight + inset,
        Math.max(0, cellWidth - inset * 2),
        Math.max(0, cellHeight - inset * 2),
      );
    }
  }

  if (Math.min(cellWidth, cellHeight) >= 8) {
    context.beginPath();
    context.strokeStyle = gridColor;
    context.lineWidth = 1;

    for (let x = 1; x < grid.width; x += 1) {
      const pixelX = Math.round(x * cellWidth) + 0.5;
      context.moveTo(pixelX, 0);
      context.lineTo(pixelX, bounds.height);
    }

    for (let y = 1; y < grid.height; y += 1) {
      const pixelY = Math.round(y * cellHeight) + 0.5;
      context.moveTo(0, pixelY);
      context.lineTo(bounds.width, pixelY);
    }

    context.stroke();
  }
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const pixelWidth = Math.max(1, Math.round(bounds.width * ratio));
  const pixelHeight = Math.max(1, Math.round(bounds.height * ratio));

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  draw();
}

function advance() {
  grid.step({ wrap: wrapInput.checked });
  generation += 1;
  updateStatus();
  draw();
}

function animate(timestamp) {
  if (!running) {
    return;
  }

  if (previousTimestamp === null) {
    previousTimestamp = timestamp;
  }

  const interval = 1000 / Number(speedInput.value);
  accumulator += timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  let steps = 0;
  while (accumulator >= interval && steps < 8) {
    advance();
    accumulator -= interval;
    steps += 1;
  }

  animationFrame = requestAnimationFrame(animate);
}

function start() {
  if (running) {
    return;
  }

  running = true;
  previousTimestamp = null;
  accumulator = 0;
  playButton.textContent = "Pause";
  playButton.setAttribute("aria-pressed", "true");
  animationFrame = requestAnimationFrame(animate);
}

function stop() {
  running = false;
  previousTimestamp = null;
  accumulator = 0;
  playButton.textContent = "Play";
  playButton.setAttribute("aria-pressed", "false");

  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

function resetGeneration() {
  generation = 0;
  updateStatus();
  draw();
}

function canvasCell(event) {
  const bounds = canvas.getBoundingClientRect();
  const x = Math.floor(((event.clientX - bounds.left) / bounds.width) * grid.width);
  const y = Math.floor(((event.clientY - bounds.top) / bounds.height) * grid.height);

  return grid.inBounds(x, y) ? { x, y } : null;
}

function paint(event) {
  const cell = canvasCell(event);

  if (!cell) {
    return;
  }

  grid.set(cell.x, cell.y, paintAlive);
  updateStatus();
  draw();
}

function centerPattern(coordinates) {
  const width = Math.max(...coordinates.map(([x]) => x)) + 1;
  const height = Math.max(...coordinates.map(([, y]) => y)) + 1;

  return {
    offsetX: Math.floor((grid.width - width) / 2),
    offsetY: Math.floor((grid.height - height) / 2),
  };
}

playButton.addEventListener("click", () => {
  running ? stop() : start();
});

stepButton.addEventListener("click", () => {
  stop();
  advance();
});

clearButton.addEventListener("click", () => {
  stop();
  grid.clear();
  resetGeneration();
});

randomizeButton.addEventListener("click", () => {
  stop();
  grid.randomize(Number(densityInput.value) / 100);
  resetGeneration();
});

speedInput.addEventListener("input", updateStatus);
densityInput.addEventListener("input", updateStatus);

patternSelect.addEventListener("change", () => {
  const coordinates = PATTERNS[patternSelect.value];

  if (!coordinates) {
    return;
  }

  stop();
  grid.placePattern(coordinates, { ...centerPattern(coordinates), clear: true });
  resetGeneration();
});

canvas.addEventListener("pointerdown", (event) => {
  const cell = canvasCell(event);

  if (!cell) {
    return;
  }

  event.preventDefault();
  painting = true;
  paintAlive = !grid.get(cell.x, cell.y);
  canvas.setPointerCapture(event.pointerId);
  paint(event);
});

canvas.addEventListener("pointermove", (event) => {
  if (painting) {
    paint(event);
  }
});

canvas.addEventListener("pointerup", (event) => {
  painting = false;

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
});

canvas.addEventListener("pointercancel", () => {
  painting = false;
});

window.addEventListener("keydown", (event) => {
  const tagName = event.target.tagName;

  if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(tagName)) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    running ? stop() : start();
  } else if (event.key.toLowerCase() === "n" || event.key === "ArrowRight") {
    event.preventDefault();
    stop();
    advance();
  } else if (event.key.toLowerCase() === "c") {
    stop();
    grid.clear();
    resetGeneration();
  } else if (event.key.toLowerCase() === "r") {
    stop();
    grid.randomize(Number(densityInput.value) / 100);
    resetGeneration();
  }
});

new ResizeObserver(resizeCanvas).observe(canvas);
updateStatus();
resizeCanvas();
