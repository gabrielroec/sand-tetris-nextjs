"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// Game constants
const C_W = 12,
  C_H = 22;
const SUB = 4,
  F_W = C_W * SUB,
  F_H = C_H * SUB;
const COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];
const TETROS = [
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ], // O
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ], // I
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ], // L
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
  ], // J
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ], // Z
  [
    [0, 1],
    [1, 1],
    [1, 0],
    [2, 0],
  ], // S
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ], // T
];

export interface GameState {
  sand: number[][];
  active: { shape: number[][]; x: number; y: number; color: number } | null;
  ghost: { shape: number[][]; x: number; y: number; color: number } | null;
  nextPiece: { shape: number[][]; color: number } | null;
  score: number;
  level: number;
  paused: boolean;
  gameOver: boolean;
  fastDrop: boolean;
  scoreFlash: number;
  combo: number;
  comboMultiplier: number;
  flashes: Array<{ x: number; y: number; ttl: number }>;
  popups: Array<{ x: number; y: number; text: string; ttl: number; vy: number }>;
  clearingAnimations: Array<{ x: number; y: number; ttl: number; type: string; color: number }>;
  // Mini-game arcade properties
  arcadeMode: boolean;
  arcadeScore: number;
  arcadeTimeLeft: number;
  arcadeCompleted: boolean;
  plane: { x: number; y: number } | null;
  bullets: Array<{ x: number; y: number; vx: number; vy: number; ttl: number }>;
  destroyedParticles: number;
  lastShotTime: number;
}

