import React, { useEffect, useRef, useState } from "react";
import { UPS } from "./game/constants.js";
import { GameEngine } from "./game/GameEngine.js";
import { Renderer } from "./game/Renderer.js";
import { useKeyboard } from "./game/InputManager.js";
import "./App.css";

export default function App() {
  // Canvas
  const canvasRef = useRef(null);
  const nextRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  // Game Engine e Renderer
  const gameEngineRef = useRef(new GameEngine());
  const rendererRef = useRef(null);

  // HUD: exibe números sem re-renderar tudo
  const [hud, setHud] = useState({ level: 1, lines: 0, score: 0, combo: 0, gameOver: false });

  // Input
  const getKeys = useKeyboard({
    onTogglePause: () => {
      gameEngineRef.current.togglePause();
    },
    onSoftDrop: (v) => {
      gameEngineRef.current.setSoftDrop(v);
    },
  });

  // Inicialização do renderer
  useEffect(() => {
    if (canvasRef.current && nextRef.current) {
      rendererRef.current = new Renderer(canvasRef.current, nextRef.current);
      rendererRef.current.resizeCanvas();
      setCanvasSize({
        w: canvasRef.current.width,
        h: canvasRef.current.height,
      });
    }
  }, []);

  // Resize + escala
  useEffect(() => {
    const onResize = () => {
      if (rendererRef.current) {
        rendererRef.current.resizeCanvas();
        setCanvasSize({
          w: canvasRef.current.width,
          h: canvasRef.current.height,
        });
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Loop de jogo (tempo fixo)
  useEffect(() => {
    let raf = 0;
    const stepMs = 1000 / UPS;
    let acc = 0;
    let last = performance.now();

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(100, now - last);
      last = now;
      acc += dt;

      const gameEngine = gameEngineRef.current;
      const renderer = rendererRef.current;
      if (!renderer) return;

      while (acc >= stepMs) {
        acc -= stepMs;
        gameEngine.update(stepMs, getKeys());

        // HUD leve
        if ((gameEngine.getState().tick & 3) === 0) {
          const state = gameEngine.getState();
          setHud({
            level: state.level,
            lines: state.lines,
            score: state.score,
            combo: state.combo,
            gameOver: state.gameOver,
          });
        }
      }

      // Renderização
      const state = gameEngine.getState();
      renderer.render({ grid: gameEngine.getGrid() }, gameEngine.getCurrentPiece());
      renderer.renderNext(gameEngine.getNextPiece());
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onRestart = () => {
    gameEngineRef.current.reset();
  };

  return (
    <div className="game-container">
      {/* Header com título */}
      <div className="game-header">
        <h1 className="game-title">SAND TETRIS</h1>
        <div className="game-subtitle">Partículas em queda livre</div>
      </div>

      {/* Layout principal do jogo */}
      <div className="game-layout">
        {/* Painel esquerdo - Informações */}
        <div className="info-panel">
          <div className="score-section">
            <div className="score-item">
              <div className="score-label">SCORE</div>
              <div className="score-value">{hud.score.toLocaleString()}</div>
            </div>
            <div className="score-item">
              <div className="score-label">LEVEL</div>
              <div className="score-value">{hud.level}</div>
            </div>
            <div className="score-item">
              <div className="score-label">LINES</div>
              <div className="score-value">{hud.lines}</div>
            </div>
            <div className="score-item">
              <div className="score-label">COMBO</div>
              <div className="score-value">{hud.combo}</div>
            </div>
          </div>

          {/* Próxima peça */}
          <div className="next-section">
            <div className="next-label">NEXT</div>
            <div className="next-preview">
              <canvas ref={nextRef} className="next-canvas" />
            </div>
          </div>

          {/* Controles */}
          <div className="controls-section">
            <div className="controls-label">CONTROLS</div>
            <div className="controls-grid">
              <div className="control-item">
                <span className="control-key">← →</span>
                <span className="control-desc">Move</span>
              </div>
              <div className="control-item">
                <span className="control-key">↑</span>
                <span className="control-desc">Rotate</span>
              </div>
              <div className="control-item">
                <span className="control-key">↓</span>
                <span className="control-desc">Soft Drop</span>
              </div>
              <div className="control-item">
                <span className="control-key">P</span>
                <span className="control-desc">Pause</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel central - Jogo */}
        <div className="game-panel">
          <canvas ref={canvasRef} className="game-canvas" style={{ width: canvasSize.w + "px", height: canvasSize.h + "px" }} />

          {/* Botões de controle */}
          <div className="game-controls">
            <button className="control-btn pause-btn" onClick={() => gameEngineRef.current.togglePause()}>
              {gameEngineRef.current.isRunning() ? "⏸️ PAUSE" : "▶️ RESUME"}
            </button>
            <button className="control-btn restart-btn" onClick={onRestart}>
              🔄 RESTART
            </button>
          </div>
        </div>

        {/* Painel direito - Estatísticas */}
        <div className="stats-panel">
          <div className="stats-section">
            <div className="stats-label">STATS</div>
            <div className="stats-item">
              <span className="stats-name">Time</span>
              <span className="stats-value">--:--</span>
            </div>
            <div className="stats-item">
              <span className="stats-name">Pieces</span>
              <span className="stats-value">0</span>
            </div>
            <div className="stats-item">
              <span className="stats-name">Drops</span>
              <span className="stats-value">0</span>
            </div>
          </div>

          {/* Objetivo do jogo */}
          <div className="objective-section">
            <div className="objective-label">OBJECTIVE</div>
            <div className="objective-text">
              Forme faixas contínuas de uma cor de uma extremidade à outra para limpar linhas e ganhar pontos!
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {hud.gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <div className="game-over-title">GAME OVER</div>
            <div className="game-over-score">Final Score: {hud.score.toLocaleString()}</div>
            <div className="game-over-stats">
              <div>Level: {hud.level}</div>
              <div>Lines: {hud.lines}</div>
              <div>Max Combo: {hud.combo}</div>
            </div>
            <button className="game-over-btn" onClick={onRestart}>
              🎮 PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
