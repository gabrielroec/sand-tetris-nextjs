import { track } from "@vercel/analytics";

export const useAnalytics = () => {
  const trackGameStart = () => {
    track("game_start", {
      game: "sand-tetris",
      timestamp: new Date().toISOString(),
    });
  };

  const trackGameOver = (score, level, timePlayed) => {
    track("game_over", {
      game: "sand-tetris",
      score,
      level,
      timePlayed,
      timestamp: new Date().toISOString(),
    });
  };

  const trackLevelUp = (level, score) => {
    track("level_up", {
      game: "sand-tetris",
      level,
      score,
      timestamp: new Date().toISOString(),
    });
  };

  const trackLineClear = (linesCleared, score, level) => {
    track("line_clear", {
      game: "sand-tetris",
      linesCleared,
      score,
      level,
      timestamp: new Date().toISOString(),
    });
  };

  const trackAirplaneMode = (score, hits, timeRemaining) => {
    track("airplane_mode", {
      game: "sand-tetris",
      score,
      hits,
      timeRemaining,
      timestamp: new Date().toISOString(),
    });
  };

  const trackSettingsChange = (setting, value) => {
    track("settings_change", {
      game: "sand-tetris",
      setting,
      value,
      timestamp: new Date().toISOString(),
    });
  };

  const trackPause = () => {
    track("game_pause", {
      game: "sand-tetris",
      timestamp: new Date().toISOString(),
    });
  };

  const trackResume = () => {
    track("game_resume", {
      game: "sand-tetris",
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackGameStart,
    trackGameOver,
    trackLevelUp,
    trackLineClear,
    trackAirplaneMode,
    trackSettingsChange,
    trackPause,
    trackResume,
  };
};
