"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GameState } from "@/hooks/useGameLogic";

interface GameCanvasProps {
  gameState: GameState;
}

const C_W = 12,
  C_H = 22,
  CELL = 28;
const SUB = 4,
  F_W = C_W * SUB,
  F_H = C_H * SUB;
const COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];

export function GameCanvas({ gameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const animationRef = useRef<number>(0);
  const lastRenderTime = useRef<number>(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isMounted) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    if (now - lastRenderTime.current < 16) return; // ~60 FPS
    lastRenderTime.current = now;

    const w = canvas.width,
      h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const px = CELL / SUB;

    // Render sand - otimizado com partículas redondas
    for (let fy = 0; fy < F_H; fy++) {
      const row = gameState.sand[fy];
      for (let fx = 0; fx < F_W; fx++) {
        const v = row[fx];
        if (!v) continue;
        ctx.fillStyle = COLORS[v - 1];
        const cx = Math.floor(fx / SUB) * CELL + (fx % SUB) * px;
        const cy = Math.floor(fy / SUB) * CELL + (fy % SUB) * px;

        // Renderiza partículas redondas
        ctx.beginPath();
        ctx.arc(cx + px / 2, cy + px / 2, px / 2 - 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render ghost piece (sombra) - otimizado
    if (gameState.ghost) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = COLORS[gameState.ghost.color - 1];
      for (const [dx, dy] of gameState.ghost.shape) {
        const x = (gameState.ghost.x + dx) * CELL;
        const y = (gameState.ghost.y + dy) * CELL;
        ctx.fillRect(x, y, CELL, CELL);
      }
      ctx.globalAlpha = 1;
    }

    // Render active piece - otimizado
    if (gameState.active) {
      ctx.fillStyle = COLORS[gameState.active.color - 1];
      for (const [dx, dy] of gameState.active.shape) {
        const x = (gameState.active.x + dx) * CELL;
        const y = (gameState.active.y + dy) * CELL;
        ctx.fillRect(x, y, CELL, CELL);

        // Fast drop effect - otimizado
        if (gameState.fastDrop) {
          const time = performance.now() * 0.02; // Mais rápido
          const pulse = Math.sin(time) * 0.3 + 0.7; // Menos intenso

          ctx.globalAlpha = pulse;
          ctx.strokeStyle = "#00ffff";
          ctx.lineWidth = 2; // Mais fino
          ctx.strokeRect(x - 1, y - 1, CELL + 2, CELL + 2);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Render arcade mode elements - VERIFICAÇÃO DUPLA
    if (gameState.arcadeMode === true && gameState.plane !== null && gameState.arcadeTimeLeft > 0) {
      console.log(
        "🎮 Renderizando avião - arcadeMode:",
        gameState.arcadeMode,
        "plane:",
        gameState.plane,
        "timeLeft:",
        gameState.arcadeTimeLeft
      );
      // Render avião
      ctx.fillStyle = "#ff6b6b";
      ctx.fillRect(gameState.plane.x * CELL, gameState.plane.y * CELL, CELL, CELL);

      // Detalhes do avião
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(gameState.plane.x * CELL + 2, gameState.plane.y * CELL + 2, CELL - 4, CELL - 4);
    }

    // Render projéteis - VERIFICAÇÃO DUPLA
    if (gameState.arcadeMode === true && gameState.bullets.length > 0 && gameState.arcadeTimeLeft > 0) {
      ctx.fillStyle = "#ffff00";
      gameState.bullets.forEach((bullet) => {
        ctx.beginPath();
        ctx.arc(bullet.x * CELL, bullet.y * CELL, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Render grid - otimizado
    ctx.globalAlpha = 0.06; // Menos intenso
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    for (let x = 0; x <= C_W; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, h);
      ctx.stroke();
    }
    for (let y = 0; y <= C_H; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(w, y * CELL);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Render flashes - otimizado
    if (gameState.flashes.length > 0) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#fff";
      for (const f of gameState.flashes) {
        const cx = Math.floor(f.x / SUB) * CELL + (f.x % SUB) * (CELL / SUB);
        const cy = Math.floor(f.y / SUB) * CELL + (f.y % SUB) * (CELL / SUB);
        ctx.fillRect(cx, cy, CELL / SUB, CELL / SUB);
      }
      ctx.globalAlpha = 1;
    }

    // Render clearing animations
    gameState.clearingAnimations.forEach((anim) => {
      const alpha = anim.ttl / 20;
      ctx.globalAlpha = alpha;

      if (anim.type === "line") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(anim.x * px, anim.y * px, px, px);
      } else if (anim.type === "bridge") {
        ctx.fillStyle = "#00ffff";
        ctx.fillRect(anim.x * px, anim.y * px, px, px);
      } else if (anim.type === "explosion") {
        // Efeito de explosão pequeno e controlado
        const radius = Math.max(1, Math.min(8, (15 - anim.ttl) * 0.8)); // Máximo 8 pixels
        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.arc(anim.x * px + px / 2, anim.y * px + px / 2, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    });

    // Render popups - otimizado
    if (gameState.popups.length > 0) {
      ctx.font = "bold 14px monospace"; // Menor fonte
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#00ffea";
      for (const p of gameState.popups) {
        const a = Math.max(0, Math.min(1, p.ttl / 15)); // Reduzido
        ctx.globalAlpha = a;
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.globalAlpha = 1;
    }
  }, [gameState, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const animate = () => {
      render();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render, isMounted]);

  return <canvas ref={canvasRef} width={C_W * CELL} height={C_H * CELL} aria-label="Sand Tetris" />;
}
