import React, { useEffect, useRef, useState } from "react";
import { UPS } from "./game/constants.js";
import { GameEngine } from "./game/GameEngine.js";
import { Renderer } from "./game/Renderer.js";
import { useKeyboard } from "./game/InputManager.js";
import { audioManager } from "./game/AudioManager.js";
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
  const [hud, setHud] = useState({
    level: 1,
    lines: 0,
    score: 0,
    combo: 0,
    gameOver: false,
    airplaneMode: false,
    airplaneScore: 0,
    airplaneHits: 0,
    airplaneTimeRemaining: 0,
  });

  // Estado do áudio
  const [audioState, setAudioState] = useState({
    muted: audioManager.isMuted(),
    masterVolume: 0.3,
    sfxVolume: 0.5,
  });

  // Estado do painel de configurações
  const [showSettings, setShowSettings] = useState(false);

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

  // Inicializa o áudio no primeiro clique
  useEffect(() => {
    const initAudio = () => {
      audioManager.resumeAudioContext();
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
    };

    document.addEventListener("click", initAudio);
    document.addEventListener("keydown", initAudio);

    return () => {
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
    };
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
          const airplaneMode = gameEngine.getAirplaneMode();
          setHud({
            level: state.level,
            lines: state.lines,
            score: state.score,
            combo: state.combo,
            gameOver: state.gameOver,
            airplaneMode: airplaneMode.isActive(),
            airplaneScore: airplaneMode.getScore(),
            airplaneHits: airplaneMode.getHits(),
            airplaneTimeRemaining: airplaneMode.getTimeRemaining(),
          });
        }
      }

      // Renderização
      const airplaneMode = gameEngine.getAirplaneMode();
      renderer.render({ grid: gameEngine.getGrid() }, gameEngine.getCurrentPiece(), airplaneMode);

      // Só renderiza a próxima peça se não estiver no modo avião
      if (!gameEngine.isAirplaneModeActive()) {
        renderer.renderNext(gameEngine.getNextPiece());
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [getKeys]);

  const onRestart = () => {
    gameEngineRef.current.reset();
    audioManager.playButtonClick();
  };

  // Funções de controle de áudio
  const toggleMute = () => {
    const muted = audioManager.toggleMute();
    setAudioState((prev) => ({ ...prev, muted }));
    audioManager.playButtonClick();
  };

  const setMasterVolume = (volume) => {
    audioManager.setMasterVolume(volume);
    setAudioState((prev) => ({ ...prev, masterVolume: volume }));
  };

  const setSfxVolume = (volume) => {
    audioManager.setSfxVolume(volume);
    setAudioState((prev) => ({ ...prev, sfxVolume: volume }));
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    audioManager.playButtonClick();
  };

  return (
    <div className="game-container">
      {/* Header com título e configurações */}
      <div className="game-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="game-title">SAND TETRIS</h1>
            {/* <div className="game-subtitle">Partículas em queda livre</div> */}
          </div>
          <button className="settings-btn" onClick={toggleSettings}>
            ⚙️ CONFIG
          </button>
        </div>
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

          {/* Modo Avião - só aparece quando ativo */}
          {hud.airplaneMode && (
            <div className="airplane-section">
              <div className="airplane-title">✈️ MODO AVIÃO</div>
              <div className="airplane-stats">
                <div className="airplane-item">
                  <div className="airplane-label">Tempo</div>
                  <div className="airplane-value">{Math.ceil(hud.airplaneTimeRemaining / 1000)}s</div>
                </div>
                <div className="airplane-item">
                  <div className="airplane-label">Pontos</div>
                  <div className="airplane-value">{hud.airplaneScore}</div>
                </div>
                <div className="airplane-item">
                  <div className="airplane-label">Acertos</div>
                  <div className="airplane-value">{hud.airplaneHits}</div>
                </div>
              </div>
            </div>
          )}

          {/* Próxima peça */}
          <div className="next-section">
            <div className="next-label">NEXT</div>
            <div className="next-preview">
              <canvas ref={nextRef} className="next-canvas" />
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

        {/* Painel direito - Controles */}
        <div className="stats-panel">
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
      </div>

      {/* Modal de Configurações */}
      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-modal">
            <div className="settings-header">
              <h2 className="settings-title">⚙️ CONFIGURAÇÕES</h2>
              <button className="close-btn" onClick={toggleSettings}>
                ✕
              </button>
            </div>

            <div className="settings-content">
              {/* Seção de Áudio */}
              <div className="settings-section">
                <h3 className="section-title">🔊 ÁUDIO</h3>
                <div className="settings-group">
                  <div className="setting-item">
                    <label className="setting-label">Master Volume</label>
                    <div className="volume-control">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={audioState.masterVolume}
                        onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                        className="volume-slider"
                      />
                      <span className="volume-value">{Math.round(audioState.masterVolume * 100)}%</span>
                    </div>
                  </div>

                  <div className="setting-item">
                    <label className="setting-label">SFX Volume</label>
                    <div className="volume-control">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={audioState.sfxVolume}
                        onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                        className="volume-slider"
                      />
                      <span className="volume-value">{Math.round(audioState.sfxVolume * 100)}%</span>
                    </div>
                  </div>

                  <div className="setting-item">
                    <button className="audio-toggle-btn" onClick={toggleMute}>
                      {audioState.muted ? "🔇 SOM DESLIGADO" : "🔊 SOM LIGADO"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
