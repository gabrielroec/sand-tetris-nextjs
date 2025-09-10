export const GRID_W = 16;
export const GRID_H = 41;
export const UPS = 60; // updates por segundo (tempo fixo)

// === Render (peça independente do tamanho do canvas) ===
export const BOARD_CELL_PX = 12; // tamanho da célula em pixels (define o TAMANHO DA PEÇA)
export const PREVIEW_CELL_PX = 14; // tamanho da célula no preview
export const SCALE_MODE = "fixed"; // 'fixed' (não escala) | 'fit' (ajusta ao container)

// Cores das partículas (1..N); índice 0 é vazio
export const CELL_COLORS = [
  "#000000", // 0 vazio
  "#ff5060", // 1 vermelho
  "#29c46d", // 2 verde
  "#3aa3ff", // 3 azul
  "#ffd447", // 4 amarelo
];
export const COLOR_COUNT = CELL_COLORS.length - 1;

export const REST_K = 6; // ticks até marcar repouso
export const SAND_BUDGET = 5000; // tentativas de movimento por tick (p/ segurar FPS)
export const BASE_FALL_MS = 120; // queda inicial (ms por célula) - mais rápido
export const LINES_PER_LEVEL = 10;
export const SCORE_PER_LINE = 10;
