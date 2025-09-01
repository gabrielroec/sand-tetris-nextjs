"use client";

import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Zap, ZapOff } from "lucide-react";

interface GameControlsProps {
  paused: boolean;
  fastDrop: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  onFastDropChange: (fast: boolean) => void;
}

export function GameControls({ paused, fastDrop, onTogglePause, onReset, onFastDropChange }: GameControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {/* Pause/Resume Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onTogglePause}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg"
      >
        {paused ? (
          <>
            <Play className="w-5 h-5" />
            Resume
          </>
        ) : (
          <>
            <Pause className="w-5 h-5" />
            Pause
          </>
        )}
      </motion.button>

      {/* Fast Drop Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseDown={() => onFastDropChange(true)}
        onMouseUp={() => onFastDropChange(false)}
        onMouseLeave={() => onFastDropChange(false)}
        className={`font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg ${
          fastDrop
            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
            : "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-slate-300"
        }`}
      >
        {fastDrop ? (
          <>
            <Zap className="w-5 h-5" />
            Fast Drop
          </>
        ) : (
          <>
            <ZapOff className="w-5 h-5" />
            Hold for Fast Drop
          </>
        )}
      </motion.button>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg"
      >
        <RotateCcw className="w-5 h-5" />
        Reset
      </motion.button>
    </div>
  );
}
