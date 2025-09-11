import React, { useEffect, useRef, useState } from "react";
import { UPS } from "./game/constants.js";
import { GameEngine } from "./game/GameEngine.js";
import { Renderer } from "./game/Renderer.js";
import { useKeyboard } from "./game/InputManager.js";
import { audioManager } from "./game/AudioManager.js";
import AdBanner from "./components/AdBanner.jsx";
import { Analytics } from "@vercel/analytics/react";
import { track } from "@vercel/analytics";
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
  });

  // Estado do áudio
  const [audioState, setAudioState] = useState({
    muted: audioManager.isMuted(),
    masterVolume: 0.3,
    sfxVolume: 0.5,
  });

  // Estado para controles mobile
  const [isMobile, setIsMobile] = useState(false);

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

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || "ontouchstart" in window;
      console.log(`📱 Detecção mobile: ${isMobileDevice} (width: ${window.innerWidth}, touch: ${"ontouchstart" in window})`);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handlers para controles mobile
  const handleMobileMove = (direction) => {
    console.log(`🎮 Mobile move: ${direction}`);
    const inputManager = getKeys.inputManager;
    if (direction === "left") {
      console.log("⬅️ Simulando ArrowLeft");
      inputManager.simulateKeyDown("ArrowLeft");
      setTimeout(() => {
        inputManager.simulateKeyUp("ArrowLeft");
      }, 100);
    } else if (direction === "right") {
      console.log("➡️ Simulando ArrowRight");
      inputManager.simulateKeyDown("ArrowRight");
      setTimeout(() => {
        inputManager.simulateKeyUp("ArrowRight");
      }, 100);
    }
  };

  const handleMobileRotate = () => {
    console.log("🔄 Mobile rotate");
    const inputManager = getKeys.inputManager;
    inputManager.simulateKeyDown("ArrowUp");
    setTimeout(() => {
      inputManager.simulateKeyUp("ArrowUp");
    }, 100);
  };

  const handleMobileSoftDrop = (active) => {
    gameEngineRef.current.setSoftDrop(active);
  };

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
      renderer.render({ grid: gameEngine.getGrid() }, gameEngine.getCurrentPiece());
      renderer.renderNext(gameEngine.getNextPiece());
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

    // Track settings change
    track("settings_change", {
      game: "sand-tetris",
      setting: "mute",
      value: muted,
      timestamp: new Date().toISOString(),
    });
  };

  const setMasterVolume = (volume) => {
    audioManager.setMasterVolume(volume);
    setAudioState((prev) => ({ ...prev, masterVolume: volume }));

    // Track settings change
    track("settings_change", {
      game: "sand-tetris",
      setting: "master_volume",
      value: volume,
      timestamp: new Date().toISOString(),
    });
  };

  const setSfxVolume = (volume) => {
    audioManager.setSfxVolume(volume);
    setAudioState((prev) => ({ ...prev, sfxVolume: volume }));

    // Track settings change
    track("settings_change", {
      game: "sand-tetris",
      setting: "sfx_volume",
      value: volume,
      timestamp: new Date().toISOString(),
    });
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

      {/* Banner de anúncio no topo */}
      <div className="top-ad-container">
        <AdBanner adSlot="1234567890" adFormat="horizontal" className="top-banner-ad" />
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

        {/* Painel direito - Controles e Anúncio */}
        <div className="stats-panel">
          <div className="controls-section">
            <div className="controls-label">CONTROLS</div>
            <div className="controls-grid">
              <div className="control-item">
                <span className="control-key">A D</span>
                <span className="control-desc">Move</span>
              </div>
              <div className="control-item">
                <span className="control-key">W</span>
                <span className="control-desc">Rotate</span>
              </div>
              <div className="control-item">
                <span className="control-key">S</span>
                <span className="control-desc">Soft Drop</span>
              </div>
              <div className="control-item">
                <span className="control-key">P</span>
                <span className="control-desc">Pause</span>
              </div>
            </div>
          </div>

          {/* Anúncio lateral */}
          <div className="side-ad-container">
            <AdBanner adSlot="0987654321" adFormat="vertical" className="side-banner-ad" />
          </div>
        </div>
      </div>

      {/* Controles Mobile */}
      {isMobile && (
        <div className="mobile-controls">
          {console.log("📱 Renderizando controles mobile")}
          <div className="mobile-control-row">
            <button
              className="mobile-btn mobile-btn-left"
              onTouchStart={(e) => {
                e.preventDefault();
                handleMobileMove("left");
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleMobileMove("left");
              }}
            >
              ←
            </button>
            <button
              className="mobile-btn mobile-btn-rotate"
              onTouchStart={(e) => {
                e.preventDefault();
                handleMobileRotate();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleMobileRotate();
              }}
            >
              ↻
            </button>
            <button
              className="mobile-btn mobile-btn-right"
              onTouchStart={(e) => {
                e.preventDefault();
                handleMobileMove("right");
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleMobileMove("right");
              }}
            >
              →
            </button>
          </div>
          <div className="mobile-control-row">
            <button
              className="mobile-btn mobile-btn-softdrop"
              onTouchStart={(e) => {
                e.preventDefault();
                handleMobileSoftDrop(true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleMobileSoftDrop(false);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleMobileSoftDrop(true);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                handleMobileSoftDrop(false);
              }}
            >
              ⬇ SOFT DROP
            </button>
          </div>
        </div>
      )}

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
      <Analytics />
    </div>
  );
}
