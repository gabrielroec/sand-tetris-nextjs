import { GRID_W, GRID_H } from "./constants.js";

export const idx = (x, y) => y * GRID_W + x;
export const inBounds = (x, y) => x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;

export function makeEmptyCells() {
  return new Uint16Array(GRID_W * GRID_H);
}

export function makeEmptyRest() {
  return new Uint8Array(GRID_W * GRID_H);
}
