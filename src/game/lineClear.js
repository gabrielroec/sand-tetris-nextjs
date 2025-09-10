import { GRID_W, GRID_H } from "./constants.js";
import { idx } from "./grid.js";

export function clearColorLines(cells, rest) {
  let cleared = 0;

  // Para cada linha, verifica se há partículas conectadas de uma extremidade à outra
  for (let y = 0; y < GRID_H; y++) {
    // Verifica se há partículas nas extremidades da linha
    const leftColor = cells[idx(0, y)];
    const rightColor = cells[idx(GRID_W - 1, y)];

    if (leftColor !== 0 && rightColor !== 0) {
      // Usa flood fill para encontrar todas as partículas conectadas da mesma cor
      const visited = new Set();
      const toVisit = [];
      const targetColor = leftColor;

      // Começa da extremidade esquerda
      toVisit.push([0, y]);

      let foundRightEdge = false;

      while (toVisit.length > 0) {
        const [x, cy] = toVisit.pop();
        const key = `${x},${cy}`;

        if (visited.has(key)) continue;
        if (x < 0 || x >= GRID_W || cy < 0 || cy >= GRID_H) continue;

        const cellColor = cells[idx(x, cy)];
        if (cellColor !== targetColor) continue;

        visited.add(key);

        // Se chegou na extremidade direita, encontrou uma faixa conectada
        if (x === GRID_W - 1) {
          foundRightEdge = true;
        }

        // Adiciona vizinhos (4 direções)
        toVisit.push([x + 1, cy], [x - 1, cy], [x, cy + 1], [x, cy - 1]);
      }

      // Se encontrou uma faixa conectada de uma extremidade à outra, limpa todas as partículas visitadas
      if (foundRightEdge) {
        for (const key of visited) {
          const [x, cy] = key.split(",").map(Number);
          const i = idx(x, cy);
          cells[i] = 0;
          rest[i] = 0;
        }
        cleared++;
      }
    }
  }

  return cleared;
}
