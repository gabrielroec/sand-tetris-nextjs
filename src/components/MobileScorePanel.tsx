"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Trophy, Zap, Play, Pause } from "lucide-react";

interface MobileScorePanelProps {
  score: number;
  level: number;
  combo: number;
  comboMultiplier: number;
  nextPiece: { shape: number[][]; color: number } | null;
  paused: boolean;
  fastDrop: boolean;
  onReset: () => void;
  onTogglePause: () => void;
}

const COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];

export function MobileScorePanel({
  score,
  level,
  combo,
  comboMultiplier,
  nextPiece,
  paused,
  fastDrop,
  onReset,
  onTogglePause,
}: MobileScorePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mobile-score-panel fixed top-4 right-4 z-30">
      {/* Botão de Toggle */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-12 h-12 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-600/50 rounded-full flex items-center justify-center text-white shadow-lg"
        aria-label={isExpanded ? "Recolher painel" : "Expandir painel"}
      >
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </motion.button>

      {/* Painel Expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 right-0 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 shadow-2xl min-w-[200px]"
          >
            {/* Score */}
            <div className="mb-3">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Score</div>
              <div className="text-2xl font-black text-yellow-400 drop-shadow-lg">{score.toLocaleString()}</div>
            </div>

            {/* Level */}
            <div className="mb-3">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Level</div>
              <div className="text-xl font-black text-blue-400">{level}</div>
            </div>

            {/* Combo */}
            {combo > 0 && (
              <div className="mb-3">
                <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Combo</div>
                <div className="text-lg font-black text-red-400">
                  x{comboMultiplier} ({combo})
                </div>
              </div>
            )}

            {/* Next Piece */}
            {nextPiece && (
              <div className="mb-3">
                <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Próxima</div>
                <div className="flex justify-center">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    {nextPiece.shape.map(([dx, dy], index) => {
                      const minX = Math.min(...nextPiece.shape.map(([x]) => x || 0));
                      const maxX = Math.max(...nextPiece.shape.map(([x]) => x || 0));
                      const minY = Math.min(...nextPiece.shape.map(([, y]) => y || 0));
                      const maxY = Math.max(...nextPiece.shape.map(([, y]) => y || 0));

                      const centerX = (4 - (maxX - minX + 1)) / 2 - minX;
                      const centerY = (4 - (maxY - minY + 1)) / 2 - minY;

                      const x = (centerX + (dx || 0)) * 15;
                      const y = (centerY + (dy || 0)) * 15;
                      return (
                        <rect
                          key={index}
                          x={x}
                          y={y}
                          width="15"
                          height="15"
                          fill={COLORS[nextPiece.color - 1] || "#ffffff"}
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

            {/* Fast Drop Indicator */}
            {fastDrop && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-3">
                <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-2 text-center">
                  <Zap className="w-4 h-4 text-green-400 mx-auto mb-1" />
                  <div className="text-green-400 text-xs font-bold">QUEDA RÁPIDA</div>
                </div>
              </motion.div>
            )}

            {/* Controles Rápidos */}
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onTogglePause}
                className="btn flex-1 flex items-center justify-center gap-1 text-sm"
                style={{ background: "#f472b66b", color: "#13081f" }}
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
                {paused ? "Play" : "Pause"}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onReset}
                className="btn flex-1 flex items-center justify-center gap-1 text-sm"
                style={{ background: "#f59e0b66", color: "#13081f" }}
              >
                <Trophy size={14} />
                Reset
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
