import { idx, inBounds } from "./grid.js";
import { GRID_W, GRID_H } from "./constants.js";
import { blocksWorld } from "./tetrominoes.js";

export function canPlace(cells, piece) {
  const blocks = blocksWorld(piece);
  for (const [x, y] of blocks) {
    if (!inBounds(x, y)) return false;
    if (cells[idx(x, y)] !== 0) return false;
  }
  return true;
}

export function tryMove(cells, piece, dx, dy) {
  const moved = { ...piece, x: piece.x + dx, y: piece.y + dy };
  return canPlace(cells, moved) ? moved : piece;
}

export function tryRotate(cells, piece) {
  const rot = (piece.rotation + 1) & 3;
  const rotated = { ...piece, rotation: rot };
  // kicks simples: tentar centro, -1, +1
  const kicks = [0, -1, 1, -2, 2];
  for (const k of kicks) {
    const test = { ...rotated, x: rotated.x + k };
    if (canPlace(cells, test)) return test;
  }
  return piece;
}

export function placeToSand(cells, rest, piece) {
  const blocks = blocksWorld(piece);
  for (const [x, y] of blocks) {
    const i = idx(x, y);
    if (i >= 0 && i < cells.length) {
      cells[i] = piece.color;
      rest[i] = 0;
    }
  }
}
