"use client";

interface NextPieceDisplayProps {
  nextPiece: { shape: number[][]; color: number } | null;
}

const CELL = 20; // Menor para o preview
const COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];

export function NextPieceDisplay({ nextPiece }: NextPieceDisplayProps) {
  if (!nextPiece) return null;

  // Calcula o centro da peça para centralizar
  const minX = Math.min(...nextPiece.shape.map(([x]) => x || 0));
  const maxX = Math.max(...nextPiece.shape.map(([x]) => x || 0));
  const minY = Math.min(...nextPiece.shape.map(([, y]) => y || 0));
  const maxY = Math.max(...nextPiece.shape.map(([, y]) => y || 0));

  const centerX = (4 - (maxX - minX + 1)) / 2 - minX;
  const centerY = (4 - (maxY - minY + 1)) / 2 - minY;

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
      <h3 className="text-white text-sm font-bold mb-3 text-center">Próxima</h3>
      <div className="relative w-20 h-20 mx-auto">
        <svg width="80" height="80" viewBox="0 0 80 80" className="absolute inset-0">
          {nextPiece.shape.map(([dx, dy], index) => {
            const x = (centerX + (dx || 0)) * CELL;
            const y = (centerY + (dy || 0)) * CELL;
            return (
              <rect
                key={index}
                x={x}
                y={y}
                width={CELL}
                height={CELL}
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
  );
}
