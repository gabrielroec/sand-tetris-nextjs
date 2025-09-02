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
  const buttonClass =
    "flex items-center justify-center w-12 h-12 rounded-lg font-bold text-white transition-all duration-150 active:scale-95 select-none";

  return (
    <div className="mobile-controls fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 p-4 z-50">
      {/* Controles de Movimento */}
      <div className="flex justify-center items-center gap-3 mb-3">
        {/* Movimento Horizontal */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMoveLeft}
          className={`${buttonClass} bg-blue-600 hover:bg-blue-500 active:bg-blue-700`}
          aria-label="Mover esquerda"
        >
          <ArrowLeft size={20} />
        </motion.button>

        {/* Rotação 90° */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRotate90}
          className={`${buttonClass} bg-green-600 hover:bg-green-500 active:bg-green-700`}
          aria-label="Rotacionar 90°"
        >
          <ArrowUp size={20} />
        </motion.button>

        {/* Movimento Direita */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMoveRight}
          className={`${buttonClass} bg-blue-600 hover:bg-blue-500 active:bg-blue-700`}
          aria-label="Mover direita"
        >
          <ArrowRight size={20} />
        </motion.button>
      </div>

      {/* Controles Secundários */}
      <div className="flex justify-center items-center gap-3">
        {/* Rotação 180° */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRotate180}
          className={`${buttonClass} bg-green-600 hover:bg-green-500 active:bg-green-700`}
          aria-label="Rotacionar 180°"
        >
          <ArrowDown size={20} />
        </motion.button>

        {/* Fast Drop */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onFastDrop}
          className={`${buttonClass} ${fastDrop ? "bg-yellow-500" : "bg-yellow-600 hover:bg-yellow-500"} active:bg-yellow-700`}
          aria-label="Queda rápida"
        >
          <Zap size={20} />
        </motion.button>

        {/* Pause/Play */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onTogglePause}
          className={`${buttonClass} bg-purple-600 hover:bg-purple-500 active:bg-purple-700`}
          aria-label={paused ? "Continuar" : "Pausar"}
        >
          {paused ? <Play size={20} /> : <Pause size={20} />}
        </motion.button>

        {/* Restart */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRestart}
          className={`${buttonClass} bg-red-600 hover:bg-red-500 active:bg-red-700`}
          aria-label="Reiniciar"
        >
          <RotateCcw size={20} />
        </motion.button>
      </div>

      {/* Indicador de Controles */}
      <div className="text-center mt-2">
        <p className="text-xs text-slate-400">Controles Touch</p>
      </div>
    </div>
  );
}
