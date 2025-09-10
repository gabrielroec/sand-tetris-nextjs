/**
 * AirplaneMode - Modo avião arcade que interrompe o Tetris
 * Quando o jogador atinge 1000 pontos, o avião aparece para atirar nas partículas
 */
import { GRID_W, GRID_H } from "./constants.js";
import { idx, inBounds } from "./grid.js";
import { audioManager } from "./AudioManager.js";

export class AirplaneMode {
  constructor() {
    this.active = false;
    this.airplane = {
      x: GRID_W / 2,
      y: 2,
      width: 3,
      height: 2,
      speed: 0.3, // Aumentado para melhor responsividade
      direction: 1, // 1 = direita, -1 = esquerda
    };
    this.bullets = [];
    this.bulletSpeed = 0.8;
    this.timeRemaining = 10000; // 10 segundos em ms
    this.startTime = 0;
    this.score = 0;
    this.hits = 0;
    this.lastShootPressed = false;
    this.shootCooldown = 0;
    this.shootInterval = 150; // ms entre tiros
  }

  start() {
    this.active = true;
    this.airplane.x = GRID_W / 2;
    this.airplane.y = 2;
    this.airplane.direction = 1;
    this.bullets = [];
    this.timeRemaining = 10000;
    this.startTime = Date.now();
    this.score = 0;
    this.hits = 0;
    audioManager.playButtonClick(); // Som de início do modo avião
  }

  stop() {
    this.active = false;
    this.bullets = [];
    audioManager.playButtonClick(); // Som de fim do modo avião
  }

  update(stepMs, keys, grid) {
    if (!this.active) return;

    this.timeRemaining -= stepMs;

    // Move o avião com as setas (controle manual) - mais responsivo
    if (keys.left && this.airplane.x > 0) {
      this.airplane.x -= this.airplane.speed * 3; // Aumentado multiplicador
    }
    if (keys.right && this.airplane.x < GRID_W - this.airplane.width) {
      this.airplane.x += this.airplane.speed * 3; // Aumentado multiplicador
    }

    // Sistema de tiro automático (como space shooters clássicos)
    this.shootCooldown -= stepMs;

    if (this.shootCooldown <= 0) {
      this.bullets.push({
        x: this.airplane.x + Math.floor(this.airplane.width / 2),
        y: this.airplane.y + this.airplane.height,
        active: true,
      });
      this.shootCooldown = this.shootInterval;
      audioManager.playMove(); // Som de tiro
    }

    // Move balas
    this.bullets = this.bullets.filter((bullet) => {
      bullet.y += this.bulletSpeed;

      // Remove balas que saíram da tela
      if (bullet.y >= GRID_H) {
        return false;
      }

      // Verifica colisão com partículas
      if (this.checkBulletCollision(bullet, grid)) {
        this.hits++;
        this.score += 10;
        // Som de acerto
        audioManager.playMove();
        return false;
      }

      return true;
    });

    // Verifica se o tempo acabou
    if (this.timeRemaining <= 0) {
      this.stop();
      return true; // Indica que deve voltar ao Tetris
    }

    return false;
  }

  checkBulletCollision(bullet, grid) {
    const x = Math.floor(bullet.x);
    const y = Math.floor(bullet.y);

    if (!inBounds(x, y)) return false;

    // Verifica colisão em uma área 2x2 para melhor precisão
    for (let dx = 0; dx < 2; dx++) {
      for (let dy = 0; dy < 2; dy++) {
        const checkX = x + dx;
        const checkY = y + dy;
        
        if (inBounds(checkX, checkY)) {
          const cellIndex = idx(checkX, checkY);
          if (grid[cellIndex] !== 0) {
            // Remove a partícula
            grid[cellIndex] = 0;
            return true;
          }
        }
      }
    }

    return false;
  }

  render(ctx, canvas) {
    if (!this.active) return;

    const cellW = Math.floor(canvas.width / GRID_W);
    const cellH = Math.floor(canvas.height / GRID_H);

    // Desenha o avião (formato de nave espacial)
    ctx.fillStyle = "#ff6b6b";
    const ax = this.airplane.x * cellW;
    const ay = this.airplane.y * cellH;
    const aw = this.airplane.width * cellW;
    const ah = this.airplane.height * cellH;

    // Corpo da nave
    ctx.fillRect(ax + aw / 4, ay, aw / 2, ah);
    // Asas
    ctx.fillRect(ax, ay + ah / 2, aw, ah / 2);
    // Nose
    ctx.fillRect(ax + aw / 3, ay - ah / 2, aw / 3, ah / 2);

    // Desenha as balas (laser style)
    this.bullets.forEach((bullet) => {
      if (bullet.active) {
        const bx = bullet.x * cellW;
        const by = bullet.y * cellH;

        // Gradiente para efeito laser
        const gradient = ctx.createLinearGradient(bx, by, bx, by + cellH);
        gradient.addColorStop(0, "#ffff00");
        gradient.addColorStop(0.5, "#ffaa00");
        gradient.addColorStop(1, "#ff6600");

        ctx.fillStyle = gradient;
        ctx.fillRect(bx + cellW / 4, by, cellW / 2, cellH);

        // Brilho
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(bx + cellW / 3, by, cellW / 3, cellH);
      }
    });

    // Desenha HUD do modo avião
    this.renderHUD(ctx, canvas);
  }

  renderHUD(ctx, canvas) {
    // HUD mínimo no canto superior direito para não tampar o avião
    const cellW = Math.floor(canvas.width / GRID_W);
    const cellH = Math.floor(canvas.height / GRID_H);

    // Fundo discreto no canto superior direito
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(canvas.width - 150, 0, 150, 80);

    // Tempo restante
    ctx.fillStyle = "#ff6b6b";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`${Math.ceil(this.timeRemaining / 1000)}s`, canvas.width - 10, 20);

    // Pontuação
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.fillText(`Pts: ${this.score}`, canvas.width - 10, 40);

    // Acertos
    ctx.fillText(`Hits: ${this.hits}`, canvas.width - 10, 60);
  }

  isActive() {
    return this.active;
  }

  getScore() {
    return this.score;
  }

  getHits() {
    return this.hits;
  }

  getTimeRemaining() {
    return this.timeRemaining;
  }
}
