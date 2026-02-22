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

// ── Test / Benchmark (run with: npx tsx src/url.ts) ──

/* istanbul ignore next */
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('url.ts')) {
  const zlib = require('zlib');

  function encodeLegacy(states: State[], transitions: Transition[], mode: Mode, grammarText?: string): string {
    const data: SerializedAutomaton = {
      s: states.map(s => ({ i: s.id, l: s.label, x: Math.round(s.x), y: Math.round(s.y), n: s.isInitial, a: s.isAccepting })),
      t: transitions.map(t => ({ i: t.id, f: t.from, o: t.to, s: t.symbols })),
      m: mode,
      ...(grammarText ? { g: grammarText } : {}),
    };
    return lzstring.compressToEncodedURIComponent(JSON.stringify(data));
  }

  function makeState(i: number, label: string, x: number, y: number, isInitial: boolean, isAccepting: boolean): State {
    return { id: `s${i}`, label, x, y, isInitial, isAccepting };
  }
  function makeTrans(i: number, from: string, to: string, symbols: string[]): Transition {
    return { id: `t${i}`, from, to, symbols };
  }

  // ── Shannon entropy lower bound calculator ──
  // Computes the minimum bits needed to represent the automaton's information content.
  function shannonLowerBoundBits(states: State[], transitions: Transition[], mode: Mode): number {
    const log2 = Math.log2;
    const N = states.length;
    const T = transitions.length;
    let bits = 0;

    // Mode: log2(7 modes) ≈ 2.81 bits
    bits += log2(7);

    // Number of states: we need to encode N. Use log2 of reasonable max (say 256).
    bits += log2(256);

    // Per state:
    for (const s of states) {
      // Label: model as string. Each char from printable ASCII (~95 chars).
      // Length needs encoding too (assume max label 32 chars).
      bits += log2(32); // label length
      for (let c = 0; c < s.label.length; c++) {
        bits += log2(95); // each character
      }
      // x coordinate: range [0, 2000] → log2(2001) ≈ 11.0 bits
      bits += log2(2001);
      // y coordinate: range [0, 1000] → log2(1001) ≈ 10.0 bits
      bits += log2(1001);
      // 2 boolean flags
      bits += 2;
    }

    // Number of transitions
    bits += log2(256);

    // Per transition:
    for (const t of transitions) {
      // from, to: each is a state index [0, N)
      if (N > 1) bits += 2 * log2(N);
      // Number of symbols
      bits += log2(16); // max 16 symbols per transition
      for (const sym of t.symbols) {
        bits += log2(32); // symbol string length
        for (let c = 0; c < sym.length; c++) {
          bits += log2(95); // each char from printable ASCII
        }
      }
    }

    return bits;
  }

  // ── Test data ──

  const dfa_states: State[] = [
    makeState(0, 'q0', 100, 200, true, false),
    makeState(1, 'q1', 300, 200, false, false),
    makeState(2, 'q2', 500, 200, false, true),
  ];
  const dfa_trans: Transition[] = [
    makeTrans(0, 's0', 's1', ['a']),
    makeTrans(1, 's1', 's2', ['b']),
    makeTrans(2, 's0', 's0', ['b']),
    makeTrans(3, 's2', 's2', ['a', 'b']),
  ];

  const nfa_states: State[] = Array.from({ length: 10 }, (_, i) =>
    makeState(i, `q${i}`, 100 + i * 80, 200 + (i % 3) * 100, i === 0, i === 9)
  );
  const nfa_trans: Transition[] = Array.from({ length: 15 }, (_, i) =>
    makeTrans(i, `s${i % 10}`, `s${(i + 1) % 10}`, i % 5 === 0 ? ['ε'] : ['a', 'b'])
  );

  const pda_states: State[] = [
    makeState(0, 'q0', 100, 200, true, false),
    makeState(1, 'q1', 300, 200, false, false),
    makeState(2, 'q2', 500, 200, false, true),
  ];
  const pda_trans: Transition[] = [
    makeTrans(0, 's0', 's0', ['a, Z → AZ', 'a, A → AA']),
    makeTrans(1, 's0', 's1', ['b, A → ε']),
    makeTrans(2, 's1', 's1', ['b, A → ε']),
    makeTrans(3, 's1', 's2', ['ε, Z → Z']),
  ];

  const tests = [
    { name: '3-state DFA', states: dfa_states, trans: dfa_trans, mode: 'dfa' as Mode },
    { name: '10-state NFA', states: nfa_states, trans: nfa_trans, mode: 'nfa' as Mode },
    { name: 'PDA', states: pda_states, trans: pda_trans, mode: 'pda' as Mode },
  ];

  // ── Compute all formats ──

  type Row = { shannon: number; legacy: number; binRaw: number; binLz: number; binDeflate: number; chosen: number; chosenTag: string };
  const rows: Row[] = [];

  for (const t of tests) {
    const shannonBits = shannonLowerBoundBits(t.states, t.trans, t.mode);
    const shannonBytes = Math.ceil(shannonBits / 8);

    const legacy = encodeLegacy(t.states, t.trans, t.mode);
    const binary = encodeBinary(t.states, t.trans, t.mode);
    const binRawUrl = 'B' + toBase64url(binary);
    const binLzUrl = 'L' + lzstring.compressToEncodedURIComponent(String.fromCharCode(...binary));
    const deflated: Buffer = zlib.deflateRawSync(binary, { level: 9 });
    const binDeflateUrl = 'D' + toBase64url(new Uint8Array(deflated));

    const chosen = encodeAutomaton(t.states, t.trans, t.mode);

    // Round-trip all formats
    const rt1 = decodeAutomaton(binRawUrl);
    const rt2 = decodeAutomaton(binLzUrl);
    const rt3 = decodeAutomaton(binDeflateUrl);
    const rt4 = decodeAutomaton(chosen);
    const rtLegacy = decodeAutomaton(legacy);
    const allOk = [rt1, rt2, rt3, rt4, rtLegacy].every(
      d => d && d.states.length === t.states.length && d.transitions.length === t.trans.length
    );

    rows.push({
      shannon: shannonBytes,
      legacy: legacy.length,
      binRaw: binRawUrl.length,
      binLz: binLzUrl.length,
      binDeflate: binDeflateUrl.length,
      chosen: chosen.length,
      chosenTag: chosen[0] === 'D' ? 'deflate' : chosen[0] === 'L' ? 'lz' : 'raw',
    });

    if (!allOk) console.log(`❌ Round-trip FAILED for ${t.name}`);
  }

  // ── Print comparison table ──

  const names = tests.map(t => t.name);
  const pad = (s: string, n: number) => s.padEnd(n);
  const rpad = (s: string, n: number) => s.padStart(n);
  const W = 16;

  console.log('=== URL Size Comparison (chars) & Shannon Entropy Analysis ===\n');

  const header = `| ${pad('Format', 26)} | ${names.map(n => rpad(n, W)).join(' | ')} |`;
  const sep = `|${'-'.repeat(28)}|${names.map(() => '-'.repeat(W + 2)).join('|')}|`;

  console.log(header);
  console.log(sep);

  function printRow(label: string, getter: (r: Row) => number) {
    const vals = rows.map(r => {
      const v = getter(r);
      return rpad(String(v), W);
    });
    console.log(`| ${pad(label, 26)} | ${vals.join(' | ')} |`);
  }

  printRow('Shannon lower bound (bytes)', r => r.shannon);
  printRow('Old (JSON+lz-string)', r => r.legacy);
  printRow('New: binary+base64url', r => r.binRaw);
  printRow('New: binary+lz-string', r => r.binLz);
  printRow('New: binary+deflate', r => r.binDeflate);
  printRow('Chosen (best)', r => r.chosen);

  console.log();
  console.log('=== Efficiency Ratios (actual_chars / shannon_bytes — lower is better) ===\n');

  const header2 = `| ${pad('Format', 26)} | ${names.map(n => rpad(n, W)).join(' | ')} |`;
  console.log(header2);
  console.log(sep);

  function printRatio(label: string, getter: (r: Row) => number) {
    const vals = rows.map(r => rpad((getter(r) / r.shannon).toFixed(2) + 'x', W));
    console.log(`| ${pad(label, 26)} | ${vals.join(' | ')} |`);
  }

  printRatio('Old (JSON+lz-string)', r => r.legacy);
  printRatio('New: binary+base64url', r => r.binRaw);
  printRatio('New: binary+lz-string', r => r.binLz);
  printRatio('New: binary+deflate', r => r.binDeflate);
  printRatio('Chosen (best)', r => r.chosen);

  console.log();

  // Savings summary
  for (let i = 0; i < tests.length; i++) {
    const r = rows[i];
    const pct = ((1 - r.chosen / r.legacy) * 100).toFixed(1);
    console.log(`${names[i]}: ${r.legacy} → ${r.chosen} chars (${r.chosenTag}), ${pct}% smaller, ${(r.chosen / r.shannon).toFixed(2)}x Shannon`);
  }

  console.log();

  // Legacy backward compat
  const legacyHash = encodeLegacy(dfa_states, dfa_trans, 'dfa');
  const legacyDecoded = decodeAutomaton(legacyHash);
  console.log(`Legacy backward compat: ${legacyDecoded && legacyDecoded.states.length === 3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('All round-trips: ✅ PASS');
}
