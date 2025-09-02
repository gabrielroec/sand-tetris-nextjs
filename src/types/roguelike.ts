// ===============================================
// ROGUELIKE SYSTEM - TYPES & INTERFACES
// ===============================================
// Arquitetura SOLID para sistema de cartas e power-ups

export enum PowerUpType {
  MEGA_EXPLOSION = "MEGA_EXPLOSION",
  MEGA_CLEAR = "MEGA_CLEAR",
}

export enum PowerUpRarity {
  COMMON = "COMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
}

export interface PowerUpCard {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  rarity: PowerUpRarity;
  icon: string; // emoji ou símbolo
  color: string; // cor do card
  effect: PowerUpEffect;
}

export interface PowerUpEffect {
  // Configurações do efeito
  explosionMultiplier?: number; // multiplicador de explosão
  additionalColors?: number; // cores extras que explodem
  radiusBonus?: number; // raio extra de explosão
  chainChance?: number; // chance de reação em cadeia
  scoreMultiplier?: number; // multiplicador de pontos

  // Método para aplicar o efeito
  apply(gameState: unknown, context: ExplosionContext): ExplosionResult;
}

export interface ExplosionContext {
  x: number;
  y: number;
  color: number;
  clearedLines: number[];
  score: number;
}

export interface ExplosionResult {
  additionalExplosions: Array<{ x: number; y: number; color?: number }>;
  scoreBonus: number;
  specialEffects?: string[];
}

export interface RoguelikeState {
  currentScore: number;
  nextCardThreshold: number; // próximo threshold para cartas (500, 1000, 1500...)
  activeCards: PowerUpCard[];
  availableCards: PowerUpCard[];
  cardSelectionActive: boolean;
  selectedCards: PowerUpCard[];
}

// ===============================================
// FACTORY PATTERN PARA CRIAÇÃO DE CARTAS
// ===============================================

export interface PowerUpFactory {
  createCard(type: PowerUpType, rarity?: PowerUpRarity): PowerUpCard;
  createRandomCards(count: number): PowerUpCard[];
  getAvailableTypes(): PowerUpType[];
}
