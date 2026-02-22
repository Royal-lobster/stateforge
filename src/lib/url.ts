import lzstring from 'lz-string';
import type { State, Transition, Mode } from './types';

interface SerializedAutomaton {
  s: Array<{ i: string; l: string; x: number; y: number; n: boolean; a: boolean }>;
  t: Array<{ i: string; f: string; o: string; s: string[] }>;
  m: Mode;
  g?: string;
}

// ── Mode enum mapping ──
const MODE_TO_BYTE: Record<Mode, number> = { dfa: 0, nfa: 1, grammar: 2, pda: 3, tm: 4, mealy: 5, moore: 6 };
const BYTE_TO_MODE: Mode[] = ['dfa', 'nfa', 'grammar', 'pda', 'tm', 'mealy', 'moore'];

const BINARY_VERSION = 0x01;

// ── Varint helpers ──

function encodeVarint(buf: number[], value: number) {
  value = value >>> 0; // ensure unsigned 32-bit
  while (value > 0x7f) {
    buf.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  buf.push(value & 0x7f);
}

function decodeVarint(buf: Uint8Array, offset: number): [number, number] {
  let result = 0, shift = 0;
  while (offset < buf.length) {
    const b = buf[offset++];
    result |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) return [result >>> 0, offset];
    shift += 7;
  }
  throw new Error('varint overflow');
}

function zigzagEncode(n: number): number {
  return (n << 1) ^ (n >> 31);
}

function zigzagDecode(n: number): number {
  return (n >>> 1) ^ -(n & 1);
}

function encodeSignedVarint(buf: number[], value: number) {
  encodeVarint(buf, zigzagEncode(value));
}

function decodeSignedVarint(buf: Uint8Array, offset: number): [number, number] {
  const [v, off] = decodeVarint(buf, offset);
  return [zigzagDecode(v), off];
}

// ── String encoding ──

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function encodeString(buf: number[], s: string) {
  const bytes = textEncoder.encode(s);
  encodeVarint(buf, bytes.length);
  for (let i = 0; i < bytes.length; i++) buf.push(bytes[i]);
}

function decodeString(buf: Uint8Array, offset: number): [string, number] {
  const [len, off] = decodeVarint(buf, offset);
  const str = textDecoder.decode(buf.subarray(off, off + len));
  return [str, off + len];
}

// ── Base64url ──

function toBase64url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const binary = atob(s);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf;
}

// ── Binary encode ──

function encodeBinary(states: State[], transitions: Transition[], mode: Mode, grammarText?: string): Uint8Array {
  const buf: number[] = [];

  // Version + mode
  buf.push(BINARY_VERSION);
  buf.push(MODE_TO_BYTE[mode] ?? 0);

  // Build state ID → index map
  const stateIndex = new Map<string, number>();
  states.forEach((s, i) => stateIndex.set(s.id, i));

  // States
  encodeVarint(buf, states.length);
  for (const s of states) {
    const flags = (s.isInitial ? 1 : 0) | (s.isAccepting ? 2 : 0);
    buf.push(flags);
    encodeString(buf, s.label);
    encodeSignedVarint(buf, Math.round(s.x));
    encodeSignedVarint(buf, Math.round(s.y));
  }

  // Transitions
  encodeVarint(buf, transitions.length);
  for (const t of transitions) {
    encodeVarint(buf, stateIndex.get(t.from) ?? 0);
    encodeVarint(buf, stateIndex.get(t.to) ?? 0);
    encodeVarint(buf, t.symbols.length);
    for (const sym of t.symbols) encodeString(buf, sym);
  }

  // Grammar text (optional)
  if (grammarText) {
    buf.push(1); // has grammar
    encodeString(buf, grammarText);
  } else {
    buf.push(0);
  }

  return new Uint8Array(buf);
}

// ── Binary decode ──