export function useGameLogic() {
  const [isMounted, setIsMounted] = useState(false);

  const [gameState, setGameState] = useState<GameState>({
    sand: Array.from({ length: F_H }, () => Array(F_W).fill(0)),
    active: null,
    ghost: null,
    nextPiece: null,
    score: 0,
    level: 1,
    paused: false,
    gameOver: false,
    fastDrop: false,
    scoreFlash: 0,
    combo: 0,
    comboMultiplier: 1,
    flashes: [],
    popups: [],
    clearingAnimations: [],
    // Mini-game arcade properties
    arcadeMode: false,
    arcadeScore: 0,
    arcadeTimeLeft: 0,
    arcadeCompleted: false,
    plane: null,
    bullets: [],
    destroyedParticles: 0,
    lastShotTime: 0,
  });

  // Refs para performance
  const gameLoopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const sandAccRef = useRef<number>(0);
  const dropAccRef = useRef<number>(0);
  const effAccRef = useRef<number>(0);
  const pendingAnimationsRef = useRef<Array<{ x: number; y: number; ttl: number; type: string; color: number }>>([]);
  const frameCountRef = useRef<number>(0);
  const lastSpawnFrameRef = useRef<number>(-1);
  const lastLockFrameRef = useRef<number>(-1);
  const keyPressTimeRef = useRef<{ [key: string]: number }>({});

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper functions
  const rng = () => Math.random();

  const spawnPiece = useCallback(() => {
    if (!isMounted) return null;
    const shape = TETROS[Math.floor(rng() * TETROS.length)].map((c) => [...c]);
    const color = Math.floor(rng() * COLORS.length) + 1;
    const minX = Math.min(...shape.map(([x]) => x));
    const maxX = Math.max(...shape.map(([x]) => x));
    const startX = Math.floor((C_W - (maxX - minX + 1)) / 2) - minX;
    const piece = { shape, x: Math.max(0, startX), y: -2, color };

    if (piece.x < 0 || piece.x >= C_W) {
      piece.x = Math.max(0, Math.min(C_W - 1, piece.x));
    }

    return piece;
  }, [isMounted]);

  // Função para rotacionar peça (90°)
  const rotatePiece = useCallback((shape: number[][]) => {
    return shape.map(([x, y]) => [-y, x]);
  }, []);

  // Função para rotacionar peça 180°
  const rotatePiece180 = useCallback((shape: number[][]) => {
    return shape.map(([x, y]) => [-x, -y]);
  }, []);

  const collidesCoarseWithSand = useCallback(
    (p: { shape: number[][]; x: number; y: number; color: number }, g: number[][], nx: number, ny: number) => {
      if (ny >= C_H || nx < 0 || nx >= C_W) return true;
      if (ny < 0) return false;

      return p.shape.some((coord: number[]) => {
        const [dx, dy] = coord;
        const cx = nx + dx,
          cy = ny + dy;
        if (cx < 0 || cx >= C_W || cy < 0 || cy >= C_H) return true;

        const fx0 = cx * SUB,
          fy0 = cy * SUB;
        for (let fy = fy0; fy < fy0 + SUB && fy < F_H; fy++) {
          for (let fx = fx0; fx < fx0 + SUB && fx < F_W; fx++) {
            if (g[fy] && g[fy][fx] !== 0) return true;
          }
        }
        return false;
      });
    },
    []
  );

  // Função para calcular a posição do ghost (onde a peça vai cair)
  const calculateGhost = useCallback(
    (piece: { shape: number[][]; x: number; y: number; color: number }, sand: number[][]) => {
      let ghostY = piece.y;

      while (!collidesCoarseWithSand(piece, sand, piece.x, ghostY + 1)) {
        ghostY++;
      }

      return {
        shape: piece.shape,
        x: piece.x,
        y: ghostY,
        color: piece.color,
      };
    },
    [collidesCoarseWithSand]
  );

  // Funções para o mini-game arcade
  const checkBulletCollision = useCallback((bullet: { x: number; y: number }, sand: number[][]) => {
    // Converte posição do projétil para coordenadas de pixel
    const centerX = Math.floor(bullet.x * SUB);
    const centerY = Math.floor(bullet.y * SUB);

    // Verifica em uma área 5x5 para cobrir TODAS as lacunas possíveis
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const pixelX = centerX + dx;
        const pixelY = centerY + dy;

        // Verifica se está dentro dos limites
        if (pixelY >= 0 && pixelY < F_H && pixelX >= 0 && pixelX < F_W) {
          if (sand[pixelY][pixelX] !== 0) {
            return {
              fx: pixelX,
              fy: pixelY,
              color: sand[pixelY][pixelX],
            };
          }
        }
      }
    }
    return null;
  }, []);

  const destroyParticlesInRadius = useCallback((sand: number[][], centerX: number, centerY: number, radius: number) => {
    let destroyed = 0;
    const out = sand.map((r) => r.slice());

    // Destruição INDIVIDUAL - apenas a partícula atingida pelo projétil
    if (centerY >= 0 && centerY < F_H && centerX >= 0 && centerX < F_W) {
      if (out[centerY][centerX] !== 0) {
        out[centerY][centerX] = 0;
        destroyed = 1; // Sempre destrói apenas 1 partícula
      }
    }

    return { newSand: out, destroyed };
  }, []);

  const calculateArcadeScore = useCallback((destroyed: number, timeLeft: number) => {
    const baseScore = destroyed * 10;
    const timeBonus = timeLeft * 5;
    return baseScore + timeBonus;
  }, []);

  const stepSandFine = useCallback(
    (g: number[][]) => {
      if (!isMounted) return g;
      const out = g.map((r) => r.slice());
      for (let y = F_H - 2; y >= 0; y--) {
        for (let x = 0; x < F_W; x++) {
          const v = out[y][x];
          if (!v) continue;
          if (out[y + 1][x] === 0) {
            out[y + 1][x] = v;
            out[y][x] = 0;
            continue;
          }
          const dir = rng() < 0.5 ? -1 : 1;
          const tryDirs = [dir, -dir];
          let moved = false;
          for (const d of tryDirs) {
            const nx = x + d;
            if (nx >= 0 && nx < F_W && out[y + 1][nx] === 0) {
              out[y + 1][nx] = v;
              out[y][x] = 0;
              moved = true;
              break;
            }
          }
          if (moved) continue;
          const sid = rng() < 0.5 ? -1 : 1;
          const sx = x + sid;
          if (sx >= 0 && sx < F_W && out[y][sx] === 0 && out[y + 1][sx] === 0) {
            out[y][sx] = v;
            out[y][x] = 0;
          }
        }
      }
      return out;
    },
    [isMounted]
  );

  const settle = useCallback(
    (g: number[][], steps = 4) => {
      let s = g;
      for (let i = 0; i < steps; i++) s = stepSandFine(s);
      return s;
    },
    [stepSandFine]
  );

  const shatterPiece = useCallback(
    (g: number[][], p: { shape: number[][]; x: number; y: number; color: number }, density = 0.95) => {
      if (!isMounted) return { grid: g, gameOver: false };
      const out = g.map((r) => r.slice());
      let gameOver = false;

      for (const [dx, dy] of p.shape) {
        const cx = p.x + dx,
          cy = p.y + dy;
        if (cx < 0 || cx >= C_W || cy < 0 || cy >= C_H) continue;
        const fx0 = cx * SUB,
          fy0 = cy * SUB;

        for (let fy = fy0; fy < fy0 + SUB; fy++) {
          for (let fx = fx0; fx < fx0 + SUB; fx++) {
            const particleDensity = density + (rng() - 0.5) * 0.1;
            if (rng() < particleDensity) {
              out[fy][fx] = p.color;
              if (fy < SUB) {
                gameOver = true;
              }
            }
          }
        }
      }
      return { grid: out, gameOver };
    },
    [isMounted]
  );

  const clearMonochromeFine = useCallback(
    (g: number[][]) => {
      if (!isMounted) return { count: 0, clearedCells: [], newSand: g };
      const out = g.map((r) => r.slice());
      const clearedCells: Array<{ x: number; y: number }> = [];
      let count = 0;
      for (let y = 0; y < F_H; y++) {
        const row = out[y];
        if (row.every((v) => v !== 0)) {
          const c = row[0];
          if (row.every((v) => v === c)) {
            count++;
            for (let x = 0; x < F_W; x++) {
              if (out[y][x] !== 0) {
                clearedCells.push({ x, y });
                pendingAnimationsRef.current.push({ x, y, ttl: 15, type: "line", color: c });
                out[y][x] = 0;
              }
            }
          }
        }
      }
      return { count, clearedCells, newSand: out };
    },
    [isMounted]
  );

  const clearBridgesFine = useCallback(
    (g: number[][]) => {
      if (!isMounted) return { count: 0, clearedCells: [], newSand: g };
      const out = g.map((r) => r.slice());
      const seen = Array.from({ length: F_H }, () => Array(F_W).fill(false));
      const clearedCells: Array<{ x: number; y: number }> = [];
      let count = 0;
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (let y = 0; y < F_H; y++)
        for (let x = 0; x < F_W; x++) {
          const c = g[y][x];
          if (c === 0 || seen[y][x]) continue;
          const stack = [[x, y]];
          seen[y][x] = true;
          const cells = [[x, y]];
          let minX = x,
            maxX = x;
          while (stack.length) {
            const [cx, cy] = stack.pop() as [number, number];
            for (const [dx, dy] of dirs) {
              const nx = cx + dx,
                ny = cy + dy;
              if (nx < 0 || nx >= F_W || ny < 0 || ny >= F_H) continue;
              if (seen[ny][nx]) continue;
              if (g[ny][nx] !== c) continue;
              seen[ny][nx] = true;
              stack.push([nx, ny]);
              cells.push([nx, ny]);
              if (nx < minX) minX = nx;
              if (nx > maxX) maxX = nx;
            }
          }
          if (minX === 0 && maxX === F_W - 1) {
            count++;
            for (const [bx, by] of cells) {
              if (out[by][bx] !== 0) {
                clearedCells.push({ x: bx, y: by });
                pendingAnimationsRef.current.push({ x: bx, y: by, ttl: 20, type: "bridge", color: c });
                out[by][bx] = 0;
              }
            }
          }
        }
      return { count, clearedCells, newSand: out };
    },
    [isMounted]
  );

  const lockAndClear = useCallback(
    (g: number[][], p: { shape: number[][]; x: number; y: number; color: number }) => {
      if (!isMounted) return { grid: g, gain: 0, gameOver: false };
      const shatterResult = shatterPiece(g, p);
      let merged = shatterResult.grid;
      const lineRes = clearMonochromeFine(merged);
      const bridgeRes = clearBridgesFine(lineRes.newSand);
      const total = lineRes.count + bridgeRes.count;
      let gain = 0;
      if (total > 0) {
        gain = (lineRes.count * 100 + bridgeRes.count * 120) * gameState.level;
        merged = bridgeRes.newSand;
        merged = settle(merged, 2);
      }
      return { grid: merged, gain, gameOver: shatterResult.gameOver };
    },
    [gameState.level, shatterPiece, clearMonochromeFine, clearBridgesFine, settle, isMounted]
  );

  // Game loop otimizado
  const gameLoop = useCallback(
    (now: number) => {
      if (!isMounted) return;

      const dt = Math.min(16, now - lastTimeRef.current);
      lastTimeRef.current = now;
      frameCountRef.current++;

      setGameState((prevState) => {
        if (prevState.paused || prevState.gameOver) return prevState;

        const newState = { ...prevState };
        let lockedThisFrame = false;
        sandAccRef.current += dt;
        dropAccRef.current += dt;
        effAccRef.current += dt;

        // Sand physics
        if (sandAccRef.current >= 16) {
          newState.sand = stepSandFine(newState.sand);
          const line = clearMonochromeFine(newState.sand);
          const bridge = clearBridgesFine(line.newSand);
          const total = line.count + bridge.count;
          if (total > 0) {
            newState.combo++;
            newState.comboMultiplier = Math.min(5, 1 + Math.floor(newState.combo / 3));

            const baseGain = (line.count * 200 + bridge.count * 300) * newState.level;
            const comboGain = baseGain * newState.comboMultiplier;
            newState.score += comboGain;
            newState.scoreFlash = 20;

            newState.popups.push({
              x: C_W / 2,
              y: C_H / 2,
              text: `COMBO x${newState.comboMultiplier}!`,
              ttl: 60,
              vy: -0.5,
            });

            newState.level = Math.min(15, 1 + Math.floor(newState.score / 200));
            newState.sand = settle(bridge.newSand, 3);
          } else {
            newState.combo = 0;
            newState.comboMultiplier = 1;
          }
          sandAccRef.current -= 16;
        }

        // Trigger do mini-game arcade - A CADA 1000 PONTOS
        const arcadeThreshold = Math.floor(newState.score / 1000) * 1000;
        const lastThreshold = Math.floor((newState.score - 10) / 1000) * 1000; // Evita trigger múltiplo

        if (newState.score >= 1000 && !newState.arcadeMode && arcadeThreshold > lastThreshold) {
          newState.arcadeMode = true;
          newState.arcadeTimeLeft = 10; // APENAS 10 SEGUNDOS
          newState.plane = { x: C_W / 2, y: 1.0 }; // Posição fluida
          newState.bullets = [];
          newState.destroyedParticles = 0;
          newState.lastShotTime = 0;

          newState.popups.push({
            x: C_W / 2,
            y: C_H / 2,
            text: `ARCADE MODE! (${Math.floor(newState.score / 1000)}º vez)`,
            ttl: 120,
            vy: -0.5,
          });
        }

        // Mini-game arcade logic
        if (newState.arcadeMode) {
          // Atualizar tempo
          newState.arcadeTimeLeft -= dt / 1000;

          // FORÇAR SAÍDA do modo arcade quando tempo <= 0
          if (newState.arcadeTimeLeft <= 0) {
            console.log("🎮 FORÇANDO saída do arcade mode - Time left:", newState.arcadeTimeLeft);

            // Pontuação bônus final (já recebeu +10 por cada partícula)
            const bonusScore = Math.floor(newState.destroyedParticles * 2); // Bônus extra

            // RESET TOTAL E IMEDIATO - FORÇA SAÍDA
            newState.arcadeMode = false;
            newState.plane = null;
            newState.bullets = [];
            newState.arcadeTimeLeft = 0;
            newState.destroyedParticles = 0;
            newState.lastShotTime = 0;
            newState.score += bonusScore;

            console.log(
              "🎮 Arcade COMPLETAMENTE desativado - arcadeMode:",
              newState.arcadeMode,
              "plane:",
              newState.plane,
              "bullets:",
              newState.bullets.length
            );

            // Garante que uma nova peça seja spawnada
            if (!newState.active && !newState.nextPiece) {
              const shape = TETROS[Math.floor(rng() * TETROS.length)].map((c) => [...c]);
              const color = Math.floor(rng() * COLORS.length) + 1;
              newState.nextPiece = { shape, color };
            }

            // Popup de finalização
            newState.popups.push({
              x: C_W / 2,
              y: C_H / 2,
              text: `ARCADE FINALIZADO! +${bonusScore}`,
              ttl: 120,
              vy: -0.5,
            });

            // FORÇA retorno ao Tetris - SAI IMEDIATAMENTE do loop arcade
            return newState;
          }

          // Tiro automático a cada 200ms
          if (newState.plane && frameCountRef.current - newState.lastShotTime > 12) {
            // ~200ms a 60fps
            newState.bullets.push({
              x: newState.plane.x + 0.5,
              y: newState.plane.y + 1,
              vx: 0,
              vy: 1, // Tiro para baixo
              ttl: 60,
            });
            newState.lastShotTime = frameCountRef.current;
          }

          // Atualizar projéteis
          newState.bullets = newState.bullets.filter((bullet) => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.ttl--;

            // Verificar colisão INDIVIDUAL - uma partícula por vez
            const collision = checkBulletCollision(bullet, newState.sand);
            if (collision) {
              // Destrói APENAS a partícula atingida (individual)
              const result = destroyParticlesInRadius(newState.sand, collision.fx, collision.fy, 1);
              newState.sand = result.newSand;
              newState.destroyedParticles += result.destroyed;

              // PONTUAÇÃO IMEDIATA: +10 pontos por partícula destruída
              newState.score += result.destroyed * 10;

              // Efeito de explosão pequeno e preciso
              pendingAnimationsRef.current.push({
                x: collision.fx,
                y: collision.fy,
                ttl: 15, // Duração menor e mais precisa
                type: "explosion",
                color: collision.color,
              });

              return false; // Remove o projétil
            }

            return bullet.ttl > 0;
          });
        }

        // Piece falling (só se não estiver no modo arcade)
        if (!newState.arcadeMode) {
          const base = Math.max(200, 800 - newState.level * 50);
          const dropInt = newState.fastDrop ? 120 : base;
          const maxDrops = newState.fastDrop ? 1 : 1;
          let dropsProcessed = 0;

          // Garante que a peça não desapareça quando muda o modo de queda
          if (newState.active && newState.active.y < 0) {
            newState.active.y = Math.max(0, newState.active.y);
          }

          while (dropAccRef.current >= dropInt && dropsProcessed < maxDrops) {
            if (!newState.active) {
              if (!newState.nextPiece) {
                const shape = TETROS[Math.floor(rng() * TETROS.length)].map((c) => [...c]);
                const color = Math.floor(rng() * COLORS.length) + 1;
                newState.nextPiece = { shape, color };
              }

              const minX = Math.min(...newState.nextPiece.shape.map(([x]) => x));
              const maxX = Math.max(...newState.nextPiece.shape.map(([x]) => x));
              const startX = Math.floor((C_W - (maxX - minX + 1)) / 2) - minX;
              const newPiece = {
                shape: newState.nextPiece.shape,
                x: Math.max(0, startX),
                y: -2,
                color: newState.nextPiece.color,
              };

              // Garante que a peça seja válida
              if (newPiece.x < 0 || newPiece.x >= C_W) {
                newPiece.x = Math.max(0, Math.min(C_W - 1, newPiece.x));
              }

              if (lastSpawnFrameRef.current !== frameCountRef.current) {
                lastSpawnFrameRef.current = frameCountRef.current;
              }

              newState.active = newPiece;

              const nextShape = TETROS[Math.floor(rng() * TETROS.length)].map((c) => [...c]);
              const nextColor = Math.floor(rng() * COLORS.length) + 1;
              newState.nextPiece = { shape: nextShape, color: nextColor };
            }
            if (newState.active && !collidesCoarseWithSand(newState.active, newState.sand, newState.active.x, newState.active.y + 1)) {
              newState.active.y += 1;
            } else if (newState.active) {
              if (lastLockFrameRef.current !== frameCountRef.current) {
                lastLockFrameRef.current = frameCountRef.current;
              }
              const res = lockAndClear(newState.sand, newState.active);
              newState.sand = res.grid;
              if (res.gain > 0) {
                newState.score += res.gain;
                newState.scoreFlash = 15;
                newState.level = Math.min(12, 1 + Math.floor(newState.score / 500));
              }

              if (res.gameOver) {
                newState.gameOver = true;
              } else {
                const stabilizedSand = settle(newState.sand, 3);
                newState.sand = stabilizedSand;
                newState.active = null;
              }
              lockedThisFrame = true;
              dropAccRef.current = 0;
              break;
            }
            dropAccRef.current -= dropInt;
            dropsProcessed++;
          }

          // Lock imediato se encostou
          if (
            !lockedThisFrame &&
            newState.active &&
            collidesCoarseWithSand(newState.active, newState.sand, newState.active.x, newState.active.y + 1)
          ) {
            if (lastLockFrameRef.current !== frameCountRef.current) {
              lastLockFrameRef.current = frameCountRef.current;
            }
            const res = lockAndClear(newState.sand, newState.active);
            newState.sand = res.grid;
            if (res.gain > 0) {
              newState.score += res.gain;
              newState.scoreFlash = 15;
              newState.level = Math.min(12, 1 + Math.floor(newState.score / 500));
            }
            if (res.gameOver) {
              newState.gameOver = true;
            } else {
              const stabilizedSand = settle(newState.sand, 3);
              newState.sand = stabilizedSand;
              newState.active = null;
            }
          }
        }

        // Effects
        if (effAccRef.current >= 16) {
          newState.flashes = newState.flashes.filter((f) => --f.ttl > 0);
          newState.popups = newState.popups.filter((p) => {
            p.ttl -= 1;
            p.y -= p.vy;
            return p.ttl > 0;
          });
          newState.clearingAnimations = newState.clearingAnimations.filter((a) => --a.ttl > 0);

          if (pendingAnimationsRef.current.length > 0) {
            newState.clearingAnimations = [...newState.clearingAnimations, ...pendingAnimationsRef.current];
            pendingAnimationsRef.current = [];
          }

          if (newState.scoreFlash > 0) {
            newState.scoreFlash--;
          }
          effAccRef.current = 0;
        }

        // Calcula o ghost
        if (newState.active) {
          newState.ghost = calculateGhost(newState.active, newState.sand);
        } else {
          newState.ghost = null;
        }

        return newState;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [
      stepSandFine,
      clearMonochromeFine,
      clearBridgesFine,
      settle,
      collidesCoarseWithSand,
      lockAndClear,
      calculateGhost,
      isMounted,
      checkBulletCollision,
      destroyParticlesInRadius,
      calculateArcadeScore,
    ]
  );

  // Game controls
  const reset = useCallback(() => {
    if (!isMounted) return;
    const firstPiece = spawnPiece();
    const firstNextShape = TETROS[Math.floor(rng() * TETROS.length)].map((c) => [...c]);
    const firstNextColor = Math.floor(rng() * COLORS.length) + 1;
    const firstNextPiece = { shape: firstNextShape, color: firstNextColor };

    setGameState({
      sand: Array.from({ length: F_H }, () => Array(F_W).fill(0)),
      active: firstPiece,
      ghost: firstPiece
        ? calculateGhost(
            firstPiece,
            Array.from({ length: F_H }, () => Array(F_W).fill(0))
          )
        : null,
      nextPiece: firstNextPiece,
      score: 0,
      level: 1,
      paused: false,
      gameOver: false,
      fastDrop: false,
      scoreFlash: 0,
      combo: 0,
      comboMultiplier: 1,
      flashes: [],
      popups: [],
      clearingAnimations: [],
      // Mini-game arcade properties
      arcadeMode: false,
      arcadeScore: 0,
      arcadeTimeLeft: 0,
      arcadeCompleted: false,
      plane: null,
      bullets: [],
      destroyedParticles: 0,
      lastShotTime: 0,
    });
    sandAccRef.current = 0;
    dropAccRef.current = 0;
    effAccRef.current = 0;
    frameCountRef.current = 0;
    lastSpawnFrameRef.current = -1;
    lastLockFrameRef.current = -1;
    keyPressTimeRef.current = {};
  }, [spawnPiece, calculateGhost, isMounted]);

  const togglePause = useCallback(() => {
    if (!isMounted) return;
    setGameState((prev) => ({ ...prev, paused: !prev.paused }));
  }, [isMounted]);

  const setFastDrop = useCallback(
    (fast: boolean) => {
      if (!isMounted) return;
      setGameState((prev) => ({ ...prev, fastDrop: fast }));
      // Reset do acumulador quando muda o modo de queda
      dropAccRef.current = 0;
    },
    [isMounted]
  );

  // Master mode para testes
  const activateMasterMode = useCallback(() => {
    if (!isMounted) return;
    setGameState((prev) => ({
      ...prev,
      score: 1000,
      arcadeMode: true,
      arcadeTimeLeft: 10, // 10 SEGUNDOS COMO NO JOGO NORMAL
      plane: { x: C_W / 2, y: 1.0 }, // Posição fluida
      bullets: [],
      destroyedParticles: 0,
      lastShotTime: 0,
    }));
  }, [isMounted]);

  // Keyboard controls otimizados
  useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver || gameState.paused) return;

      const now = Date.now();
      const key = e.key.toLowerCase();

      // Previne spam de teclas (mínimo 50ms entre pressionamentos)
      if (keyPressTimeRef.current[key] && now - keyPressTimeRef.current[key] < 50) {
        return;
      }
      keyPressTimeRef.current[key] = now;

      switch (key) {
        case "p":
          togglePause();
          break;
        case "r":
          reset();
          break;
        case "a":
        case "arrowleft":
          if (gameState.arcadeMode && gameState.plane) {
            setGameState((prev) => ({
              ...prev,
              plane: { ...prev.plane!, x: Math.max(0, prev.plane!.x - 0.15) }, // Movimento SUB-PIXEL RÁPIDO
            }));
          } else if (!gameState.arcadeMode && gameState.active) {
            setGameState((prev) => {
              if (!prev.active) return prev;
              const nx = prev.active.x - 1;
              if (!collidesCoarseWithSand(prev.active, prev.sand, nx, prev.active.y)) {
                return { ...prev, active: { ...prev.active, x: nx } };
              }
              return prev;
            });
          }
          break;
        case "d":
        case "arrowright":
          if (gameState.arcadeMode && gameState.plane) {
            setGameState((prev) => ({
              ...prev,
              plane: { ...prev.plane!, x: Math.min(C_W - 1, prev.plane!.x + 0.15) }, // Movimento SUB-PIXEL RÁPIDO
            }));
          } else if (!gameState.arcadeMode && gameState.active) {
            setGameState((prev) => {
              if (!prev.active) return prev;
              const nx = prev.active.x + 1;
              if (!collidesCoarseWithSand(prev.active, prev.sand, nx, prev.active.y)) {
                return { ...prev, active: { ...prev.active, x: nx } };
              }
              return prev;
            });
          }
          break;
        case "w":
          setGameState((prev) => {
            if (!prev.active) return prev;
            const rotatedShape = rotatePiece(prev.active.shape);
            const rotatedPiece = { ...prev.active, shape: rotatedShape };
            if (!collidesCoarseWithSand(rotatedPiece, prev.sand, rotatedPiece.x, rotatedPiece.y)) {
              return { ...prev, active: rotatedPiece };
            }
            return prev;
          });
          break;
        case "s":
          setGameState((prev) => {
            if (!prev.active) return prev;
            const rotatedShape = rotatePiece180(prev.active.shape);
            const rotatedPiece = { ...prev.active, shape: rotatedShape };
            if (!collidesCoarseWithSand(rotatedPiece, prev.sand, rotatedPiece.x, rotatedPiece.y)) {
              return { ...prev, active: rotatedPiece };
            }
            return prev;
          });
          break;
        case " ":
          e.preventDefault();
          setFastDrop(true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        setFastDrop(false);
        // Previne que a tecla espaço cause scroll da página
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    gameState.gameOver,
    gameState.paused,
    gameState.active,
    togglePause,
    reset,
    collidesCoarseWithSand,
    setFastDrop,
    rotatePiece,
    rotatePiece180,
    isMounted,
    gameState.arcadeMode,
    gameState.plane,
    C_W,
  ]);

  // Start game loop
  useEffect(() => {
    if (!isMounted) return;

    const startGameLoop = () => {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    startGameLoop();
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isMounted, gameLoop]);

  return {
    score: gameState.score,
    level: gameState.level,
    gameOver: gameState.gameOver,
    paused: gameState.paused,
    fastDrop: gameState.fastDrop,
    gameState,
    setGameState,
    reset,
    togglePause,
    setFastDrop,
    activateMasterMode,
  };
}
