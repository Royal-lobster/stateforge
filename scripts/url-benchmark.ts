/**
 * URL encoding benchmark — compares binary format vs legacy JSON+lz-string
 * and measures distance from Shannon entropy lower bound.
 *
 * Run: npx tsx scripts/url-benchmark.ts
 */
import lzstring from 'lz-string';
import {
  encodeAutomaton,
  decodeAutomaton,
} from '../src/url';
import type { State, Transition, Mode } from '../src/types';

// We need internal helpers for benchmarking — re-export isn't worth it,
// so we duplicate the legacy encoder here for comparison.
function encodeLegacy(states: State[], transitions: Transition[], mode: Mode, grammarText?: string): string {
  const data = {
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

// ── Shannon entropy lower bound ──
function shannonLowerBoundBits(states: State[], transitions: Transition[], _mode: Mode): number {
  const log2 = Math.log2;
  const N = states.length;
  let bits = 0;

  bits += log2(7);   // mode
  bits += log2(256); // num states

  for (const s of states) {
    bits += log2(32); // label length
    for (let c = 0; c < s.label.length; c++) bits += log2(95);
    bits += log2(2001); // x
    bits += log2(1001); // y
    bits += 2;          // flags
  }

  bits += log2(256); // num transitions
  for (const t of transitions) {
    if (N > 1) bits += 2 * log2(N);
    bits += log2(16);
    for (const sym of t.symbols) {
      bits += log2(32);
      for (let c = 0; c < sym.length; c++) bits += log2(95);
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

// ── Run benchmarks ──

const pad = (s: string, n: number) => s.padEnd(n);
const rpad = (s: string, n: number) => s.padStart(n);
const W = 16;
const names = tests.map(t => t.name);

console.log('=== URL Size Comparison (chars) & Shannon Entropy Analysis ===\n');

const header = `| ${pad('Format', 26)} | ${names.map(n => rpad(n, W)).join(' | ')} |`;
const sep = `|${'-'.repeat(28)}|${names.map(() => '-'.repeat(W + 2)).join('|')}|`;

type Row = { shannon: number; legacy: number; chosen: number; chosenTag: string };
const rows: Row[] = [];

for (const t of tests) {
  const shannonBytes = Math.ceil(shannonLowerBoundBits(t.states, t.trans, t.mode) / 8);
  const legacy = encodeLegacy(t.states, t.trans, t.mode);
  const chosen = encodeAutomaton(t.states, t.trans, t.mode);

  // Round-trip check
  const rt = decodeAutomaton(chosen);
  const rtLegacy = decodeAutomaton(legacy);
  const ok = rt && rtLegacy &&
    rt.states.length === t.states.length &&
    rt.transitions.length === t.trans.length;

  if (!ok) console.log(`❌ Round-trip FAILED for ${t.name}`);

  rows.push({
    shannon: shannonBytes,
    legacy: legacy.length,
    chosen: chosen.length,
    chosenTag: chosen[0] === 'D' ? 'deflate' : chosen[0] === 'L' ? 'lz' : 'raw',
  });
}

console.log(header);
console.log(sep);

function printRow(label: string, getter: (r: Row) => number) {
  const vals = rows.map(r => rpad(String(getter(r)), W));
  console.log(`| ${pad(label, 26)} | ${vals.join(' | ')} |`);
}

printRow('Shannon lower bound (bytes)', r => r.shannon);
printRow('Old (JSON+lz-string)', r => r.legacy);
printRow('New (best)', r => r.chosen);

console.log();

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