function decodeBinary(buf: Uint8Array): { states: State[]; transitions: Transition[]; mode: Mode; grammarText?: string } {
  let off = 0;
  // skip version byte (already checked)
  off = 1;
  const mode = BYTE_TO_MODE[buf[off++]] ?? 'dfa';

  // States
  let numStates: number;
  [numStates, off] = decodeVarint(buf, off);
  const states: State[] = [];
  const stateIds: string[] = [];
  for (let i = 0; i < numStates; i++) {
    const flags = buf[off++];
    let label: string;
    [label, off] = decodeString(buf, off);
    let x: number, y: number;
    [x, off] = decodeSignedVarint(buf, off);
    [y, off] = decodeSignedVarint(buf, off);
    const id = `s${i}`;
    stateIds.push(id);
    states.push({ id, label, x, y, isInitial: !!(flags & 1), isAccepting: !!(flags & 2) });
  }

  // Transitions
  let numTrans: number;
  [numTrans, off] = decodeVarint(buf, off);
  const transitions: Transition[] = [];
  for (let i = 0; i < numTrans; i++) {
    let fromIdx: number, toIdx: number, numSym: number;
    [fromIdx, off] = decodeVarint(buf, off);
    [toIdx, off] = decodeVarint(buf, off);
    [numSym, off] = decodeVarint(buf, off);
    const symbols: string[] = [];
    for (let j = 0; j < numSym; j++) {
      let sym: string;
      [sym, off] = decodeString(buf, off);
      symbols.push(sym);
    }
    transitions.push({ id: `t${i}`, from: stateIds[fromIdx], to: stateIds[toIdx], symbols });
  }

  // Grammar
  let grammarText: string | undefined;
  if (off < buf.length && buf[off++] === 1) {
    [grammarText, off] = decodeString(buf, off);
  }

  return { states, transitions, mode, ...(grammarText ? { grammarText } : {}) };
}

// ── Public API ──

export function encodeAutomaton(states: State[], transitions: Transition[], mode: Mode, grammarText?: string): string {
  const binary = encodeBinary(states, transitions, mode, grammarText);

  // Compare raw base64url vs lz-string compressed binary vs deflate+base64url
  const raw = toBase64url(binary);
  const lzCompressed = lzstring.compressToEncodedURIComponent(
    String.fromCharCode(...binary)
  );

  let deflated = '';
  try {
    // Use Node.js zlib if available (SSR / tests), otherwise skip.
    // Browser uses async deflate in encodeAutomatonAsync below.
    const zlib = typeof require !== 'undefined' ? require('zlib') : null;
    if (zlib?.deflateRawSync) {
      const compressed: Buffer = zlib.deflateRawSync(binary, { level: 9 });
      deflated = toBase64url(new Uint8Array(compressed));
    }
  } catch { /* no zlib — lz-string fallback */ }

  // Pick shortest. Prefixes: B=raw base64url, L=lz-compressed, D=deflate+base64url
  let best = 'B' + raw;
  if (lzCompressed.length + 1 < best.length) best = 'L' + lzCompressed;
  if (deflated && deflated.length + 1 < best.length) best = 'D' + deflated;
  return best;
}

export function encodeGrammar(grammarText: string): string {
  return encodeAutomaton([], [], 'dfa', grammarText);
}

export function decodeAutomaton(hash: string): { states: State[]; transitions: Transition[]; mode: Mode; grammarText?: string } | null {
  try {
    if (!hash || hash.length === 0) return null;

    const prefix = hash[0];

    // New binary format: 'B' prefix = raw base64url, 'L' prefix = lz-compressed binary
    if (prefix === 'B') {
      const buf = fromBase64url(hash.slice(1));
      if (buf[0] === BINARY_VERSION) return decodeBinary(buf);
    }

    if (prefix === 'D') {
      try {
        const zlib = typeof require !== 'undefined' ? require('zlib') : null;
        if (zlib) {
          const compressed = fromBase64url(hash.slice(1));
          const buf: Buffer = zlib.inflateRawSync(compressed);
          const arr = new Uint8Array(buf);
          if (arr[0] === BINARY_VERSION) return decodeBinary(arr);
        }
      } catch { /* fall through */ }
    }

    if (prefix === 'L') {
      const decompressed = lzstring.decompressFromEncodedURIComponent(hash.slice(1));
      if (decompressed) {
        const buf = new Uint8Array(decompressed.length);
        for (let i = 0; i < decompressed.length; i++) buf[i] = decompressed.charCodeAt(i);
        if (buf[0] === BINARY_VERSION) return decodeBinary(buf);
      }
    }

    // Legacy format: lz-string compressed JSON (no prefix)
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

