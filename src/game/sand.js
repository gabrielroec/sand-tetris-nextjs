import { GRID_W, GRID_H } from "./constants.js";
import { idx, inBounds } from "./grid.js";

export function simulateSand({ read, write, restRead, restWrite, budget, restK, biasToggle }) {
  // zera write e restWrite
  write.fill(0);
  restWrite.fill(0);

  let processed = 0;
  // varrer de baixo p/ cima
  for (let y = GRID_H - 1; y >= 0; y--) {
    for (let x = 0; x < GRID_W; x++) {
      const i = idx(x, y);
      const color = read[i];
      if (color === 0) continue;

      if (processed >= budget) {
        // só copia
        write[i] = color;
        restWrite[i] = restRead[i];
        continue;
      }

      const rest = restRead[i];
      let moved = false;

      // helper p/ tentar mover
      const tryTo = (nx, ny) => {
        if (!inBounds(nx, ny)) return false;
        const j = idx(nx, ny);
        if (read[j] === 0 && write[j] === 0) {
          write[j] = color;
          restWrite[j] = 0;
          processed++;
          moved = true;
          return true;
        }
        return false;
      };

      const belowY = y + 1;
      if (rest >= restK) {
        // Em repouso: só desperta se abrir espaço abaixo
        if (belowY < GRID_H && read[idx(x, belowY)] === 0) {
          if (!tryTo(x, belowY)) {
            // se por algum motivo não conseguiu, copia
            write[i] = color;
            restWrite[i] = 0;
          }
        } else {
          write[i] = color;
          restWrite[i] = rest;
        }
        continue;
      }

      // Ativo: tenta baixo, depois diagonais alternadas
      if (belowY < GRID_H && read[idx(x, belowY)] === 0) {
        tryTo(x, belowY);
      } else {
        const first = biasToggle ? -1 : 1;
        const second = -first;
        if (!tryTo(x + first, y + 1)) {
          tryTo(x + second, y + 1);
        }
      }

      if (!moved) {
        // não moveu → incrementa repouso e copia
        write[i] = color;
        const r = Math.min(255, rest + 1);
        restWrite[i] = r;
      }
    }
  }
}
