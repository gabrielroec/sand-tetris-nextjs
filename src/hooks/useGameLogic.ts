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
  });

  // Contador de peças para debug
  const piecesCountRef = useRef<number>(0);

  const gameLoopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const sandAccRef = useRef<number>(0);
  const dropAccRef = useRef<number>(0);
  const effAccRef = useRef<number>(0);
  const pendingAnimationsRef = useRef<Array<{ x: number; y: number; ttl: number; type: string; color: number }>>([]);
  const frameCountRef = useRef<number>(0);
  const lastSpawnFrameRef = useRef<number>(-1);
  const lastLockFrameRef = useRef<number>(-1);

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
    // Spawna a peça acima da tela para dar tempo de cair
    const piece = { shape, x: Math.max(0, startX), y: -2, color };

    // Garante que a peça seja válida
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
      // Verifica limites da tela primeiro
      if (ny >= C_H || nx < 0 || nx >= C_W) return true;
      if (ny < 0) return false;

      return p.shape.some((coord: number[]) => {
        const [dx, dy] = coord;
        const cx = nx + dx,
          cy = ny + dy;
        if (cx < 0 || cx >= C_W || cy < 0 || cy >= C_H) return true;

        const fx0 = cx * SUB,
          fy0 = cy * SUB;
        // Verifica colisão com a areia
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

      // Simula a queda da peça até encontrar colisão
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

        // Aumenta a densidade e adiciona variação nas partículas
        for (let fy = fy0; fy < fy0 + SUB; fy++) {
          for (let fx = fx0; fx < fx0 + SUB; fx++) {
            // Densidade mais alta com pequena variação
            const particleDensity = density + (rng() - 0.5) * 0.1; // 0.9 a 1.0
            if (rng() < particleDensity) {
              out[fy][fx] = p.color;
              // Verifica se a partícula está no topo da tela (primeira linha)
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
            // Adiciona animação de limpeza para toda a linha
            for (let x = 0; x < F_W; x++) {
              if (out[y][x] !== 0) {
                clearedCells.push({ x, y });
                // Adiciona animação de limpeza ao buffer
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
                // Adiciona animação de limpeza ao buffer
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
        merged = settle(merged, 2); // Reduzido para 2 passos
      }
      return { grid: merged, gain, gameOver: shatterResult.gameOver };
    },
    [gameState.level, shatterPiece, clearMonochromeFine, clearBridgesFine, settle, isMounted]
  );

  // Game loop ultra otimizado
  const gameLoop = useCallback(
    (now: number) => {
      if (!isMounted) return;

      const dt = Math.min(8, now - lastTimeRef.current); // Reduzido para 8ms para checagens mais frequentes
      lastTimeRef.current = now;
      frameCountRef.current++;

      setGameState((prevState) => {
        if (prevState.paused || prevState.gameOver) return prevState;

        const newState = { ...prevState };
        let lockedThisFrame = false;
        sandAccRef.current += dt;
        dropAccRef.current += dt;
        effAccRef.current += dt;

        // Sand physics - MAIS RÁPIDA e responsiva
        if (sandAccRef.current >= 8) {
          // Muito mais rápida para física responsiva
          newState.sand = stepSandFine(newState.sand);
          const line = clearMonochromeFine(newState.sand);
          const bridge = clearBridgesFine(line.newSand);
          const total = line.count + bridge.count;
          if (total > 0) {
            // Sistema de combo - torna o jogo mais empolgante
            newState.combo++;
            newState.comboMultiplier = Math.min(5, 1 + Math.floor(newState.combo / 3)); // Multiplicador até 5x

            const baseGain = (line.count * 200 + bridge.count * 300) * newState.level;
            const comboGain = baseGain * newState.comboMultiplier;
            newState.score += comboGain;
            newState.scoreFlash = 20; // Mais visível

            // Adiciona popup de combo
            newState.popups.push({
              x: C_W / 2,
              y: C_H / 2,
              text: `COMBO x${newState.comboMultiplier}!`,
              ttl: 60,
              vy: -0.5,
            });

            newState.level = Math.min(15, 1 + Math.floor(newState.score / 200)); // Muito mais fácil de subir nível
            newState.sand = settle(bridge.newSand, 3); // Mais estável
          } else {
            // Reset combo se não limpou nada
            newState.combo = 0;
            newState.comboMultiplier = 1;
          }
          sandAccRef.current -= 8;
        }

        // Piece falling - BALANCEADO para ser mais jogável
        const base = Math.max(200, 800 - newState.level * 50); // Muito mais lento e progressivo
        const dropInt = newState.fastDrop ? 80 : base; // Fast drop mais controlável
        const maxDrops = newState.fastDrop ? 3 : 1; // Mais drops por frame para controle
        let dropsProcessed = 0;

        while (dropAccRef.current >= dropInt && dropsProcessed < maxDrops) {
          if (!newState.active) {
            // Se não há próxima peça, gera uma
            if (!newState.nextPiece) {
              const shape = TETROS[Math.floor(rng() * TETROS.length)].map((c) => [...c]);
              const color = Math.floor(rng() * COLORS.length) + 1;
              newState.nextPiece = { shape, color };
            }

            // Usa a próxima peça como peça ativa
            const minX = Math.min(...newState.nextPiece.shape.map(([x]) => x));
            const maxX = Math.max(...newState.nextPiece.shape.map(([x]) => x));
            const startX = Math.floor((C_W - (maxX - minX + 1)) / 2) - minX;
            const newPiece = {
              shape: newState.nextPiece.shape,
              x: Math.max(0, startX),
              y: -2,
              color: newState.nextPiece.color,
            };

            if (lastSpawnFrameRef.current !== frameCountRef.current) {
              piecesCountRef.current++;
              console.log(`🎮 Peça #${piecesCountRef.current} spawnada em (${newPiece.x}, ${newPiece.y})`);
              lastSpawnFrameRef.current = frameCountRef.current;
            }

            newState.active = newPiece;

            // Gera a PRÓXIMA peça imediatamente para o usuário ver
            const nextShape = TETROS[Math.floor(rng() * TETROS.length)].map((c) => [...c]);
            const nextColor = Math.floor(rng() * COLORS.length) + 1;
            newState.nextPiece = { shape: nextShape, color: nextColor };

            // Pontuação por peça colocada - torna o jogo mais recompensador
            newState.score += 10 * newState.level;
          }
          if (newState.active && !collidesCoarseWithSand(newState.active, newState.sand, newState.active.x, newState.active.y + 1)) {
            newState.active.y += 1;
          } else if (newState.active) {
            // Desintegração imediata
            if (lastLockFrameRef.current !== frameCountRef.current) {
              console.log(`💥 Peça #${piecesCountRef.current} colidiu e se desintegrou em (${newState.active.x}, ${newState.active.y})`);
              lastLockFrameRef.current = frameCountRef.current;
            }
            const res = lockAndClear(newState.sand, newState.active);
            newState.sand = res.grid;
            if (res.gain > 0) {
              newState.score += res.gain;
              newState.scoreFlash = 15;
              newState.level = Math.min(12, 1 + Math.floor(newState.score / 500));
            }

            // Verifica game over: se alguma partícula da peça encostou no topo
            if (res.gameOver) {
              console.log(`💀 GAME OVER! Peça #${piecesCountRef.current} causou game over`);
              console.log(`📊 Total de peças jogadas: ${piecesCountRef.current}`);
              console.log(`🎯 Score final: ${newState.score}`);
              newState.gameOver = true;
            } else {
              // Aguarda a areia se estabilizar
              const stabilizedSand = settle(newState.sand, 3);
              newState.sand = stabilizedSand;

              // Limpa a peça atual para spawnar nova no próximo loop
              newState.active = null;
            }
            lockedThisFrame = true;
            dropAccRef.current = 0;
            break;
          }
          dropAccRef.current -= dropInt;
          dropsProcessed++;
        }

        // Lock imediato se encostou e não processamos no loop (evita "peça parada" no topo)
        if (
          !lockedThisFrame &&
          newState.active &&
          collidesCoarseWithSand(newState.active, newState.sand, newState.active.x, newState.active.y + 1)
        ) {
          if (lastLockFrameRef.current !== frameCountRef.current) {
            console.log(`💥 Peça #${piecesCountRef.current} colidiu e se desintegrou em (${newState.active.x}, ${newState.active.y})`);
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
            console.log(`💀 GAME OVER! Peça #${piecesCountRef.current} causou game over`);
            console.log(`📊 Total de peças jogadas: ${piecesCountRef.current}`);
            console.log(`🎯 Score final: ${newState.score}`);
            newState.gameOver = true;
          } else {
            const stabilizedSand = settle(newState.sand, 3);
            newState.sand = stabilizedSand;
            newState.active = null;
          }
        }

        // Effects - ultra otimizado
        if (effAccRef.current >= 8) {
          // Reduzido para 8ms
          newState.flashes = newState.flashes.filter((f) => --f.ttl > 0);
          newState.popups = newState.popups.filter((p) => {
            p.ttl -= 1;
            p.y -= p.vy;
            return p.ttl > 0;
          });
          newState.clearingAnimations = newState.clearingAnimations.filter((a) => --a.ttl > 0);

          // Adiciona animações pendentes
          if (pendingAnimationsRef.current.length > 0) {
            newState.clearingAnimations = [...newState.clearingAnimations, ...pendingAnimationsRef.current];
            pendingAnimationsRef.current = [];
          }

          if (newState.scoreFlash > 0) {
            newState.scoreFlash--;
          }
          effAccRef.current = 0;
        }

        // Calcula o ghost (sombra da peça) se há uma peça ativa
        if (newState.active) {
          newState.ghost = calculateGhost(newState.active, newState.sand);
        } else {
          newState.ghost = null;
        }

        return newState;
      });

      // Game loop sem throttle para máxima responsividade
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [stepSandFine, clearMonochromeFine, clearBridgesFine, settle, collidesCoarseWithSand, lockAndClear, calculateGhost, isMounted]
  );

  // Game controls
  const reset = useCallback(() => {
    if (!isMounted) return;
    console.log(`🔄 JOGO REINICIADO! Contador de peças resetado de ${piecesCountRef.current} para 0`);
    piecesCountRef.current = 0;
    const firstPiece = spawnPiece();
    if (firstPiece) {
      piecesCountRef.current++;
      console.log(`🎮 Peça #${piecesCountRef.current} spawnada em (${firstPiece.x}, ${firstPiece.y})`);
    }
    // Gera a primeira próxima peça
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
    });
    sandAccRef.current = 0;
    dropAccRef.current = 0;
    effAccRef.current = 0;
    frameCountRef.current = 0;
  }, [spawnPiece, calculateGhost, isMounted]);

  const togglePause = useCallback(() => {
    if (!isMounted) return;
    setGameState((prev) => ({ ...prev, paused: !prev.paused }));
  }, [isMounted]);

  const setFastDrop = useCallback(
    (fast: boolean) => {
      if (!isMounted) return;
      setGameState((prev) => ({ ...prev, fastDrop: fast }));
      if (fast) dropAccRef.current = 0;
    },
    [isMounted]
  );

  // Keyboard controls otimizados
  useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver || gameState.paused || !gameState.active) return;

      switch (e.key.toLowerCase()) {
        case "p":
          togglePause();
          break;
        case "r":
          reset();
          break;
        case "a":
          setGameState((prev) => {
            if (!prev.active) return prev;
            const nx = prev.active.x - 1;
            if (!collidesCoarseWithSand(prev.active, prev.sand, nx, prev.active.y)) {
              return { ...prev, active: { ...prev.active, x: nx } };
            }
            return prev;
          });
          break;
        case "d":
          setGameState((prev) => {
            if (!prev.active) return prev;
            const nx = prev.active.x + 1;
            if (!collidesCoarseWithSand(prev.active, prev.sand, nx, prev.active.y)) {
              return { ...prev, active: { ...prev.active, x: nx } };
            }
            return prev;
          });
          break;
        case "w":
          // Rotação 90° (sentido horário)
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
          // Rotação 180°
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
      if (e.code === "Space") {
        setFastDrop(false);
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
    reset,
    togglePause,
    setFastDrop,
  };
}
