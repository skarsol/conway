export class LifeGrid {
  constructor(width, height, cells = null) {
    if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
      throw new RangeError("width and height must be positive integers");
    }

    this.width = width;
    this.height = height;
    this.cells = new Uint8Array(width * height);

    if (cells !== null) {
      if (cells.length !== this.cells.length) {
        throw new RangeError("cells length must match width * height");
      }

      for (let index = 0; index < cells.length; index += 1) {
        this.cells[index] = cells[index] ? 1 : 0;
      }
    }
  }

  inBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  index(x, y) {
    return y * this.width + x;
  }

  get(x, y) {
    return this.inBounds(x, y) ? this.cells[this.index(x, y)] : 0;
  }

  set(x, y, alive = true) {
    if (!this.inBounds(x, y)) {
      return false;
    }

    this.cells[this.index(x, y)] = alive ? 1 : 0;
    return true;
  }

  toggle(x, y) {
    if (!this.inBounds(x, y)) {
      return false;
    }

    const index = this.index(x, y);
    this.cells[index] = this.cells[index] ? 0 : 1;
    return Boolean(this.cells[index]);
  }

  clear() {
    this.cells.fill(0);
  }

  randomize(density = 0.28, random = Math.random) {
    if (density < 0 || density > 1) {
      throw new RangeError("density must be between 0 and 1");
    }

    for (let index = 0; index < this.cells.length; index += 1) {
      this.cells[index] = random() < density ? 1 : 0;
    }
  }

  countLive() {
    let total = 0;

    for (const cell of this.cells) {
      total += cell;
    }

    return total;
  }

  countNeighbors(x, y, { wrap = false } = {}) {
    let count = 0;

    for (let deltaY = -1; deltaY <= 1; deltaY += 1) {
      for (let deltaX = -1; deltaX <= 1; deltaX += 1) {
        if (deltaX === 0 && deltaY === 0) {
          continue;
        }

        let neighborX = x + deltaX;
        let neighborY = y + deltaY;

        if (wrap) {
          neighborX = (neighborX + this.width) % this.width;
          neighborY = (neighborY + this.height) % this.height;
          count += this.cells[this.index(neighborX, neighborY)];
        } else if (this.inBounds(neighborX, neighborY)) {
          count += this.cells[this.index(neighborX, neighborY)];
        }
      }
    }

    return count;
  }

  step({ wrap = false } = {}) {
    const next = new Uint8Array(this.cells.length);
    let changed = 0;
    let live = 0;

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const index = this.index(x, y);
        const alive = this.cells[index] === 1;
        const neighbors = this.countNeighbors(x, y, { wrap });
        const survives = alive && (neighbors === 2 || neighbors === 3);
        const born = !alive && neighbors === 3;
        const nextValue = survives || born ? 1 : 0;

        next[index] = nextValue;
        live += nextValue;

        if (nextValue !== this.cells[index]) {
          changed += 1;
        }
      }
    }

    this.cells = next;
    return { changed, live };
  }

  placePattern(coordinates, { offsetX = 0, offsetY = 0, clear = true } = {}) {
    if (clear) {
      this.clear();
    }

    for (const [x, y] of coordinates) {
      this.set(x + offsetX, y + offsetY, true);
    }
  }

  clone() {
    return new LifeGrid(this.width, this.height, this.cells);
  }
}
