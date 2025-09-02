"use client";

// ===============================================
// CARD SELECTION MODAL - UI ARCADE/RPG PARA SELEÇÃO DE CARTAS
// ===============================================
// Modal consistente com o estilo arcade/RPG do jogo

import React from "react";
import { PowerUpCard, PowerUpRarity } from "../types/roguelike";

interface CardSelectionModalProps {
  isOpen: boolean;
  cards: PowerUpCard[];
  onCardSelect: (card: PowerUpCard) => void;
  onClose: () => void;
}

export const CardSelectionModal: React.FC<CardSelectionModalProps> = ({ isOpen, cards, onCardSelect, onClose }) => {
  if (!isOpen) return null;

  const getRarityStyle = (rarity: PowerUpRarity) => {
    const styles = {
      [PowerUpRarity.COMMON]: {
        border: "1px solid #9ca3af",
        glow: "0 0 8px rgba(156, 163, 175, 0.3)",
        badge: "#6b7280",
      },
      [PowerUpRarity.RARE]: {
        border: "1px solid #60a5fa",
        glow: "0 0 12px rgba(96, 165, 250, 0.4)",
        badge: "#3b82f6",
      },
      [PowerUpRarity.EPIC]: {
        border: "1px solid #a78bfa",
        glow: "0 0 16px rgba(167, 139, 250, 0.5)",
        badge: "#8b5cf6",
      },
      [PowerUpRarity.LEGENDARY]: {
        border: "1px solid #fbbf24",
        glow: "0 0 20px rgba(251, 191, 36, 0.6)",
        badge: "#f59e0b",
      },
    };
    return styles[rarity];
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="overlay"
        style={{
          position: "fixed",
          zIndex: 100,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Modal Principal */}
      <div
        className="overlay"
        style={{
          position: "fixed",
          zIndex: 101,
          pointerEvents: "none",
        }}
      >
        <div
          className="panel"
          style={{
            textAlign: "center",
            maxWidth: "900px",
            margin: "0 16px",
            pointerEvents: "all",
            border: "2px solid #a78bfa",
            boxShadow: "0 0 32px rgba(167, 139, 250, 0.4)",
          }}
        >
          {/* Header Arcade */}
          <div className="marquee" style={{ marginBottom: "20px", fontSize: "18px" }}>
            🎴 POWER-UP SELECTION 🎴
          </div>

          <h2
            style={{
              fontSize: "28px",
              fontWeight: "800",
              marginBottom: "8px",
              color: "#fbbf24",
              textShadow: "0 0 12px rgba(251, 191, 36, 0.5)",
            }}
          >
            ESCOLHA SEU PODER!
          </h2>

          <p className="muted" style={{ marginBottom: "24px", fontSize: "14px" }}>
            Selecione uma carta para aprimorar suas habilidades
          </p>

          {/* Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {cards.map((card) => {
              const rarityStyle = getRarityStyle(card.rarity);
              return (
                <div
                  key={card.id}
                  className="panel"
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    border: rarityStyle.border,
                    boxShadow: `0 10px 40px rgba(0, 0, 0, 0.35), ${rarityStyle.glow}`,
                    position: "relative",
                    minHeight: "200px",
                  }}
                  onClick={() => onCardSelect(card)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = `0 15px 50px rgba(0, 0, 0, 0.45), ${rarityStyle.glow}, 0 0 32px rgba(255, 255, 255, 0.1)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = `0 10px 40px rgba(0, 0, 0, 0.35), ${rarityStyle.glow}`;
                  }}
                >
                  {/* Rarity Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      backgroundColor: rarityStyle.badge,
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      fontSize: "10px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    {card.rarity}
                  </div>

                  {/* Card Icon */}
                  <div
                    style={{
                      fontSize: "48px",
                      marginBottom: "12px",
                      filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))",
                    }}
                  >
                    {card.icon}
                  </div>

                  {/* Card Name */}
                  <div className="label" style={{ marginBottom: "8px", fontSize: "16px", fontWeight: "700" }}>
                    {card.name}
                  </div>

                  {/* Card Description */}
                  <p
                    className="muted"
                    style={{
                      fontSize: "12px",
                      lineHeight: "1.4",
                      margin: "0",
                      padding: "0 8px",
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="muted" style={{ marginBottom: "16px", fontSize: "12px" }}>
            💡 Dica: Raridades mais altas = poderes mais devastadores!
          </div>

          <button
            className="btn"
            onClick={onClose}
            style={{
              background: "#f5950866",
              marginTop: "8px",
              fontSize: "14px",
            }}
          >
            Pular Seleção
          </button>
        </div>
      </div>
    </>
  );
};
