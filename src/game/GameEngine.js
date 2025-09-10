/**
 * GameEngine - Classe principal que gerencia a lógica do jogo
 * Aplica princípios SOLID e KISS
 */
import { makeEmptyCells, makeEmptyRest } from "./grid.js";
import { newRandomPiece } from "./tetrominoes.js";
import { canPlace, placeToSand } from "./piece.js";
import { simulateSand } from "./sand.js";
import { clearColorLines } from "./lineClear.js";
import { audioManager } from "./AudioManager.js";
import { AirplaneMode } from "./AirplaneMode.js";
import { GRID_W, BASE_FALL_MS, SAND_BUDGET, REST_K } from "./constants.js";
import { track } from "@vercel/analytics";

export class GameEngine {
  constructor() {
    this.airplaneMode = new AirplaneMode();
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
      gameStartTime: Date.now(),
      lastSecondScore: 0,
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

    // Track game start
    track("game_start", {
      game: "sand-tetris",
      timestamp: new Date().toISOString(),
    });
  }

  spawnPieceOrGameOver() {
    const p = this.state.next ?? newRandomPiece();
    p.x = Math.floor(GRID_W / 2) - 2;
    p.y = 0;
    p.rotation = 0;

    if (!canPlace(this.grids.read, p)) {
      this.state.gameOver = true;
      audioManager.playGameOver();

      // Track game over
      track("game_over", {
        game: "sand-tetris",
        score: this.state.score,
        level: this.state.level,
        lines: this.state.lines,
        timestamp: new Date().toISOString(),
      });

      return null;
    }

    this.state.next = newRandomPiece();
    return p;
  }

  update(stepMs, keys) {
    if (!this.state.running || this.state.gameOver) return;

    // Sistema progressivo de modo avião: 1000, 2000, 3000, 4000...
    const airplaneThreshold = Math.floor(this.state.score / 1000) * 1000 + 1000;
    const nextThreshold = airplaneThreshold + 1000;

    if (this.state.score >= airplaneThreshold && this.state.score < nextThreshold && !this.airplaneMode.isActive()) {
      this.airplaneMode.start();
      this.state.score += 100; // Adiciona 100 pontos ao entrar no modo avião

      // Track airplane mode activation
      track("airplane_mode_start", {
        game: "sand-tetris",
        score: this.state.score,
        level: this.state.level,
        threshold: airplaneThreshold,
        timestamp: new Date().toISOString(),
      });
    }

    // Se o modo avião está ativo, atualiza ele
    if (this.airplaneMode.isActive()) {
      const shouldReturnToTetris = this.airplaneMode.update(stepMs, keys, this.grids.read);
      if (shouldReturnToTetris) {
        // Adiciona pontos do modo avião ao score total
        this.state.score += this.airplaneMode.getScore();

        // Track airplane mode end
        track("airplane_mode_end", {
          game: "sand-tetris",
          airplaneScore: this.airplaneMode.getScore(),
          airplaneHits: this.airplaneMode.getHits(),
          totalScore: this.state.score,
          timestamp: new Date().toISOString(),
        });

        // Continua o jogo normal do Tetris
      } else {
        return; // Não atualiza o Tetris enquanto o avião está ativo
      }
    }

    this.state.tick++;
    this.state.biasToggle = !this.state.biasToggle;

    // Sistema de pontos por tempo de sobrevivência (1 ponto por segundo)
    this.updateSurvivalScore();

    this.handleInput(keys);
    this.updatePieceFall(stepMs);
    this.updateSand();
    this.updateLineClearing();
  }

  handleInput(keys) {
    if (!this.state.current) return;

    // Processa movimento lateral
    if (keys.left) {
      const newPiece = this.tryMovePiece(-1, 0);
      if (newPiece !== this.state.current) {
        this.state.current = newPiece;
        audioManager.playMove();
      }
    }
    if (keys.right) {
      const newPiece = this.tryMovePiece(1, 0);
      if (newPiece !== this.state.current) {
        this.state.current = newPiece;
        audioManager.playMove();
      }
    }
    if (keys.rotate) {
      const newPiece = this.tryRotatePiece();
      if (newPiece !== this.state.current) {
        this.state.current = newPiece;
        audioManager.playRotate();
      }
    }

    // Soft drop
    this.state.softDrop = keys.softDrop || false;
    if (keys.softDrop) {
      audioManager.playSoftDrop();
    }
  }

  updatePieceFall(stepMs) {
    if (!this.state.current) return;

    const speedMul = this.state.softDrop ? 6 : 1; // Soft drop mais rápido
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
      audioManager.playLand();
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
    const base = 500 * this.state.level; // 500 pontos por faixa
    const chain = this.state.lastClearTick === this.state.tick - 1 ? this.state.combo + 1 : 1;

    this.state.combo = chain;
    this.state.score += base * cleared + 5 * (chain - 1);
    this.state.lines += cleared;
    this.state.lastClearTick = this.state.tick;

    // Efeitos sonoros
    audioManager.playLineClear(cleared);
    if (chain > 1) {
      audioManager.playCombo(chain);
    }

    // Track line clear
    track("line_clear", {
      game: "sand-tetris",
      linesCleared: cleared,
      score: this.state.score,
      level: this.state.level,
      combo: chain,
      timestamp: new Date().toISOString(),
    });

    this.updateLevel();
  }

  updateLevel() {
    // Sube de nível a cada 2000 pontos
    const newLevel = Math.floor(this.state.score / 2000) + 1;
    if (newLevel > this.state.level) {
      this.state.level = newLevel;
      this.state.pieceFallMs = Math.max(70, Math.floor(this.state.pieceFallMs * 0.88));
      audioManager.playLevelUp();

      // Track level up
      track("level_up", {
        game: "sand-tetris",
        level: newLevel,
        score: this.state.score,
        timestamp: new Date().toISOString(),
      });
    }
  }

  resetComboIfNeeded() {
    if (this.state.lastClearTick !== this.state.tick - 1) {
      this.state.combo = 0;
    }
  }

  updateSurvivalScore() {
    const currentTime = Date.now();
    const secondsElapsed = Math.floor((currentTime - this.state.gameStartTime) / 1000);

    // Adiciona 1 ponto por segundo de sobrevivência
    if (secondsElapsed > this.state.lastSecondScore) {
      this.state.score += secondsElapsed - this.state.lastSecondScore;
      this.state.lastSecondScore = secondsElapsed;
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
    audioManager.playPause();

    // Track pause/resume
    if (this.state.running) {
      track("game_resume", {
        game: "sand-tetris",
        score: this.state.score,
        level: this.state.level,
        timestamp: new Date().toISOString(),
      });
    } else {
      track("game_pause", {
        game: "sand-tetris",
        score: this.state.score,
        level: this.state.level,
        timestamp: new Date().toISOString(),
      });
    }
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

  // Métodos para o modo avião
  isAirplaneModeActive() {
    return this.airplaneMode.isActive();
  }

  getAirplaneMode() {
    return this.airplaneMode;
  }
}
