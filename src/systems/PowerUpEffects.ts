// ===============================================
// POWER-UP EFFECTS - APENAS 2 POWER-UPS ESPECÍFICOS
// ===============================================
// Sistema simplificado com apenas Mega Explosão e Mega Clear

import { PowerUpEffect, ExplosionContext, ExplosionResult } from "../types/roguelike";

export class MegaExplosionEffect implements PowerUpEffect {
  explosionMultiplier = 100;

  apply(gameState: unknown, context: ExplosionContext): ExplosionResult {
    const { x, y, clearedLines } = context;
    const additionalExplosions: Array<{ x: number; y: number; color?: number }> = [];

    console.log(`💥 MEGA EXPLOSÃO ativada em (${x}, ${y})`);
    console.log(`💥 Linhas limpas: ${clearedLines.join(", ")}`);

    const gameWidth = 8;
    const gameHeight = 22;

    // 1. A faixa que o usuário completou já vai explodir naturalmente
    // 2. Adiciona 1000 bolinhas aleatórias para explodir (independente da cor)

    const randomExplosions = 1000;
    console.log(`💥 Gerando ${randomExplosions} explosões aleatórias...`);

    for (let i = 0; i < randomExplosions; i++) {
      const randomX = Math.floor(Math.random() * gameWidth);
      const randomY = Math.floor(Math.random() * gameHeight);

      additionalExplosions.push({
        x: randomX,
        y: randomY,
        // SEM cor = destrói qualquer bolinha independente da cor!
      });
    }

    console.log(`💥 MEGA EXPLOSÃO: ${additionalExplosions.length} explosões aleatórias geradas`);

    return {
      additionalExplosions,
      scoreBonus: context.score * 3.0, // 300% bonus
      specialEffects: ["💥 MEGA EXPLOSÃO - 1000 BOLINHAS DESTRUÍDAS!"],
    };
  }
}

export class MegaClearEffect implements PowerUpEffect {
  explosionMultiplier = 100;

  apply(gameState: unknown, context: ExplosionContext): ExplosionResult {
    const { x, y, color, clearedLines } = context;
    const additionalExplosions: Array<{ x: number; y: number; color?: number }> = [];

    console.log(`🌟 MEGA CLEAR ativada em (${x}, ${y}) com cor ${color}`);
    console.log(`🌟 Linhas limpas: ${clearedLines.join(", ")}`);

    const gameWidth = 8;
    const gameHeight = 22;

    // 1. A faixa que o usuário completou já vai explodir naturalmente
    // 2. Contamina 2000 bolinhas ABAIXO da faixa com a mesma cor
    // 3. Depois essas bolinhas contaminadas vão explodir também

    // Encontra a linha mais baixa que foi limpa (faixa do usuário)
    const lowestClearedLine = Math.max(...clearedLines);

    console.log(`🌟 Linha mais baixa limpa: ${lowestClearedLine}`);
    console.log(`🌟 Contaminando 2000 bolinhas abaixo da linha ${lowestClearedLine} com cor ${color}...`);

    // Contamina 2000 bolinhas abaixo da faixa
    const contaminationCount = 2000;
    let contaminated = 0;

    // Primeiro, tenta contaminar bolinhas diretamente abaixo da faixa
    for (let attempts = 0; attempts < contaminationCount * 3 && contaminated < contaminationCount; attempts++) {
      const randomX = Math.floor(Math.random() * gameWidth);
      // Foca nas linhas abaixo da faixa limpa
      const randomY = Math.min(gameHeight - 1, lowestClearedLine + 1 + Math.floor(Math.random() * (gameHeight - lowestClearedLine - 1)));

      // Verifica se está realmente abaixo da faixa limpa
      if (randomY > lowestClearedLine) {
        // Esta bolinha vai ser "contaminada" com a cor da faixa
        // e depois vai explodir junto
        additionalExplosions.push({
          x: randomX,
          y: randomY,
          color: color, // MESMA cor da faixa = vai explodir junto!
        });
        contaminated++;
      }
    }

    console.log(`🌟 MEGA CLEAR: ${contaminated} bolinhas contaminadas com cor ${color} e vão explodir!`);

    return {
      additionalExplosions,
      scoreBonus: context.score * 5.0, // 500% bonus
      specialEffects: [`🌟 MEGA CLEAR - ${contaminated} BOLINHAS CONTAMINADAS E EXPLODIDAS!`],
    };
  }
}
