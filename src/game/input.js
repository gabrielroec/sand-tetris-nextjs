import { useEffect, useRef } from "react";

export function useKeyboard({ onTogglePause, onSoftDrop }) {
  const keysRef = useRef({ left: false, right: false, rotate: false });

  useEffect(() => {
    const down = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          keysRef.current.left = true;
          break;
        case "ArrowRight":
          keysRef.current.right = true;
          break;
        case "ArrowUp":
          keysRef.current.rotate = true;
          break;
        case "ArrowDown":
          onSoftDrop?.(true);
          break;
        case "p":
        case "P":
          onTogglePause?.();
          break;
      }
    };
    const up = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          keysRef.current.left = false;
          break;
        case "ArrowRight":
          keysRef.current.right = false;
          break;
        case "ArrowUp":
          /* solta; rotação dispara no tick e é resetada */ break;
        case "ArrowDown":
          onSoftDrop?.(false);
          break;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onTogglePause, onSoftDrop]);

  return keysRef.current;
}
