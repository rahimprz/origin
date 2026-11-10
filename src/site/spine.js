// A tiny store for the sticky spine: which section of the series is open now.
import { useSyncExternalStore } from 'react';

let state = { no: '01', title: 'Where it begins', ink: 'house' };
const listeners = new Set();

export function setSpine(next) {
  if (next.no === state.no && next.title === state.title && next.ink === state.ink) return;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function useSpine() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}
