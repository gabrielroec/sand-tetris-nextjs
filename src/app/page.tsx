"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trophy } from "lucide-react";
import { GameCanvas } from "@/components/GameCanvas";
import { useGameLogic } from "@/hooks/useGameLogic";

export default function Home() {
  const { score, level, gameOver, paused, fastDrop, reset, togglePause, gameState } = useGameLogic();

  // Debug: rastrear quando o modal do game over aparece
  React.useEffect(() => {
    if (gameOver) {
      console.log(`🚨 MODAL GAME OVER APARECEU! Score: ${score}, Level: ${level}`);
    }
  }, [gameOver, score, level]);

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
    </>
  );
}
