/**
 * InputManager - Gerencia todas as entradas do usuário
 * Aplica princípio SRP e facilita testes
 */
import { useEffect, useRef } from "react";

export class InputManager {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      rotate: false,
      softDrop: false,
    };
    this.callbacks = {};

    // Controle de velocidade dos controles
    this.lastMoveTime = 0;
    this.lastRotateTime = 0;
    this.moveDelay = 150; // ms entre movimentos
    this.rotateDelay = 200; // ms entre rotações
  }

  setupKeyboard(callbacks) {
    this.callbacks = callbacks;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          this.keys.left = true;
          break;
        case "ArrowRight":
          this.keys.right = true;
          break;
        case "ArrowUp":
          this.keys.rotate = true;
          break;
        case "ArrowDown":
          this.keys.softDrop = true;
          this.callbacks.onSoftDrop?.(true);
          break;
        case "p":
        case "P":
          this.callbacks.onTogglePause?.();
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          this.keys.left = false;
          break;
        case "ArrowRight":
          this.keys.right = false;
          break;
        case "ArrowUp":
          this.keys.rotate = false;
          break;
        case "ArrowDown":
          this.keys.softDrop = false;
          this.callbacks.onSoftDrop?.(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }

  getKeys() {
    const now = Date.now();
    const keys = { ...this.keys };

    // Controle de velocidade para movimento lateral
    if (keys.left || keys.right) {
      if (now - this.lastMoveTime < this.moveDelay) {
        keys.left = false;
        keys.right = false;
      } else {
        this.lastMoveTime = now;
      }
    }

    // Controle de velocidade para rotação
    if (keys.rotate) {
      if (now - this.lastRotateTime < this.rotateDelay) {
        keys.rotate = false;
      } else {
        this.lastRotateTime = now;
      }
    }

    return keys;
  }

  resetRotate() {
    this.keys.rotate = false;
  }
}

// Hook React para compatibilidade
export function useKeyboard(callbacks) {
  const inputManagerRef = useRef(new InputManager());
  const inputManager = inputManagerRef.current;

  useEffect(() => {
    return inputManager.setupKeyboard(callbacks);
  }, [callbacks, inputManager]);

  // Retorna uma função que sempre pega o estado atual das teclas
  return () => inputManager.getKeys();
}
