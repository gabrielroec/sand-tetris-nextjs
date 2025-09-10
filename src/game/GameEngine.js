/**
 * GameEngine - Classe principal que gerencia a lógica do jogo
 * Aplica princípios SOLID e KISS
 */
import { makeEmptyCells, makeEmptyRest } from "./grid.js";
import { newRandomPiece } from "./tetrominoes.js";
import { canPlace, placeToSand } from "./piece.js";
import { simulateSand } from "./sand.js";
import { clearColorLines } from "./lineClear.js";
import { GRID_W, GRID_H, BASE_FALL_MS, SAND_BUDGET, REST_K, LINES_PER_LEVEL, SCORE_PER_LINE } from "./constants.js";

export class GameEngine {
  constructor() {
    this.reset();
  }

  reset() {
    // Estado do jogo
    this.state = {
      running: true,
      gameOver: false,
      tick: 0,
      level: 1,
      lines: 0,
      score: 0,
      combo: 0,
      lastClearTick: -9999,
      pieceFallMs: BASE_FALL_MS,
      fallAccMs: 0,
      softDrop: false,
      biasToggle: false,
      current: null,
      next: null,
    };

    // Grids double-buffer
    this.cellsA = makeEmptyCells();
    this.cellsB = makeEmptyCells();
    this.restA = makeEmptyRest();
    this.restB = makeEmptyRest();

    this.grids = {
      read: this.cellsA,
      write: this.cellsB,
      restRead: this.restA,
      restWrite: this.restB,
    };

    // Spawn inicial
    this.state.next = newRandomPiece();
    this.state.current = this.spawnPieceOrGameOver();
  }

  spawnPieceOrGameOver() {
    const p = this.state.next ?? newRandomPiece();
    p.x = Math.floor(GRID_W / 2) - 2;
    p.y = 0;
    p.rotation = 0;

    if (!canPlace(this.grids.read, p)) {
      this.state.gameOver = true;
      return null;
    }

    this.state.next = newRandomPiece();
    return p;
  }

  update(stepMs, keys) {
    if (!this.state.running || this.state.gameOver) return;

    this.state.tick++;
    this.state.biasToggle = !this.state.biasToggle;

    this.handleInput(keys);
    this.updatePieceFall(stepMs);
    this.updateSand();
    this.updateLineClearing();
  }

  handleInput(keys) {
    if (!this.state.current) return;

    // Processa movimento lateral
    if (keys.left) {
      this.state.current = this.tryMovePiece(-1, 0);
    }
    if (keys.right) {
      this.state.current = this.tryMovePiece(1, 0);
    }
    if (keys.rotate) {
      this.state.current = this.tryRotatePiece();
    }

    // Soft drop
    this.state.softDrop = keys.softDrop || false;
  }

  updatePieceFall(stepMs) {
    if (!this.state.current) return;

    const speedMul = this.state.softDrop ? 3 : 1;
    this.state.fallAccMs += stepMs * speedMul;
    const interval = Math.max(60, this.state.pieceFallMs);

    if (this.state.fallAccMs >= interval) {
      this.state.fallAccMs -= interval;
      this.tryMovePieceDown();
    }
  }

  tryMovePieceDown() {
    const moved = this.tryMovePiece(0, 1);
    if (moved === this.state.current) {
      // Colidiu - congelar em areia
      placeToSand(this.grids.read, this.grids.restRead, this.state.current);
      this.state.current = this.spawnPieceOrGameOver();
    } else {
      this.state.current = moved;
    }
  }

  updateSand() {
    simulateSand({
      read: this.grids.read,
      write: this.grids.write,
      restRead: this.grids.restRead,
      restWrite: this.grids.restWrite,
      budget: SAND_BUDGET,
      restK: REST_K,
      biasToggle: this.state.biasToggle,
    });

    // Swap buffers
    [this.grids.read, this.grids.write] = [this.grids.write, this.grids.read];
    [this.grids.restRead, this.grids.restWrite] = [this.grids.restWrite, this.grids.restRead];
  }

  updateLineClearing() {
    const cleared = clearColorLines(this.grids.read, this.grids.restRead);

    if (cleared > 0) {
      this.handleLineClear(cleared);
    } else {
      this.resetComboIfNeeded();
    }
  }

  handleLineClear(cleared) {
    const base = SCORE_PER_LINE * this.state.level;
    const chain = this.state.lastClearTick === this.state.tick - 1 ? this.state.combo + 1 : 1;

    this.state.combo = chain;
    this.state.score += base * cleared + 5 * (chain - 1);
    this.state.lines += cleared;
    this.state.lastClearTick = this.state.tick;

    this.updateLevel();
  }

  updateLevel() {
    if (this.state.lines > 0 && this.state.lines % LINES_PER_LEVEL === 0) {
      this.state.level += 1;
      this.state.pieceFallMs = Math.max(70, Math.floor(this.state.pieceFallMs * 0.88));
    }
  }

  resetComboIfNeeded() {
    if (this.state.lastClearTick !== this.state.tick - 1) {
      this.state.combo = 0;
    }
  }

  // Métodos públicos para interação
  tryMovePiece(dx, dy) {
    if (!this.state.current) return null;

    const moved = {
      ...this.state.current,
      x: this.state.current.x + dx,
      y: this.state.current.y + dy,
    };

    return canPlace(this.grids.read, moved) ? moved : this.state.current;
  }

  tryRotatePiece() {
    if (!this.state.current) return null;

    const rot = (this.state.current.rotation + 1) & 3;
    const rotated = { ...this.state.current, rotation: rot };

    // Kicks simples
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      const test = { ...rotated, x: rotated.x + k };
      if (canPlace(this.grids.read, test)) return test;
    }

    return this.state.current;
  }

  togglePause() {
    this.state.running = !this.state.running;
  }

  setSoftDrop(enabled) {
    this.state.softDrop = enabled;
  }

  // Getters para estado
  getState() {
    return { ...this.state };
  }

  getGrid() {
    return this.grids.read;
  }

  getCurrentPiece() {
    return this.state.current;
  }

  getNextPiece() {
    return this.state.next;
  }

  isGameOver() {
    return this.state.gameOver;
  }

  isRunning() {
    return this.state.running;
  }
}
