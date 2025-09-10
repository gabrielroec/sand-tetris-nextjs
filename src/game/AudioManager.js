/**
 * AudioManager - Gerencia todos os efeitos sonoros do jogo
 * Usa Web Audio API para criar sons proceduralmente
 */
export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterVolume = 0.3;
    this.sfxVolume = 0.5;
    this.muted = false;

    // Cache de sons
    this.sounds = new Map();

    // Inicializa o contexto de áudio
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn("Web Audio API não suportada:", error);
    }
  }

  // Cria um tom simples
  createTone(frequency, duration, type = "sine", volume = 1) {
    if (!this.audioContext || this.muted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    // Envelope de volume
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * this.masterVolume * this.sfxVolume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Cria um som com múltiplas frequências (chord)
  createChord(frequencies, duration, type = "sine", volume = 1) {
    if (!this.audioContext || this.muted) return;

    frequencies.forEach((freq) => {
      this.createTone(freq, duration, type, volume / frequencies.length);
    });
  }

  // Cria um som de ruído (para efeitos especiais)
  createNoise(duration, volume = 1) {
    if (!this.audioContext || this.muted) return;

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * volume;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(volume * this.masterVolume * this.sfxVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    source.start();
  }

  // Efeitos sonoros específicos do jogo
  playMove() {
    this.createTone(220, 0.1, "square", 0.3);
  }

  playRotate() {
    this.createChord([330, 440], 0.15, "sine", 0.4);
  }

  playSoftDrop() {
    this.createTone(110, 0.1, "sawtooth", 0.2);
  }

  playLand() {
    this.createChord([220, 165, 110], 0.2, "triangle", 0.5);
  }

  playLineClear(lines) {
    // Som diferente baseado no número de linhas
    const frequencies = [440, 554, 659, 740];
    const chord = frequencies.slice(0, Math.min(lines, 4));
    this.createChord(chord, 0.3, "sine", 0.6);
  }

  playCombo(combo) {
    // Som de combo com frequência crescente
    const frequency = 220 + combo * 50;
    this.createTone(frequency, 0.2, "sine", 0.4);
  }

  playLevelUp() {
    // Som de subida de nível
    const frequencies = [220, 277, 330, 440, 554, 659];
    this.createChord(frequencies, 0.5, "sine", 0.7);
  }

  playGameOver() {
    // Som de game over descendente
    const frequencies = [440, 392, 349, 294, 262, 220];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createTone(freq, 0.3, "triangle", 0.5);
      }, index * 100);
    });
  }

  playPause() {
    this.createTone(330, 0.2, "sine", 0.3);
  }

  playButtonClick() {
    this.createTone(440, 0.1, "square", 0.2);
  }

  // Controles de áudio
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Resumo do contexto de áudio (para mobile)
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }
}

// Instância global do AudioManager
export const audioManager = new AudioManager();
