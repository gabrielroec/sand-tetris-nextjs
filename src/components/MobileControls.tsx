"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap, Play, Pause, RotateCcw } from "lucide-react";

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate90: () => void;
  onRotate180: () => void;
  onFastDrop: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  paused: boolean;
  fastDrop: boolean;
}

export function MobileControls({
  onMoveLeft,
  onMoveRight,
  onRotate90,
  onRotate180,
  onFastDrop,
  onTogglePause,
  onRestart,
  paused,
  fastDrop,
}: MobileControlsProps) {
  const buttonClass = "btn flex items-center justify-center w-14 h-14 select-none touch-manipulation";

  return (
    <div className="mobile-controls fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 p-4 z-40">
      {/* Controles de Movimento */}
      <div className="flex justify-center items-center gap-4 mb-4">
        {/* Movimento Horizontal */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMoveLeft}
          className={buttonClass}
          style={{ background: "#60a5fa66", color: "#13081f" }}
          aria-label="Mover esquerda"
        >
          <ArrowLeft size={24} />
        </motion.button>

        {/* Rotação 90° */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRotate90}
          className={buttonClass}
          style={{ background: "#34d39966", color: "#13081f" }}
          aria-label="Rotacionar 90°"
        >
          <ArrowUp size={24} />
        </motion.button>

        {/* Movimento Direita */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMoveRight}
          className={buttonClass}
          style={{ background: "#60a5fa66", color: "#13081f" }}
          aria-label="Mover direita"
        >
          <ArrowRight size={24} />
        </motion.button>
      </div>

      {/* Controles Secundários */}
      <div className="flex justify-center items-center gap-4">
        {/* Rotação 180° */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRotate180}
          className={buttonClass}
          style={{ background: "#34d39966", color: "#13081f" }}
          aria-label="Rotacionar 180°"
        >
          <ArrowDown size={24} />
        </motion.button>

        {/* Fast Drop */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onFastDrop}
          className={buttonClass}
          style={{
            background: fastDrop ? "#fbbf2466" : "#fbbf2466",
            color: "#13081f",
          }}
          aria-label="Queda rápida"
        >
          <Zap size={24} />
        </motion.button>

        {/* Pause/Play */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onTogglePause}
          className={buttonClass}
          style={{ background: "#f472b66b", color: "#13081f" }}
          aria-label={paused ? "Continuar" : "Pausar"}
        >
          {paused ? <Play size={24} /> : <Pause size={24} />}
        </motion.button>

        {/* Restart */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRestart}
          className={buttonClass}
          style={{ background: "#f59e0b66", color: "#13081f" }}
          aria-label="Reiniciar"
        >
          <RotateCcw size={24} />
        </motion.button>
      </div>

      {/* Indicador de Controles */}
      <div className="text-center mt-3">
        <p className="text-xs text-slate-400 font-medium">Controles Touch</p>
      </div>
    </div>
  );
}
