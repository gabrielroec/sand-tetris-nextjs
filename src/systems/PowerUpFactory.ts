// ===============================================
// POWER-UP FACTORY - CRIAÇÃO DE CARTAS
// ===============================================
// Factory Pattern para criar cartas de forma consistente

import { PowerUpCard, PowerUpType, PowerUpRarity, PowerUpFactory, PowerUpEffect } from "../types/roguelike";

import { MegaExplosionEffect, MegaClearEffect } from "./PowerUpEffects";

export class GamePowerUpFactory implements PowerUpFactory {
  private cardTemplates: Map<PowerUpType, Omit<PowerUpCard, "id" | "effect">> = new Map([
    [
      PowerUpType.MEGA_EXPLOSION,
      {
        type: PowerUpType.MEGA_EXPLOSION,
        name: "Mega Explosão",
        description: "Explode sua faixa + 1000 bolinhas aleatórias",
        rarity: PowerUpRarity.EPIC,
        icon: "💥",
        color: "#ff4444",
      },
    ],
    [
      PowerUpType.MEGA_CLEAR,
      {
        type: PowerUpType.MEGA_CLEAR,
        name: "Mega Clear",
        description: "Contamina 2000 bolinhas abaixo com sua cor",
        rarity: PowerUpRarity.LEGENDARY,
        icon: "🌟",
        color: "#44ff44",
      },
    ],
  ]);

  private effectFactory = new Map<PowerUpType, () => PowerUpEffect>();

  constructor() {
    this.effectFactory.set(PowerUpType.MEGA_EXPLOSION, () => new MegaExplosionEffect());
    this.effectFactory.set(PowerUpType.MEGA_CLEAR, () => new MegaClearEffect());
  }

  createCard(type: PowerUpType, rarity?: PowerUpRarity): PowerUpCard {
    const template = this.cardTemplates.get(type);
    if (!template) {
      throw new Error(`PowerUp type ${type} not found`);
    }

    const effect = this.effectFactory.get(type)?.();
    if (!effect) {
      throw new Error(`Effect for type ${type} not found`);
    }

    return {
      ...template,
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rarity: rarity || template.rarity,
      effect,
    };
  }

  createRandomCards(count: number): PowerUpCard[] {
    const availableTypes = this.getAvailableTypes();
    const cards: PowerUpCard[] = [];

    for (let i = 0; i < count; i++) {
      // Weighted random baseado na raridade
      const randomType = this.getWeightedRandomType(availableTypes);
      const card = this.createCard(randomType);
      cards.push(card);
    }

    return cards;
  }

  getAvailableTypes(): PowerUpType[] {
    return Array.from(this.cardTemplates.keys());
  }

  private getWeightedRandomType(types: PowerUpType[]): PowerUpType {
    // Pesos baseados na raridade (mais comum = maior peso)
    const weights: Record<PowerUpRarity, number> = {
      [PowerUpRarity.COMMON]: 50,
      [PowerUpRarity.RARE]: 30,
      [PowerUpRarity.EPIC]: 15,
      [PowerUpRarity.LEGENDARY]: 5,
    };

    const weightedTypes: Array<{ type: PowerUpType; weight: number }> = types.map((type) => {
      const template = this.cardTemplates.get(type)!;
      return {
        type,
        weight: weights[template.rarity],
      };
    });

    const totalWeight = weightedTypes.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weightedTypes) {
      random -= item.weight;
      if (random <= 0) {
        return item.type;
      }
    }

    // Fallback
    return types[0];
  }
}

// Singleton instance
export const powerUpFactory = new GamePowerUpFactory();
