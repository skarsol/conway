import assert from "node:assert/strict";
import test from "node:test";

import { LifeGrid } from "../game.js";

function liveCells(grid) {
  const cells = [];

  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      if (grid.get(x, y)) {
        cells.push([x, y]);
      }
    }
  }

  return cells;
}

test("a block is a still life", () => {
  const grid = new LifeGrid(4, 4);
  grid.placePattern([
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
  ]);

  const before = liveCells(grid);
  const result = grid.step();

  assert.deepEqual(liveCells(grid), before);
  assert.equal(result.changed, 0);
  assert.equal(result.live, 4);
});

test("a blinker oscillates every generation", () => {
  const grid = new LifeGrid(5, 5);
  grid.placePattern([
    [1, 2],
    [2, 2],
    [3, 2],
  ]);

  grid.step();

  assert.deepEqual(liveCells(grid), [
    [2, 1],
    [2, 2],
    [2, 3],
  ]);

  grid.step();

  assert.deepEqual(liveCells(grid), [
    [1, 2],
    [2, 2],
    [3, 2],
  ]);
});

test("a dead cell with exactly three neighbors is born", () => {
  const grid = new LifeGrid(3, 3);
  grid.placePattern([
    [0, 0],
    [1, 0],
    [0, 1],
  ]);

  grid.step();

  assert.equal(grid.get(1, 1), 1);
});

test("cells with fewer than two neighbors die", () => {
  const grid = new LifeGrid(3, 3);
  grid.set(1, 1, true);
  grid.set(1, 2, true);

  grid.step();

  assert.equal(grid.countLive(), 0);
});

test("edge wrapping is optional", () => {
  const withoutWrap = new LifeGrid(3, 3);
  withoutWrap.placePattern([
    [0, 0],
    [2, 0],
    [0, 2],
  ]);

  const withWrap = withoutWrap.clone();

  withoutWrap.step({ wrap: false });
  withWrap.step({ wrap: true });

  assert.equal(withoutWrap.get(2, 2), 0);
  assert.equal(withWrap.get(2, 2), 1);
});

test("randomize honors a supplied deterministic random function", () => {
  const grid = new LifeGrid(4, 1);
  const values = [0.1, 0.8, 0.49, 0.5];
  let index = 0;

  grid.randomize(0.5, () => values[index++]);

  assert.deepEqual(liveCells(grid), [
    [0, 0],
    [2, 0],
  ]);
});
