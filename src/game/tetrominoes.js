import { COLOR_COUNT } from "./constants.js";

// Offsets base para cada tetrominó (rotação 0)
const TETROS = {
  I: [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
  ],
  O: [
    [1, 0],
    [2, 0],
    [1, 1],
    [2, 1],
  ],
  T: [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  L: [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  J: [
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  S: [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],
  Z: [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
};

function rotatePoint([x, y]) {
  return [y, 3 - x];
} // rotação em uma caixa 4x4

function buildRotations(shape) {
  const r0 = shape;
  const r1 = r0.map(rotatePoint);
  const r2 = r1.map(rotatePoint);
  const r3 = r2.map(rotatePoint);
  return [r0, r1, r2, r3];
}

const KEYS = Object.keys(TETROS);
const ROTATIONS = Object.fromEntries(KEYS.map((k) => [k, buildRotations(TETROS[k])]));

export function newRandomPiece() {
  const kind = KEYS[(Math.random() * KEYS.length) | 0];
  const color = 1 + ((Math.random() * COLOR_COUNT) | 0);
  return { kind, rotations: ROTATIONS[kind], rotation: 0, x: 0, y: 0, color };
}

export function blocksWorld(piece) {
  const shape = piece.rotations[piece.rotation];
  return shape.map(([dx, dy]) => [piece.x + dx, piece.y + dy]);
}
