// Fixed actions only. Characters, answers and scores never enter this adapter.
export function createGameObservation(send, readConsent, modes) {
  let run = 0, open = false, currentMode;
  const emit = (event, params, action) => {
    if (readConsent() !== 'granted') return false;
    try { return send(event, params, action); } catch { return false; }
  };
  return Object.freeze({
    start(mode) {
      if (!modes.includes(mode)) return false;
      currentMode = mode; open = true; run++;
      return emit('game_start', { mode }, `run-${run}-start`);
    },
    complete() {
      if (!open) return false;
      open = false;
      return emit('game_over', { mode: currentMode, outcome: 'complete' }, `run-${run}-over`);
    },
    replay(mode) {
      if (!modes.includes(mode)) return false;
      return emit('replay', { mode }, `run-${run}-replay`);
    }
  });
}

export const gameObservation = createGameObservation(
  (event, params, action) => globalThis.KokuchijikoObservation?.send(event, params, action) ?? false,
  () => globalThis.MarketObserverConsent?.read().state ?? 'unknown',
  ['ten', 'all', 'review']
);
