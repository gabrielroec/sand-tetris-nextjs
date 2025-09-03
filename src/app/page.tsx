"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trophy } from "lucide-react";
import { GameCanvas } from "@/components/GameCanvas";
import { MobileControls } from "@/components/MobileControls";
import { MobileScorePanel } from "@/components/MobileScorePanel";
import { useGameLogic, GameState } from "@/hooks/useGameLogic";

// Game constants
const C_W = 12;

export default function Home() {
  const { score, level, gameOver, paused, fastDrop, reset, togglePause, gameState, setGameState } = useGameLogic();

  return (
    <>
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "14px" }}>
        <h1>Sand Tetris – HTML5 🎮</h1>
        <div className="muted">Arcade • Online • RPG vibes</div>
      </header>

      {/* Main Game Container */}
      <div className="wrap">
        {/* Game Stage */}
        <div className="stage panel">
          <div className="marquee">ONLINE ARCADE</div>
          <GameCanvas gameState={gameState} />
          <div className="grid-hint muted">
            <div>A/D: Move</div>
            <div>W: Rotate 90°</div>
            <div>S: Rotate 180°</div>
            <div>Space: Fast Drop</div>
            <div>P/R: Pause/Restart</div>
          </div>
        </div>

        {/* Score Panel */}
        <aside className="panel" style={{ minWidth: "260px" }}>
          <div className="label">Score</div>
          <div id="score" className={`big ${gameState.scoreFlash > 0 ? "flash" : ""}`}>
            {score}
          </div>
          <div className="label" style={{ marginTop: "12px" }}>
            Level
          </div>
          <div
            id="level"
            style={{ fontSize: "26px", fontWeight: "800", color: "#7dd3fc", textShadow: "0 0 16px rgba(125, 211, 252, 0.25)" }}
          >
            {level}
          </div>

          {/* Combo Display */}
          {gameState.combo > 0 && (
            <div style={{ marginTop: "12px" }}>
              <div className="label">Combo</div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#ff6b6b",
                  textShadow: "0 0 16px rgba(255, 107, 107, 0.5)",
                  textAlign: "center",
                }}
              >
                x{gameState.comboMultiplier} ({gameState.combo})
              </div>
            </div>
          )}

          {/* Next Piece */}
          {gameState.nextPiece && (
            <div style={{ marginTop: "16px" }}>
              <div className="label">Próxima</div>
              <div
                style={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  padding: "12px",
                  textAlign: "center",
                  marginTop: "8px",
                }}
              >
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ margin: "0 auto" }}>
                  {gameState.nextPiece.shape.map(([dx, dy], index) => {
                    // Calcula o centro da peça para centralizar melhor
                    const minX = Math.min(...gameState.nextPiece!.shape.map(([x]) => x));
                    const maxX = Math.max(...gameState.nextPiece!.shape.map(([x]) => x));
                    const minY = Math.min(...gameState.nextPiece!.shape.map(([, y]) => y));
                    const maxY = Math.max(...gameState.nextPiece!.shape.map(([, y]) => y));

                    const centerX = (4 - (maxX - minX + 1)) / 2 - minX;
                    const centerY = (4 - (maxY - minY + 1)) / 2 - minY;

                    const x = (centerX + dx) * 20;
                    const y = (centerY + dy) * 20;
                    const colors = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];
                    return (
                      <rect
                        key={index}
                        x={x}
                        y={y}
                        width="20"
                        height="20"
                        fill={colors[gameState.nextPiece!.color - 1]}
                        stroke="#374151"
                        strokeWidth="1"
                        rx="2"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* Arcade Mode Interface */}
          {gameState.arcadeMode && (
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #dc2626, #991b1b)",
                  border: "2px solid #ef4444",
                  borderRadius: "8px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div style={{ color: "#fecaca", fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>🎮 ARCADE MODE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
                  <div style={{ color: "#fbbf24" }}>⏱️ {Math.ceil(gameState.arcadeTimeLeft)}s</div>
                  <div style={{ color: "#34d399" }}>💥 {gameState.destroyedParticles}</div>
                </div>
                <div style={{ color: "#9ca3af", fontSize: "10px", marginTop: "6px" }}>Use A/D para mover, tiro automático!</div>
              </div>
            </div>
          )}

          <hr style={{ border: "none", borderTop: "1px solid #ffffff22", margin: "14px 0" }} />

          {/* Fast Drop Indicator */}
          <div
            id="fast-drop-indicator"
            style={{
              display: fastDrop ? "block" : "none",
              background: "#00ff0044",
              border: "1px solid #00ff0066",
              borderRadius: "8px",
              padding: "8px",
              marginBottom: "8px",
              textAlign: "center",
              fontSize: "12px",
              color: "#00ff00",
              fontWeight: "700",
            }}
          >
            ⚡ QUEDA RÁPIDA ATIVA
          </div>

          <button id="btn-pause" className="btn" onClick={togglePause}>
            {paused ? "Resume (P)" : "Pause (P)"}
          </button>
          <button id="btn-restart" className="btn" style={{ marginTop: "8px", background: "#f59e0b66" }} onClick={reset}>
            Restart (R)
          </button>

          {/* Master Mode Button */}
          {/* <button
            className="btn"
            style={{
              marginTop: "8px",
              background: "#dc262666",
              borderColor: "#ef4444",
              fontSize: "12px",
            }}
            onClick={activateMasterMode}
          >
            🎮 MASTER MODE
          </button> */}

          <p className="muted" style={{ marginTop: "10px" }}>
            Linhas monocromáticas e pontes limpam na hora.
          </p>
        </aside>
      </div>

      {/* Footer */}
      <footer className="muted" style={{ marginTop: "14px", textAlign: "center" }}>
        Dica: mantenha cores agrupadas para limpar faixas inteiras ✨
      </footer>

      {/* Game Over Overlay - apenas quando realmente não há espaço */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overlay"
            style={{ position: "fixed", zIndex: 50 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="panel"
              style={{ textAlign: "center", maxWidth: "400px", margin: "0 16px" }}
            >
              <Trophy style={{ width: "64px", height: "64px", color: "#ffd166", margin: "0 auto 16px" }} />
              <h2 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "16px" }}>Game Over!</h2>
              <p style={{ marginBottom: "24px", fontSize: "18px" }}>
                Score Final: <span style={{ color: "#ffd166", fontWeight: "bold" }}>{score}</span>
              </p>
              <button
                onClick={reset}
                className="btn"
                style={{
                  background: "#a78bfa66",
                  color: "#f8fbff",
                  fontSize: "16px",
                  padding: "12px 24px",
                }}
              >
                <RotateCcw style={{ width: "20px", height: "20px", marginRight: "8px", display: "inline" }} />
                Jogar Novamente
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles Mobile */}
      <MobileControls
        onMoveLeft={() => {
          if (!gameOver && !paused) {
            if (gameState.arcadeMode && gameState.plane) {
              // Controle do avião no modo arcade - MOVIMENTO SUB-PIXEL RÁPIDO
              setGameState((prev: GameState) => ({
                ...prev,
                plane: { ...prev.plane!, x: Math.max(0, prev.plane!.x - 0.15) },
              }));
            } else if (gameState.active) {
              // Controle normal do Tetris
              const event = new KeyboardEvent("keydown", { key: "a" });
              window.dispatchEvent(event);
            }
          }
        }}
        onMoveRight={() => {
          if (!gameOver && !paused) {
            if (gameState.arcadeMode && gameState.plane) {
              // Controle do avião no modo arcade - MOVIMENTO SUB-PIXEL RÁPIDO
              setGameState((prev: GameState) => ({
                ...prev,
                plane: { ...prev.plane!, x: Math.min(C_W - 1, prev.plane!.x + 0.15) },
              }));
            } else if (gameState.active) {
              // Controle normal do Tetris
              const event = new KeyboardEvent("keydown", { key: "d" });
              window.dispatchEvent(event);
            }
          }
        }}
        onRotate90={() => {
          if (!gameOver && !paused && gameState.active) {
            const event = new KeyboardEvent("keydown", { key: "w" });
            window.dispatchEvent(event);
          }
        }}
        onRotate180={() => {
          if (!gameOver && !paused && gameState.active) {
            const event = new KeyboardEvent("keydown", { key: "s" });
            window.dispatchEvent(event);
          }
        }}
        onFastDrop={() => {
          if (!gameOver && !paused && gameState.active) {
            const event = new KeyboardEvent("keydown", { key: " " });
            window.dispatchEvent(event);
          }
        }}
        onTogglePause={togglePause}
        onRestart={reset}
        paused={paused}
        fastDrop={fastDrop}
        gameState={gameState}
        gameOver={gameOver}
      />

      {/* Painel de Score Mobile */}
      <MobileScorePanel
        score={score}
        level={level}
        combo={gameState.combo}
        comboMultiplier={gameState.comboMultiplier}
        nextPiece={gameState.nextPiece}
        paused={paused}
        fastDrop={fastDrop}
        onReset={reset}
        onTogglePause={togglePause}
      />
    </>
  );
}
