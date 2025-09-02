"use client";

// ===============================================
// ROGUELIKE SYSTEM HOOK - GERENCIAMENTO DE ESTADO
// ===============================================
// Hook principal para gerenciar o sistema Roguelike

import { useState, useCallback, useRef, useEffect } from "react";
import { RoguelikeState, PowerUpCard, ExplosionContext, ExplosionResult } from "../types/roguelike";
import { powerUpFactory } from "../systems/PowerUpFactory";

interface UseRoguelikeSystemProps {
  currentScore: number;
  onScoreBonus: (bonus: number) => void;
  onSpecialEffect: (effects: string[]) => void;
  onGamePause: (paused: boolean) => void;
}

export const useRoguelikeSystem = ({ currentScore, onScoreBonus, onSpecialEffect, onGamePause }: UseRoguelikeSystemProps) => {
  // Estado do sistema Roguelike
  const [roguelikeState, setRoguelikeState] = useState<RoguelikeState>({
    currentScore: 0,
    nextCardThreshold: 500,
    activeCards: [],
    availableCards: [],
    cardSelectionActive: false,
    selectedCards: [],
  });

  const lastScoreRef = useRef(0);

  // Verifica se deve mostrar seleção de cartas
  useEffect(() => {
    console.log(
      `🎴 ROGUELIKE DEBUG: Score atual: ${currentScore}, Threshold: ${roguelikeState.nextCardThreshold}, Último score: ${lastScoreRef.current}, Modal ativo: ${roguelikeState.cardSelectionActive}`
    );

    if (currentScore >= roguelikeState.nextCardThreshold && currentScore > lastScoreRef.current && !roguelikeState.cardSelectionActive) {
      console.log(`🎴 MODAL DE CARTAS APARECENDO! Score: ${currentScore} >= ${roguelikeState.nextCardThreshold}`);

      // Gera as 2 cartas disponíveis
      const newCards = powerUpFactory.createRandomCards(2);
      console.log(
        `🎴 Cartas geradas:`,
        newCards.map((card) => card.name)
      );

      setRoguelikeState((prev) => ({
        ...prev,
        availableCards: newCards,
        cardSelectionActive: true,
        currentScore: currentScore,
      }));

      // Pausa o jogo quando cartas aparecem
      onGamePause(true);
    }

    lastScoreRef.current = currentScore;
  }, [currentScore, roguelikeState.nextCardThreshold, roguelikeState.cardSelectionActive, onGamePause]);

  // Seleciona uma carta
  const selectCard = useCallback(
    (card: PowerUpCard) => {
      console.log(`🎴 CARTA SELECIONADA: ${card.name} (${card.type})`);

      setRoguelikeState((prev) => ({
        ...prev,
        activeCards: [...prev.activeCards, card],
        cardSelectionActive: false,
        availableCards: [],
        nextCardThreshold: prev.nextCardThreshold + 500, // próximo threshold
        selectedCards: [...prev.selectedCards, card],
      }));

      console.log(`🎴 Power-up ativo! Próximo threshold: ${roguelikeState.nextCardThreshold + 500}`);

      // Feedback visual
      onSpecialEffect([`✨ ${card.name} ativado!`]);

      // Despausa o jogo após seleção
      onGamePause(false);
    },
    [onSpecialEffect, onGamePause]
  );

  // Cancela seleção de carta
  const cancelCardSelection = useCallback(() => {
    setRoguelikeState((prev) => ({
      ...prev,
      cardSelectionActive: false,
      availableCards: [],
      nextCardThreshold: prev.nextCardThreshold + 500, // ainda avança o threshold
    }));

    // Despausa o jogo se cancelar
    onGamePause(false);
  }, [onGamePause]);

  // Aplica efeitos dos power-ups ativos
  const applyPowerUpEffects = useCallback(
    (context: ExplosionContext): ExplosionResult => {
      const { activeCards } = roguelikeState;

      if (activeCards.length === 0) {
        return {
          additionalExplosions: [],
          scoreBonus: 0,
          specialEffects: [],
        };
      }

      const totalResult: ExplosionResult = {
        additionalExplosions: [],
        scoreBonus: 0,
        specialEffects: [],
      };

      // Aplica cada power-up ativo
      activeCards.forEach((card) => {
        try {
          const result = card.effect.apply(null, context);

          // Combina resultados
          totalResult.additionalExplosions.push(...result.additionalExplosions);
          totalResult.scoreBonus += result.scoreBonus;
          if (result.specialEffects) {
            totalResult.specialEffects?.push(...result.specialEffects);
          }
        } catch (error) {
          console.error(`Erro ao aplicar power-up ${card.name}:`, error);
        }
      });

      // Aplica bonus de score
      if (totalResult.scoreBonus > 0) {
        onScoreBonus(totalResult.scoreBonus);
      }

      // Mostra efeitos especiais
      if (totalResult.specialEffects && totalResult.specialEffects.length > 0) {
        onSpecialEffect(totalResult.specialEffects);
      }

      return totalResult;
    },
    [roguelikeState.activeCards, onScoreBonus, onSpecialEffect]
  );

  // Remove um power-up (para power-ups temporários)
  const removePowerUp = useCallback((cardId: string) => {
    setRoguelikeState((prev) => ({
      ...prev,
      activeCards: prev.activeCards.filter((card) => card.id !== cardId),
    }));
  }, []);

  // Reseta o sistema (para novo jogo)
  const resetRoguelikeSystem = useCallback(() => {
    setRoguelikeState({
      currentScore: 0,
      nextCardThreshold: 500,
      activeCards: [],
      availableCards: [],
      cardSelectionActive: false,
      selectedCards: [],
    });
    lastScoreRef.current = 0;
  }, []);

  return {
    // Estado
    roguelikeState,

    // Funções
    selectCard,
    cancelCardSelection,
    applyPowerUpEffects,
    removePowerUp,
    resetRoguelikeSystem,

    // Computed properties
    hasActivePowerUps: roguelikeState.activeCards.length > 0,
    progressToNextCard: Math.min((currentScore % 500) / 500, 1),
    nextCardIn: Math.max(0, roguelikeState.nextCardThreshold - currentScore),
  };
};
