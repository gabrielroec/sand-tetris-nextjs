"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGameLogic } from "@/hooks/useGameLogic";

interface GameCanvasProps {
  onScoreChange: (score: number) => void;
  onLevelChange: (level: number) => void;
  onGameOver: () => void;
}

const C_W = 10,
  C_H = 22,
  CELL = 28;
const SUB = 4,
  F_W = C_W * SUB,
  F_H = C_H * SUB;
const COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];

export function GameCanvas({ onScoreChange, onLevelChange, onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState } = useGameLogic();
  const [isMounted, setIsMounted] = useState(false);
  const animationRef = useRef<number>();
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

    // Render sand - otimizado
    for (let fy = 0; fy < F_H; fy++) {
      const row = gameState.sand[fy];
      for (let fx = 0; fx < F_W; fx++) {
        const v = row[fx];
        if (!v) continue;
        ctx.fillStyle = COLORS[v - 1];
        const cx = Math.floor(fx / SUB) * CELL + (fx % SUB) * px;
        const cy = Math.floor(fy / SUB) * CELL + (fy % SUB) * px;
        ctx.fillRect(cx, cy, px, px);
      }
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

    // Render clearing animations - otimizado
    if (gameState.clearingAnimations.length > 0) {
      for (const anim of gameState.clearingAnimations) {
        const cx = Math.floor(anim.x / SUB) * CELL + (anim.x % SUB) * (CELL / SUB);
        const cy = Math.floor(anim.y / SUB) * CELL + (anim.y % SUB) * (CELL / SUB);
        const progress = 1 - anim.ttl / (anim.type === "line" ? 15 : 20); // Reduzido

        if (anim.type === "line") {
          const alpha = progress;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(cx, cy, CELL / SUB, CELL / SUB);

          ctx.globalAlpha = alpha * 0.2; // Menos intenso
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(cx - 1, cy - 1, CELL / SUB + 2, CELL / SUB + 2);
        } else if (anim.type === "bridge") {
          const alpha = progress;
          const scale = 1 + progress * 0.15; // Menos escala
          ctx.globalAlpha = alpha;
          ctx.fillStyle = "#ffffff";

          const size = (CELL / SUB) * scale;
          const offset = (size - CELL / SUB) / 2;
          ctx.fillRect(cx - offset, cy - offset, size, size);

          ctx.globalAlpha = alpha * 0.3; // Menos intenso
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(cx - 2, cy - 2, CELL / SUB + 4, CELL / SUB + 4);
        }
      }
      ctx.globalAlpha = 1;
    }

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
