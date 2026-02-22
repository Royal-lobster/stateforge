import lzstring from 'lz-string';
import type { State, Transition, Mode } from './types';

interface SerializedAutomaton {
  s: Array<{ i: string; l: string; x: number; y: number; n: boolean; a: boolean }>;
  t: Array<{ i: string; f: string; o: string; s: string[] }>;
  m: Mode;
  g?: string; // grammar text for CFG mode
}

export function encodeAutomaton(states: State[], transitions: Transition[], mode: Mode, grammarText?: string): string {
  const data: SerializedAutomaton = {
    s: states.map(s => ({ i: s.id, l: s.label, x: Math.round(s.x), y: Math.round(s.y), n: s.isInitial, a: s.isAccepting })),
    // PDA transitions survive round-trip: push/pop info is encoded in symbols[] labels (e.g. "a, Z → AZ")
    t: transitions.map(t => ({ i: t.id, f: t.from, o: t.to, s: t.symbols })),
    m: mode,
    ...(grammarText ? { g: grammarText } : {}),
  };
  return lzstring.compressToEncodedURIComponent(JSON.stringify(data));
}

export function encodeGrammar(grammarText: string): string {
  const data: SerializedAutomaton = { s: [], t: [], m: 'dfa', g: grammarText };
  return lzstring.compressToEncodedURIComponent(JSON.stringify(data));
}

export function decodeAutomaton(hash: string): { states: State[]; transitions: Transition[]; mode: Mode; grammarText?: string } | null {
  try {
    const json = lzstring.decompressFromEncodedURIComponent(hash);
    if (!json) return null;
    const data: SerializedAutomaton = JSON.parse(json);
    return {
      states: data.s.map(s => ({ id: s.i, label: s.l, x: s.x, y: s.y, isInitial: s.n, isAccepting: s.a })),
      transitions: data.t.map(t => ({ id: t.i, from: t.f, to: t.o, symbols: t.s })),
      mode: data.m,
      ...(data.g ? { grammarText: data.g } : {}),
    };
  } catch {
    return null;
  }
}

export function saveToLocalStorage(states: State[], transitions: Transition[], mode: Mode) {
  try {
    localStorage.setItem('stateforge_autosave', JSON.stringify({ states, transitions, mode }));
  } catch { /* quota exceeded, ignore */ }
}

export function loadFromLocalStorage(): { states: State[]; transitions: Transition[]; mode: Mode } | null {
  try {
    const raw = localStorage.getItem('stateforge_autosave');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
