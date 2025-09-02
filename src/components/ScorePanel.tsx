"use client";

import { motion } from "framer-motion";
import { Trophy, Zap } from "lucide-react";
import { NextPieceDisplay } from "./NextPieceDisplay";

interface ScorePanelProps {
  score: number;
  level: number;
  paused: boolean;
  fastDrop: boolean;
  nextPiece: { shape: number[][]; color: number } | null;
  onReset: () => void;
  onTogglePause: () => void;
}

export function ScorePanel({ score, level, paused, fastDrop, nextPiece, onReset, onTogglePause }: ScorePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-2xl min-w-[280px]"
    >
      {/* Score */}
      <div className="mb-6">
        <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Score</div>
        <motion.div
          key={score}
          initial={{ scale: 1.1, color: "#ffffff" }}
          animate={{ scale: 1, color: "#ffd166" }}
          transition={{ duration: 0.3 }}
          className="text-5xl font-black text-yellow-400 drop-shadow-lg"
          style={{
            textShadow: "0 0 20px rgba(255, 209, 102, 0.3)",
          }}
        >
          {score.toLocaleString()}
        </motion.div>
      </div>

      {/* Level */}
      <div className="mb-6">
        <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Level</div>
        <div
          className="text-3xl font-black text-blue-400"
          style={{
            textShadow: "0 0 16px rgba(125, 211, 252, 0.25)",
          }}
        >
          {level}
        </div>
      </div>

      {/* Next Piece */}
      <div className="mb-6">
        <NextPieceDisplay nextPiece={nextPiece} />
      </div>

      <div className="border-t border-slate-700/50 pt-6">
        {/* Fast Drop Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: fastDrop ? 1 : 0,
            scale: fastDrop ? 1 : 0.8,
          }}
          className="mb-4"
        >
          <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3 text-center">
            <Zap className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-green-400 text-sm font-bold">QUEDA RÁPIDA ATIVA</div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTogglePause}
            className="w-full bg-gradient-to-r from-pink-600/80 to-purple-600/80 hover:from-pink-500/80 hover:to-purple-500/80 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {paused ? (
              <>
                <div className="w-3 h-3 bg-white rounded-sm" />
                Resume (P)
              </>
            ) : (
              <>
                <div className="w-3 h-3 border-2 border-white rounded-sm" />
                Pause (P)
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="w-full bg-gradient-to-r from-orange-600/80 to-yellow-600/80 hover:from-orange-500/80 hover:to-yellow-500/80 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Restart (R)
          </motion.button>
        </div>

        {/* Game Info */}
        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-slate-400 text-sm text-center leading-relaxed">Linhas monocromáticas e pontes limpam na hora.</p>
        </div>
      </div>
    </motion.div>
  );
}
