/**
 * Renderer - Responsável por toda a renderização do jogo
 * Aplica princípio SRP (Single Responsibility Principle)
 */
import { GRID_W, GRID_H, CELL_COLORS, BOARD_CELL_PX, PREVIEW_CELL_PX } from "./constants.js";
import { idx, inBounds } from "./grid.js";
import { blocksWorld } from "./tetrominoes.js";

export class Renderer {
  constructor(canvas, nextCanvas) {
    this.canvas = canvas;
    this.nextCanvas = nextCanvas;
    this.ctx = canvas.getContext("2d");
    this.nextCtx = nextCanvas.getContext("2d");
  }

  render(gameState, currentPiece) {
    this.clearCanvas();
    this.renderBackground();
    this.renderGrid(gameState.grid);
    this.renderCurrentPiece(currentPiece);
  }

  renderNext(piece) {
    if (!this.nextCanvas || !piece) return;

    this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    this.nextCtx.fillStyle = "#0b0c10";
    this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

    const cell = Math.floor(Math.min(this.nextCanvas.width, this.nextCanvas.height) / 8);
    const ox = Math.floor(this.nextCanvas.width / 2 - 2 * cell);
    const oy = Math.floor(this.nextCanvas.height / 2 - 2 * cell);

    this.nextCtx.fillStyle = CELL_COLORS[piece.color];
    const blocks = piece.rotations[0];

    for (const [x, y] of blocks) {
      this.nextCtx.fillRect(ox + x * cell, oy + y * cell, cell, cell);
    }
  }

  clearCanvas() {
    this.ctx.fillStyle = "#0b0c10";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderBackground() {
    // Fundo já foi preenchido no clearCanvas
  }

  renderGrid(cells) {
    const cellW = Math.floor(this.canvas.width / GRID_W);
    const cellH = Math.floor(this.canvas.height / GRID_H);

    // Desenha as células coloridas
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const c = cells[idx(x, y)];
        if (c !== 0) {
          this.ctx.fillStyle = CELL_COLORS[c];
          this.ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
        }
      }
    }

    // Desenha as linhas do grid
    this.drawGridLines(cellW, cellH);
  }

  drawGridLines(cellW, cellH) {
    this.ctx.strokeStyle = "rgba(43, 50, 71, 0.3)"; // Cor sutil
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();

    // Linhas verticais
    for (let x = 0; x <= GRID_W; x++) {
      const xPos = x * cellW;
      this.ctx.moveTo(xPos, 0);
      this.ctx.lineTo(xPos, this.canvas.height);
    }

    // Linhas horizontais
    for (let y = 0; y <= GRID_H; y++) {
      const yPos = y * cellH;
      this.ctx.moveTo(0, yPos);
      this.ctx.lineTo(this.canvas.width, yPos);
    }

    this.ctx.stroke();
  }

  renderCurrentPiece(piece) {
    if (!piece) return;

    const cellW = Math.floor(this.canvas.width / GRID_W);
    const cellH = Math.floor(this.canvas.height / GRID_H);
    const color = CELL_COLORS[piece.color];

    this.ctx.fillStyle = color;
    const blocks = blocksWorld(piece);

    for (const [bx, by] of blocks) {
      if (inBounds(bx, by)) {
        this.ctx.fillRect(bx * cellW, by * cellH, cellW, cellH);
      }
    }
  }

  resizeCanvas() {
    const INTERNAL_W = GRID_W * BOARD_CELL_PX;
    const INTERNAL_H = GRID_H * BOARD_CELL_PX;

    this.canvas.width = INTERNAL_W;
    this.canvas.height = INTERNAL_H;
    this.canvas.style.width = INTERNAL_W + "px";
    this.canvas.style.height = INTERNAL_H + "px";

    if (this.nextCanvas) {
      const s = PREVIEW_CELL_PX;
      this.nextCanvas.width = 8 * s;
      this.nextCanvas.height = 8 * s;
      this.nextCanvas.style.width = this.nextCanvas.width + "px";
      this.nextCanvas.style.height = this.nextCanvas.height + "px";
    }
  }
}
