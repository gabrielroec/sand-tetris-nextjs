"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRoguelikeSystem } from "./useRoguelikeSystem";
import { ExplosionContext } from "../types/roguelike";

// ===============================================
// ROGUELIKE MODIFIERS - MODIFICADORES DO JOGO
// ===============================================
type RogueMods = {
  speedMul: number;        // >1 = mais rápido
  gravityMul: number;      // >1 = mais gravidade
  bridgeBonus?: number;    // tolerância extra p/ pontes
  colorMerge?: boolean;    // habilita fusão de cores, etc.
  oneShots?: { 
    clearBottom?: number;  // limpar linhas do fundo
    megaExplosion?: boolean; // explosão gigante
    megaClear?: boolean;   // contaminação de cores
  };
};

// Game constants
const C_W = 10,
  C_H = 22,
  CELL = 28;
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
  score: number;
  level: number;
  paused: boolean;
  gameOver: boolean;
  fastDrop: boolean;
  scoreFlash: number;
  flashes: Array<{ x: number; y: number; ttl: number }>;
  popups: Array<{ x: number; y: number; text: string; ttl: number; vy: number }>;
  clearingAnimations: Array<{ x: number; y: number; ttl: number; type: string; color: number }>;
}

export function useGameLogic() {
  const [isMounted, setIsMounted] = useState(false);

  const [gameState, setGameState] = useState<GameState>({
    sand: Array.from({ length: F_H }, () => Array(F_W).fill(0)),
    active: null,
    score: 0,
    level: 1,
    paused: false,
    gameOver: false,
    fastDrop: false,
    scoreFlash: 0,
    flashes: [],
    popups: [],
    clearingAnimations: [],
  });

  // Sistema Roguelike
  const roguelikeSystem = useRoguelikeSystem({
    currentScore: gameState.score,
    onScoreBonus: (bonus) => {
      setGameState((prev) => ({
        ...prev,
        score: prev.score + bonus,
        scoreFlash: 5,
      }));
    },
    onSpecialEffect: (effects) => {
      // Adiciona popups dos efeitos especiais
      const newPopups = effects.map((effect, index) => ({
        x: (C_W * CELL) / 2,
        y: (C_H * CELL) / 3 + index * 30,
        text: effect,
        ttl: 60,
        vy: -1,
      }));

      setGameState((prev) => ({
        ...prev,
        popups: [...prev.popups, ...newPopups],
      }));
    },
    onGamePause: (paused) => {
      setGameState((prev) => ({
        ...prev,
        paused: paused,
      }));
    },
  });

  // Contador de peças para debug
  const piecesCountRef = useRef<number>(0);

  // ===============================================
  // ROGUELIKE MODIFIERS - COMPUTAÇÃO DOS EFEITOS
  // ===============================================
  const computeRoguelikeModifiers = useCallback((): RogueMods => {
    const activeCards = roguelikeSystem.roguelikeState.activeCards;
    console.log(`🎴 Computando modificadores para ${activeCards.length} cartas ativas:`, activeCards.map(c => c.name));

    let mods: RogueMods = {
      speedMul: 1,
      gravityMul: 1,
      oneShots: {}
    };

    // Aplica modificadores baseados nas cartas ativas
    activeCards.forEach(card => {
      switch (card.type) {
        case "MEGA_EXPLOSION":
          mods.oneShots!.megaExplosion = true;
          console.log(`🎴 Mega Explosão ativada - explosões gigantes habilitadas`);
          break;
        case "MEGA_CLEAR":
          mods.oneShots!.megaClear = true;
          console.log(`🎴 Mega Clear ativado - contaminação de cores habilitada`);
          break;
      }
    });

    console.log(`🎴 Modificadores finais:`, mods);
    return mods;
  }, [roguelikeSystem.roguelikeState.activeCards]);

  // Computa modificadores atuais
  const roguelikeMods = useMemo(() => computeRoguelikeModifiers(), [computeRoguelikeModifiers]);

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

    piecesCountRef.current++;
    const pieceNumber = piecesCountRef.current;
    console.log(`🎮 Peça #${pieceNumber} spawnada em (3, -2)`);

    const shape = TETROS[Math.floor(rng() * TETROS.length)];
    const color = Math.floor(rng() * COLORS.length) + 1;

    return {
      shape,
      x: 3,
      y: -2,
      color,
    };
  }, [isMounted]);

  const collidesCoarseWithSand = useCallback(
    (g: number[][], p: { shape: number[][]; x: number; y: number }) => {
      if (!isMounted) return false;

      for (const [dx, dy] of p.shape) {
        const x = p.x + dx;
        const y = p.y + dy;

        if (x < 0 || x >= C_W || y >= C_H) return true;
        if (y < 0) continue;

        const fineX = x * SUB;
        const fineY = y * SUB;

        for (let subX = 0; subX < SUB; subX++) {
          for (let subY = 0; subY < SUB; subY++) {
            if (g[fineY + subY] && g[fineY + subY][fineX + subX] > 0) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [isMounted]
  );

  const shatterPiece = useCallback(
    (g: number[][], p: { shape: number[][]; x: number; y: number; color: number }) => {
      if (!isMounted) return { grid: g, gameOver: false };

      const out = g.map((r) => r.slice());
      let gameOver = false;

      for (const [dx, dy] of p.shape) {
        const x = p.x + dx;
        const y = p.y + dy;

        if (x < 0 || x >= C_W || y < 0 || y >= C_H) continue;

        const fineX = x * SUB;
        const fineY = y * SUB;

        for (let subX = 0; subX < SUB; subX++) {
          for (let subY = 0; subY < SUB; subY++) {
            const finalX = fineX + subX;
            const finalY = fineY + subY;

            if (finalX >= 0 && finalX < F_W && finalY >= 0 && finalY < F_H) {
              out[finalY][finalX] = p.color;
            }
          }
        }

        // Verifica game over
        if (y < 0) {
          gameOver = true;
        }
      }

      if (gameOver) {
        console.log(`💀 GAME OVER! Peça #${piecesCountRef.current} causou game over`);
        console.log(`📊 Total de peças jogadas: ${piecesCountRef.current}`);
        console.log(`🎯 Score final: ${gameState.score}`);
      }

      return { grid: out, gameOver };
    },
    [isMounted, gameState.score]
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
            console.log(`🎯 LINHA COMPLETA DETECTADA! Linha ${y} com cor ${c} - Power-ups serão ativados!`);
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
      if (count > 0) {
        console.log(`🎯 TOTAL: ${count} linha(s) limpa(s) - Power-ups ativos: ${roguelikeSystem.hasActivePowerUps}`);
      }
      return { count, clearedCells, newSand: out };
    },
    [isMounted, roguelikeSystem.hasActivePowerUps]
  );

  const clearBridgesFine = useCallback(
    (g: number[][]) => {
      if (!isMounted) return { count: 0, clearedCells: [], newSand: g };
      const out = g.map((r) => r.slice());
      const clearedCells: Array<{ x: number; y: number }> = [];
      let count = 0;

      for (let y = 0; y < F_H - 1; y++) {
        for (let x = 0; x < F_W - 1; x++) {
          const tl = out[y][x];
          const tr = out[y][x + 1];
          const bl = out[y + 1][x];
          const br = out[y + 1][x + 1];

          if (tl > 0 && tr > 0 && bl > 0 && br > 0 && tl === tr && bl === br && tl !== bl) {
            count++;
            clearedCells.push({ x, y }, { x: x + 1, y }, { x, y: y + 1 }, { x: x + 1, y: y + 1 });
            pendingAnimationsRef.current.push(
              { x, y, ttl: 15, type: "bridge", color: tl },
              { x: x + 1, y, ttl: 15, type: "bridge", color: tr },
              { x, y: y + 1, ttl: 15, type: "bridge", color: bl },
              { x: x + 1, y: y + 1, ttl: 15, type: "bridge", color: br }
            );
            out[y][x] = 0;
            out[y][x + 1] = 0;
            out[y + 1][x] = 0;
            out[y + 1][x + 1] = 0;
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

        // 🎴 APLICA EFEITOS ROGUELIKE BASEADOS NOS MODIFICADORES
        if (roguelikeSystem.hasActivePowerUps) {
          console.log(`🎴 APLICANDO EFEITOS ROGUELIKE! Modificadores:`, roguelikeMods);

          // Aplica efeitos baseados nos modificadores ativos
          if (roguelikeMods.oneShots?.megaExplosion) {
            console.log(`💥 MEGA EXPLOSÃO ATIVADA! Destruindo 1000 bolinhas aleatórias...`);
            
            // Destrói 1000 bolinhas aleatórias
            for (let i = 0; i < 1000; i++) {
              const randomX = Math.floor(Math.random() * F_W);
              const randomY = Math.floor(Math.random() * F_H);
              
              if (merged[randomY] && merged[randomY][randomX] > 0) {
                merged[randomY][randomX] = 0;
              }
            }
            
            // Adiciona bonus de score
            gain += gain * 2; // 300% bonus
            console.log(`💥 Mega Explosão: 1000 bolinhas destruídas! +${gain} pontos`);
          }

          if (roguelikeMods.oneShots?.megaClear) {
            console.log(`🌟 MEGA CLEAR ATIVADO! Contaminando 2000 bolinhas abaixo...`);
            
            // Encontra a linha mais baixa que foi limpa
            const clearedLines = lineRes.clearedCells.map((cell) => Math.floor(cell.y / SUB));
            const lowestClearedLine = Math.max(...clearedLines);
            
            console.log(`🌟 Linha mais baixa limpa: ${lowestClearedLine}`);
            
            // Contamina 2000 bolinhas abaixo da faixa com a mesma cor
            const contaminationCount = 2000;
            let contaminated = 0;
            
            for (let attempts = 0; attempts < contaminationCount * 3 && contaminated < contaminationCount; attempts++) {
              const randomX = Math.floor(Math.random() * C_W);
              const randomY = Math.min(
                C_H - 1,
                lowestClearedLine + 1 + Math.floor(Math.random() * (C_H - lowestClearedLine - 1))
              );
              
              if (randomY > lowestClearedLine) {
                // Converte para coordenadas fine e contamina
                const fineX = randomX * SUB;
                const fineY = randomY * SUB;
                
                for (let subX = 0; subX < SUB; subX++) {
                  for (let subY = 0; subY < SUB; subY++) {
                    const finalX = fineX + subX;
                    const finalY = fineY + subY;
                    
                    if (finalX >= 0 && finalX < F_W && finalY >= 0 && finalY < F_H && merged[finalY][finalX] > 0) {
                      merged[finalY][finalX] = p.color; // MESMA cor da peça
                      contaminated++;
                    }
                  }
                }
              }
            }
            
            // Adiciona bonus de score
            gain += gain * 4; // 500% bonus
            console.log(`🌟 Mega Clear: ${contaminated} bolinhas contaminadas! +${gain} pontos`);
          }

          // Re-processa limpezas após efeitos
          const postEffectLines = clearMonochromeFine(merged);
          const postEffectBridges = clearBridgesFine(postEffectLines.newSand);
          const additionalTotal = postEffectLines.count + postEffectBridges.count;

          if (additionalTotal > 0) {
            gain += (postEffectLines.count * 100 + postEffectBridges.count * 120) * gameState.level;
            merged = postEffectBridges.newSand;
            console.log(`🎴 Efeitos Roguelike geraram ${additionalTotal} limpezas adicionais!`);
          }
        } else {
          console.log(`🎴 NENHUM POWER-UP ATIVO - Power-ups disponíveis: ${roguelikeSystem.roguelikeState.activeCards.length}`);
        }

        merged = settle(merged, 2); // Reduzido para 2 passos
      }

      return { grid: merged, gain, gameOver: shatterResult.gameOver };
    },
    [isMounted, roguelikeSystem, roguelikeMods, gameState.level, clearMonochromeFine, clearBridgesFine, shatterPiece]
  );

  const settle = useCallback(
    (g: number[][], steps: number) => {
      if (!isMounted) return g;
      let out = g.map((r) => r.slice());

      for (let step = 0; step < steps; step++) {
        const newOut = out.map((r) => r.slice());

        for (let y = F_H - 2; y >= 0; y--) {
          for (let x = 0; x < F_W; x++) {
            if (out[y][x] > 0 && out[y + 1][x] === 0) {
              newOut[y + 1][x] = out[y][x];
              newOut[y][x] = 0;
            }
          }
        }

        out = newOut;
      }

      return out;
    },
    [isMounted]
  );

  // Game loop
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!isMounted || gameState.paused || gameState.gameOver) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const dt = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Aplica modificadores de velocidade do Roguelike
      const speedMultiplier = roguelikeMods.speedMul;
      const gravityMultiplier = roguelikeMods.gravityMul;

      setGameState((prev) => {
        let newState = { ...prev };

        // Sand physics
        sandAccRef.current += dt * speedMultiplier;
        if (sandAccRef.current > 16) {
          sandAccRef.current = 0;
          newState.sand = settle(newState.sand, 1);
        }

        // Piece dropping
        dropAccRef.current += dt * gravityMultiplier;
        if (dropAccRef.current > 500) {
          dropAccRef.current = 0;

          if (newState.active) {
            const newY = newState.active.y + 1;
            if (collidesCoarseWithSand(newState.sand, { ...newState.active, y: newY })) {
              const lockResult = lockAndClear(newState.sand, newState.active);
              newState.sand = lockResult.grid;
              newState.score += lockResult.gain;
              newState.level = Math.floor(newState.score / 1000) + 1;
              newState.active = null;
              newState.gameOver = lockResult.gameOver;
            } else {
              newState.active = { ...newState.active, y: newY };
            }
          } else {
            newState.active = spawnPiece();
          }
        }

        // Effects
        effAccRef.current += dt;
        if (effAccRef.current > 16) {
          effAccRef.current = 0;

          // Update flashes
          newState.flashes = newState.flashes
            .map((f) => ({ ...f, ttl: f.ttl - 1 }))
            .filter((f) => f.ttl > 0);

          // Update popups
          newState.popups = newState.popups
            .map((p) => ({ ...p, y: p.y + p.vy, ttl: p.ttl - 1 }))
            .filter((p) => p.ttl > 0);

          // Update clearing animations
          newState.clearingAnimations = newState.clearingAnimations
            .map((a) => ({ ...a, ttl: a.ttl - 1 }))
            .filter((a) => a.ttl > 0);

          // Add pending animations
          if (pendingAnimationsRef.current.length > 0) {
            newState.clearingAnimations = [
              ...newState.clearingAnimations,
              ...pendingAnimationsRef.current,
            ];
            pendingAnimationsRef.current = [];
          }

          // Update score flash
          if (newState.scoreFlash > 0) {
            newState.scoreFlash--;
          }
        }

        return newState;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [isMounted, gameState.paused, gameState.gameOver, roguelikeMods, settle, collidesCoarseWithSand, lockAndClear, spawnPiece]
  );

  // Start game loop
  useEffect(() => {
    if (isMounted) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isMounted, gameLoop]);

  // Controls
  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!isMounted || gameState.paused || gameState.gameOver || !gameState.active) return;

      setGameState((prev) => {
        if (!prev.active) return prev;

        const newX = prev.active.x + dx;
        const newY = prev.active.y + dy;

        if (!collidesCoarseWithSand(prev.sand, { ...prev.active, x: newX, y: newY })) {
          return {
            ...prev,
            active: { ...prev.active, x: newX, y: newY },
          };
        }

        return prev;
      });
    },
    [isMounted, gameState.paused, gameState.gameOver, gameState.active, collidesCoarseWithSand]
  );

  const rotatePiece = useCallback(() => {
    if (!isMounted || gameState.paused || gameState.gameOver || !gameState.active) return;

    setGameState((prev) => {
      if (!prev.active) return prev;

      const rotated = prev.active.shape.map(([x, y]) => [-y, x]);
      const rotatedPiece = { ...prev.active, shape: rotated };

      if (!collidesCoarseWithSand(prev.sand, rotatedPiece)) {
        return {
          ...prev,
          active: rotatedPiece,
        };
      }

      return prev;
    });
  }, [isMounted, gameState.paused, gameState.gameOver, gameState.active, collidesCoarseWithSand]);

  const fastDrop = useCallback(() => {
    if (!isMounted || gameState.paused || gameState.gameOver || !gameState.active) return;

    setGameState((prev) => {
      if (!prev.active) return prev;

      let newY = prev.active.y;
      while (!collidesCoarseWithSand(prev.sand, { ...prev.active, y: newY + 1 })) {
        newY++;
      }

      const lockResult = lockAndClear(prev.sand, { ...prev.active, y: newY });
      return {
        ...prev,
        sand: lockResult.grid,
        score: prev.score + lockResult.gain,
        level: Math.floor((prev.score + lockResult.gain) / 1000) + 1,
        active: null,
        gameOver: lockResult.gameOver,
        fastDrop: true,
      };
    });
  }, [isMounted, gameState.paused, gameState.gameOver, gameState.active, collidesCoarseWithSand, lockAndClear]);

  const reset = useCallback(() => {
    if (!isMounted) return;

    console.log(`🔄 JOGO REINICIADO! Contador de peças resetado de ${piecesCountRef.current} para 0`);
    piecesCountRef.current = 0;

    setGameState({
      sand: Array.from({ length: F_H }, () => Array(F_W).fill(0)),
      active: null,
      score: 0,
      level: 1,
      paused: false,
      gameOver: false,
      fastDrop: false,
      scoreFlash: 0,
      flashes: [],
      popups: [],
      clearingAnimations: [],
    });

    // Reset Roguelike system
    roguelikeSystem.resetRoguelikeSystem();
  }, [isMounted, roguelikeSystem]);

  return {
    gameState,
    movePiece,
    rotatePiece,
    fastDrop,
    reset,
    roguelikeSystem,
  };
}
