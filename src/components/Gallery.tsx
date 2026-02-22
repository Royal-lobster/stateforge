'use client';

import { useStore } from '@/lib/store';
import type { State, Transition, Mode } from '@/lib/types';
import {
  CircleDot, GitBranch, Layers, Cpu,
  ArrowRight, Plus, Zap, Settings,
} from 'lucide-react';

interface Example {
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  category: string;
  states: State[];
  transitions: Transition[];
  mode: Mode;
}

// ── Classic Examples ──────────────────────────────────────────────────
const CLASSIC_EXAMPLES: Example[] = [
  {
    name: 'Even 0s',
    description: 'DFA accepting strings with even number of 0s',
    icon: CircleDot,
    category: 'DFA',
    mode: 'dfa',
    states: [
      { id: 'e0', label: 'q0', x: 200, y: 300, isInitial: true, isAccepting: true },
      { id: 'e1', label: 'q1', x: 500, y: 300, isInitial: false, isAccepting: false },
    ],
    transitions: [
      { id: 't0', from: 'e0', to: 'e1', symbols: ['0'] },
      { id: 't1', from: 'e1', to: 'e0', symbols: ['0'] },
      { id: 't2', from: 'e0', to: 'e0', symbols: ['1'] },
      { id: 't3', from: 'e1', to: 'e1', symbols: ['1'] },
    ],
  },
  {
    name: 'Ends with ab',
    description: 'DFA accepting strings ending with "ab"',
    icon: CircleDot,
    category: 'DFA',
    mode: 'dfa',
    states: [
      { id: 's0', label: 'q0', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 's1', label: 'q1', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 's2', label: 'q2', x: 650, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'ta', from: 's0', to: 's1', symbols: ['a'] },
      { id: 'tb', from: 's0', to: 's0', symbols: ['b'] },
      { id: 'tc', from: 's1', to: 's1', symbols: ['a'] },
      { id: 'td', from: 's1', to: 's2', symbols: ['b'] },
      { id: 'te', from: 's2', to: 's1', symbols: ['a'] },
      { id: 'tf', from: 's2', to: 's0', symbols: ['b'] },
    ],
  },
  {
    name: 'NFA: Contains 01',
    description: 'NFA accepting strings containing substring "01"',
    icon: GitBranch,
    category: 'NFA',
    mode: 'nfa',
    states: [
      { id: 'n0', label: 'q0', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'n1', label: 'q1', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 'n2', label: 'q2', x: 650, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'na', from: 'n0', to: 'n0', symbols: ['0', '1'] },
      { id: 'nb', from: 'n0', to: 'n1', symbols: ['0'] },
      { id: 'nc', from: 'n1', to: 'n2', symbols: ['1'] },
      { id: 'nd', from: 'n2', to: 'n2', symbols: ['0', '1'] },
    ],
  },
  {
    name: 'NFA with ε',
    description: 'NFA with epsilon transitions accepting a*b*',
    icon: GitBranch,
    category: 'NFA',
    mode: 'nfa',
    states: [
      { id: 'ne0', label: 'q0', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'ne1', label: 'q1', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 'ne2', label: 'q2', x: 650, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'nea', from: 'ne0', to: 'ne0', symbols: ['a'] },
      { id: 'neb', from: 'ne0', to: 'ne1', symbols: ['ε'] },
      { id: 'nec', from: 'ne1', to: 'ne1', symbols: ['b'] },
      { id: 'ned', from: 'ne1', to: 'ne2', symbols: ['ε'] },
    ],
  },
  {
    name: 'PDA: a^n b^n',
    description: 'PDA accepting {a^n b^n | n ≥ 0}',
    icon: Layers,
    category: 'PDA',
    mode: 'pda',
    states: [
      { id: 'p0', label: 'q0', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'p1', label: 'q1', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 'p2', label: 'q2', x: 650, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'pa', from: 'p0', to: 'p0', symbols: ['a, Z → AZ', 'a, A → AA'] },
      { id: 'pb', from: 'p0', to: 'p1', symbols: ['b, A → ε'] },
      { id: 'pc', from: 'p1', to: 'p1', symbols: ['b, A → ε'] },
      { id: 'pd', from: 'p1', to: 'p2', symbols: ['ε, Z → Z'] },
    ],
  },
  {
    name: 'TM: Binary Increment',
    description: 'Turing machine that increments a binary number',
    icon: Cpu,
    category: 'TM',
    mode: 'tm',
    states: [
      { id: 'tm0', label: 'q0', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'tm1', label: 'q1', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 'tm2', label: 'halt', x: 650, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'tma', from: 'tm0', to: 'tm0', symbols: ['0 → 0, R', '1 → 1, R'] },
      { id: 'tmb', from: 'tm0', to: 'tm1', symbols: ['⊔ → ⊔, L'] },
      { id: 'tmc', from: 'tm1', to: 'tm2', symbols: ['0 → 1, S'] },
      { id: 'tmd', from: 'tm1', to: 'tm1', symbols: ['1 → 0, L'] },
      { id: 'tme', from: 'tm1', to: 'tm2', symbols: ['⊔ → 1, S'] },
    ],
  },
];

// ── Advanced Examples ─────────────────────────────────────────────────
const ADVANCED_EXAMPLES: Example[] = [
  {
    name: 'Divisible by 3',
    description: 'DFA accepting binary numbers divisible by 3',
    icon: CircleDot,
    category: 'DFA',
    mode: 'dfa',
    states: [
      { id: 'd30', label: 'r0', x: 150, y: 300, isInitial: true, isAccepting: true },
      { id: 'd31', label: 'r1', x: 450, y: 150, isInitial: false, isAccepting: false },
      { id: 'd32', label: 'r2', x: 450, y: 450, isInitial: false, isAccepting: false },
    ],
    transitions: [
      { id: 'd3t0', from: 'd30', to: 'd30', symbols: ['0'] },
      { id: 'd3t1', from: 'd30', to: 'd31', symbols: ['1'] },
      { id: 'd3t2', from: 'd31', to: 'd32', symbols: ['0'] },
      { id: 'd3t3', from: 'd31', to: 'd30', symbols: ['1'] },
      { id: 'd3t4', from: 'd32', to: 'd31', symbols: ['0'] },
      { id: 'd3t5', from: 'd32', to: 'd32', symbols: ['1'] },
    ],
  },
  {
    name: 'Password Validator',
    description: 'DFA: accepts strings with at least one A and one 1',
    icon: CircleDot,
    category: 'DFA',
    mode: 'dfa',
    states: [
      { id: 'pv0', label: 'none', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'pv1', label: 'hasA', x: 400, y: 150, isInitial: false, isAccepting: false },
      { id: 'pv2', label: 'has1', x: 400, y: 450, isInitial: false, isAccepting: false },
      { id: 'pv3', label: 'both', x: 650, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'pvt0', from: 'pv0', to: 'pv1', symbols: ['A'] },
      { id: 'pvt1', from: 'pv0', to: 'pv2', symbols: ['1'] },
      { id: 'pvt2', from: 'pv0', to: 'pv0', symbols: ['x'] },
      { id: 'pvt3', from: 'pv1', to: 'pv1', symbols: ['A', 'x'] },
      { id: 'pvt4', from: 'pv1', to: 'pv3', symbols: ['1'] },
      { id: 'pvt5', from: 'pv2', to: 'pv2', symbols: ['1', 'x'] },
      { id: 'pvt6', from: 'pv2', to: 'pv3', symbols: ['A'] },
      { id: 'pvt7', from: 'pv3', to: 'pv3', symbols: ['A', '1', 'x'] },
    ],
  },
  {
    name: 'Starts & Ends Same',
    description: 'DFA over {a,b}: accepts if first and last symbol match',
    icon: CircleDot,
    category: 'DFA',
    mode: 'dfa',
    states: [
      { id: 'se0', label: 'q0', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'se1', label: 'sa', x: 400, y: 150, isInitial: false, isAccepting: true },
      { id: 'se2', label: 'sb', x: 400, y: 450, isInitial: false, isAccepting: true },
      { id: 'se3', label: 'sa_b', x: 650, y: 150, isInitial: false, isAccepting: false },
      { id: 'se4', label: 'sb_a', x: 650, y: 450, isInitial: false, isAccepting: false },
    ],
    transitions: [
      { id: 'set0', from: 'se0', to: 'se1', symbols: ['a'] },
      { id: 'set1', from: 'se0', to: 'se2', symbols: ['b'] },
      { id: 'set2', from: 'se1', to: 'se1', symbols: ['a'] },
      { id: 'set3', from: 'se1', to: 'se3', symbols: ['b'] },
      { id: 'set4', from: 'se3', to: 'se1', symbols: ['a'] },
      { id: 'set5', from: 'se3', to: 'se3', symbols: ['b'] },
      { id: 'set6', from: 'se2', to: 'se2', symbols: ['b'] },
      { id: 'set7', from: 'se2', to: 'se4', symbols: ['a'] },
      { id: 'set8', from: 'se4', to: 'se4', symbols: ['a'] },
      { id: 'set9', from: 'se4', to: 'se2', symbols: ['b'] },
    ],
  },
  {
    name: 'NFA: Third-from-last is 1',
    description: 'Classic NFA over {0,1}: 3rd symbol from end is 1',
    icon: GitBranch,
    category: 'NFA',
    mode: 'nfa',
    states: [
      { id: 'tl0', label: 'q0', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'tl1', label: 'q1', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 'tl2', label: 'q2', x: 650, y: 300, isInitial: false, isAccepting: false },
      { id: 'tl3', label: 'q3', x: 900, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'tlt0', from: 'tl0', to: 'tl0', symbols: ['0', '1'] },
      { id: 'tlt1', from: 'tl0', to: 'tl1', symbols: ['1'] },
      { id: 'tlt2', from: 'tl1', to: 'tl2', symbols: ['0', '1'] },
      { id: 'tlt3', from: 'tl2', to: 'tl3', symbols: ['0', '1'] },
    ],
  },
  {
    name: 'NFA: Ends with 00',
    description: 'NFA accepting strings ending with two consecutive 0s',
    icon: GitBranch,
    category: 'NFA',
    mode: 'nfa',
    states: [
      { id: 'n00_0', label: 'q0', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'n00_1', label: 'q1', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 'n00_2', label: 'q2', x: 650, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'n00t0', from: 'n00_0', to: 'n00_0', symbols: ['0', '1'] },
      { id: 'n00t1', from: 'n00_0', to: 'n00_1', symbols: ['0'] },
      { id: 'n00t2', from: 'n00_1', to: 'n00_2', symbols: ['0'] },
    ],
  },
  {
    name: 'PDA: Balanced Parens',
    description: 'PDA accepting strings of matched ( and )',
    icon: Layers,
    category: 'PDA',
    mode: 'pda',
    states: [
      { id: 'bp0', label: 'q0', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'bp1', label: 'q1', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 'bp2', label: 'q2', x: 650, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'bpt0', from: 'bp0', to: 'bp1', symbols: ['ε, Z → Z'] },
      { id: 'bpt1', from: 'bp1', to: 'bp1', symbols: ['(, Z → AZ', '(, A → AA', '), A → ε'] },
      { id: 'bpt2', from: 'bp1', to: 'bp2', symbols: ['ε, Z → Z'] },
    ],
  },
  {
    name: 'PDA: wcw^R',
    description: 'PDA accepting palindromes with center marker c',
    icon: Layers,
    category: 'PDA',
    mode: 'pda',
    states: [
      { id: 'wc0', label: 'push', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'wc1', label: 'pop', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 'wc2', label: 'acc', x: 650, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'wct0', from: 'wc0', to: 'wc0', symbols: ['a, Z → AZ', 'a, A → AA', 'a, B → AB', 'b, Z → BZ', 'b, A → BA', 'b, B → BB'] },
      { id: 'wct1', from: 'wc0', to: 'wc1', symbols: ['c, Z → Z', 'c, A → A', 'c, B → B'] },
      { id: 'wct2', from: 'wc1', to: 'wc1', symbols: ['a, A → ε', 'b, B → ε'] },
      { id: 'wct3', from: 'wc1', to: 'wc2', symbols: ['ε, Z → Z'] },
    ],
  },
  {
    name: 'PDA: Palindromes',
    description: 'PDA accepting even-length palindromes over {a,b}',
    icon: Layers,
    category: 'PDA',
    mode: 'pda',
    states: [
      { id: 'pal0', label: 'q0', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'pal1', label: 'q1', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 'pal2', label: 'q2', x: 650, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'pt0', from: 'pal0', to: 'pal0', symbols: ['a, Z → AZ', 'a, A → AA', 'a, B → AB', 'b, Z → BZ', 'b, A → BA', 'b, B → BB'] },
      { id: 'pt1', from: 'pal0', to: 'pal1', symbols: ['ε, A → A', 'ε, B → B'] },
      { id: 'pt2', from: 'pal1', to: 'pal1', symbols: ['a, A → ε', 'b, B → ε'] },
      { id: 'pt3', from: 'pal1', to: 'pal2', symbols: ['ε, Z → Z'] },
    ],
  },
  {
    name: 'TM: Unary Addition',
    description: 'Adds two unary numbers: 111+11 → 11111',
    icon: Cpu,
    category: 'TM',
    mode: 'tm',
    states: [
      { id: 'ua0', label: 'scan', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'ua1', label: 'found+', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 'ua2', label: 'clean', x: 650, y: 300, isInitial: false, isAccepting: false },
      { id: 'ua3', label: 'halt', x: 900, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'uat0', from: 'ua0', to: 'ua0', symbols: ['1 → 1, R'] },
      { id: 'uat1', from: 'ua0', to: 'ua1', symbols: ['+ → 1, R'] },
      { id: 'uat2', from: 'ua1', to: 'ua1', symbols: ['1 → 1, R'] },
      { id: 'uat3', from: 'ua1', to: 'ua2', symbols: ['⊔ → ⊔, L'] },
      { id: 'uat4', from: 'ua2', to: 'ua3', symbols: ['1 → ⊔, S'] },
    ],
  },
  {
    name: 'TM: Binary NOT',
    description: 'Turing machine that flips all bits (0↔1)',
    icon: Cpu,
    category: 'TM',
    mode: 'tm',
    states: [
      { id: 'bn0', label: 'scan', x: 200, y: 300, isInitial: true, isAccepting: false },
      { id: 'bn1', label: 'done', x: 500, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'bnt0', from: 'bn0', to: 'bn0', symbols: ['0 → 1, R', '1 → 0, R'] },
      { id: 'bnt1', from: 'bn0', to: 'bn1', symbols: ['⊔ → ⊔, S'] },
    ],
  },
  {
    name: 'TM: Copy String',
    description: 'Copies a binary string with # separator',
    icon: Cpu,
    category: 'TM',
    mode: 'tm',
    states: [
      { id: 'cs0', label: 'pick', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'cs1', label: 'carry0', x: 400, y: 200, isInitial: false, isAccepting: false },
      { id: 'cs2', label: 'carry1', x: 400, y: 400, isInitial: false, isAccepting: false },
      { id: 'cs3', label: 'return', x: 650, y: 300, isInitial: false, isAccepting: false },
      { id: 'cs4', label: 'halt', x: 900, y: 300, isInitial: false, isAccepting: true },
    ],
    transitions: [
      { id: 'cst0', from: 'cs0', to: 'cs1', symbols: ['0 → X, R'] },
      { id: 'cst1', from: 'cs0', to: 'cs2', symbols: ['1 → Y, R'] },
      { id: 'cst2', from: 'cs0', to: 'cs4', symbols: ['# → #, S'] },
      { id: 'cst3', from: 'cs1', to: 'cs1', symbols: ['0 → 0, R', '1 → 1, R', '# → #, R'] },
      { id: 'cst4', from: 'cs1', to: 'cs3', symbols: ['⊔ → 0, L'] },
      { id: 'cst5', from: 'cs2', to: 'cs2', symbols: ['0 → 0, R', '1 → 1, R', '# → #, R'] },
      { id: 'cst6', from: 'cs2', to: 'cs3', symbols: ['⊔ → 1, L'] },
      { id: 'cst7', from: 'cs3', to: 'cs3', symbols: ['0 → 0, L', '1 → 1, L', '# → #, L'] },
      { id: 'cst8', from: 'cs3', to: 'cs0', symbols: ['X → 0, R', 'Y → 1, R'] },
    ],
  },
];

// ── Transducer Examples ───────────────────────────────────────────────
const TRANSDUCER_EXAMPLES: Example[] = [
  {
    name: 'Mealy: Parity Bit',
    description: 'Outputs running parity of input stream',
    icon: Zap,
    category: 'MEALY',
    mode: 'mealy',
    states: [
      { id: 'me0', label: 'even', x: 200, y: 300, isInitial: true, isAccepting: false },
      { id: 'me1', label: 'odd', x: 500, y: 300, isInitial: false, isAccepting: false },
    ],
    transitions: [
      { id: 'met0', from: 'me0', to: 'me0', symbols: ['0/0'] },
      { id: 'met1', from: 'me0', to: 'me1', symbols: ['1/1'] },
      { id: 'met2', from: 'me1', to: 'me1', symbols: ['0/1'] },
      { id: 'met3', from: 'me1', to: 'me0', symbols: ['1/0'] },
    ],
  },
  {
    name: 'Mealy: Edge Detector',
    description: 'Outputs 1 only when input changes from previous',
    icon: Zap,
    category: 'MEALY',
    mode: 'mealy',
    states: [
      { id: 'ed0', label: 'last0', x: 200, y: 300, isInitial: true, isAccepting: false },
      { id: 'ed1', label: 'last1', x: 500, y: 300, isInitial: false, isAccepting: false },
    ],
    transitions: [
      { id: 'edt0', from: 'ed0', to: 'ed0', symbols: ['0/0'] },
      { id: 'edt1', from: 'ed0', to: 'ed1', symbols: ['1/1'] },
      { id: 'edt2', from: 'ed1', to: 'ed0', symbols: ['0/1'] },
      { id: 'edt3', from: 'ed1', to: 'ed1', symbols: ['1/0'] },
    ],
  },
  {
    name: 'Moore: Binary Counter',
    description: 'Counts input pulses mod 4',
    icon: Settings,
    category: 'MOORE',
    mode: 'moore',
    states: [
      { id: 'mo0', label: 'q0/0', x: 200, y: 200, isInitial: true, isAccepting: false },
      { id: 'mo1', label: 'q1/1', x: 500, y: 200, isInitial: false, isAccepting: false },
      { id: 'mo2', label: 'q2/2', x: 500, y: 450, isInitial: false, isAccepting: false },
      { id: 'mo3', label: 'q3/3', x: 200, y: 450, isInitial: false, isAccepting: false },
    ],
    transitions: [
      { id: 'mot0', from: 'mo0', to: 'mo1', symbols: ['1'] },
      { id: 'mot1', from: 'mo1', to: 'mo2', symbols: ['1'] },
      { id: 'mot2', from: 'mo2', to: 'mo3', symbols: ['1'] },
      { id: 'mot3', from: 'mo3', to: 'mo0', symbols: ['1'] },
    ],
  },
  {
    name: 'Moore: Sequence 01',
    description: 'Detects "01" sequence, outputs 1 when found',
    icon: Settings,
    category: 'MOORE',
    mode: 'moore',
    states: [
      { id: 'sd0', label: 'init/0', x: 150, y: 300, isInitial: true, isAccepting: false },
      { id: 'sd1', label: 'saw0/0', x: 400, y: 300, isInitial: false, isAccepting: false },
      { id: 'sd2', label: 'saw01/1', x: 650, y: 300, isInitial: false, isAccepting: false },
    ],
    transitions: [
      { id: 'sdt0', from: 'sd0', to: 'sd0', symbols: ['1'] },
      { id: 'sdt1', from: 'sd0', to: 'sd1', symbols: ['0'] },
      { id: 'sdt2', from: 'sd1', to: 'sd1', symbols: ['0'] },
      { id: 'sdt3', from: 'sd1', to: 'sd2', symbols: ['1'] },
      { id: 'sdt4', from: 'sd2', to: 'sd1', symbols: ['0'] },
      { id: 'sdt5', from: 'sd2', to: 'sd0', symbols: ['1'] },
    ],
  },
];

// ── Section config ────────────────────────────────────────────────────
const SECTIONS = [
  { title: 'Classic Examples', examples: CLASSIC_EXAMPLES },
  { title: 'Advanced Examples', examples: ADVANCED_EXAMPLES },
  { title: 'Transducers', examples: TRANSDUCER_EXAMPLES },
];

const MODE_COLORS: Record<string, string> = {
  dfa: 'var(--color-accent)',
  nfa: '#c084fc',
  pda: '#f472b6',
  tm: '#fb923c',
  mealy: '#34d399',
  moore: '#38bdf8',
};

// ── Animated background SVG ───────────────────────────────────────────
function AnimatedBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.04 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          @keyframes dash { to { stroke-dashoffset: -40; } }
          @keyframes pulse { 0%,100% { r: 4; } 50% { r: 7; } }
          .anim-line { stroke-dasharray: 8 12; animation: dash 3s linear infinite; }
          .anim-node { animation: pulse 4s ease-in-out infinite; }
        `}</style>
      </defs>
      {/* Nodes */}
      {[
        [120, 60], [320, 40], [520, 70], [720, 50], [200, 140], [440, 130], [640, 140],
        [100, 220], [360, 200], [580, 210], [780, 190],
      ].map(([cx, cy], i) => (
        <circle
          key={`n${i}`}
          cx={cx} cy={cy} r={5}
          fill="var(--color-accent)"
          className="anim-node"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
      {/* Arrows */}
      {[
        [120, 60, 320, 40], [320, 40, 520, 70], [520, 70, 720, 50],
        [120, 60, 200, 140], [320, 40, 440, 130], [520, 70, 640, 140],
        [200, 140, 440, 130], [440, 130, 640, 140],
        [100, 220, 360, 200], [360, 200, 580, 210], [580, 210, 780, 190],
        [200, 140, 360, 200], [640, 140, 580, 210],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={`l${i}`}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="var(--color-accent)"
          strokeWidth={1.5}
          className="anim-line"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </svg>
  );
}

export default function Gallery({ onSelect }: { onSelect: () => void }) {
  const loadAutomaton = useStore(s => s.loadAutomaton);

  const handleSelect = (example: Example) => {
    loadAutomaton(example.states, example.transitions, example.mode);
    onSelect();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-canvas)]">
      {/* Hero */}
      <div className="text-center py-12 md:py-20 px-4 relative overflow-hidden">
        <AnimatedBackground />
        <h1 className="font-mono text-3xl md:text-5xl font-bold tracking-wider mb-3 relative">
          <span className="text-[var(--color-accent)]">STATE</span><span className="text-[var(--color-text-bright)]">FORGE</span>
        </h1>
        <p className="font-mono text-sm text-[var(--color-text-dim)] max-w-lg mx-auto relative">
          Build, simulate, and convert finite automata — DFA, NFA, PDA, Turing machines.
        </p>
        <p className="font-mono text-xs text-[var(--color-text-muted)] mt-1.5 relative">
          Visual editor with step-by-step simulation, algorithm conversions, and URL sharing.
        </p>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 relative">
          {['DFA', 'NFA', 'PDA', 'TM', 'Mealy', 'Moore', 'CFG', 'L-Systems'].map(t => (
            <span key={t} className="font-mono text-[10px] px-2 py-0.5 border border-[var(--color-accent)]/40 text-[var(--color-accent)] bg-[var(--color-accent)]/5">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Examples */}
      <div className="max-w-4xl mx-auto px-4 pb-12 space-y-8">
        {/* Start from scratch */}
        <button
          onClick={onSelect}
          className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-left group"
        >
          <Plus size={20} className="text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors shrink-0" />
          <div>
            <div className="font-mono text-xs text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">Start from Scratch</div>
            <div className="font-mono text-[11px] text-[var(--color-text-dim)]">Empty canvas — build your own automaton</div>
          </div>
        </button>

        {SECTIONS.map(section => (
          <div key={section.title}>
            <h2 className="font-mono text-xs tracking-widest text-[var(--color-accent)] uppercase mb-3 px-1 flex items-center gap-2 font-medium">
              <span className="w-4 h-px bg-[var(--color-accent)] opacity-50" />
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {section.examples.map((ex, i) => {
                const accentColor = MODE_COLORS[ex.mode] || 'var(--color-accent)';
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(ex)}
                    className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--color-border)] hover:bg-[var(--color-accent)]/5 transition-all text-left group"
                    style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
                  >
                    <ex.icon size={18} className="transition-colors shrink-0 text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)]" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-[var(--color-text)] group-hover:text-[var(--color-text-bright)] transition-colors flex items-center gap-2">
                        {ex.name}
                        <span className="font-mono text-[9px] px-1 py-px border opacity-60" style={{ borderColor: accentColor, color: accentColor }}>
                          {ex.category}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-[var(--color-text-dim)] truncate">
                        {ex.description}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-[var(--color-border)] group-hover:text-[var(--color-accent)] transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick start */}
        <div className="border border-[var(--color-accent)]/20 bg-[var(--bg-surface)] p-4">
          <h2 className="font-mono text-xs tracking-widest text-[var(--color-accent)] uppercase mb-3 font-medium">Quick Start</h2>
          <div className="font-mono text-xs text-[var(--color-text-dim)] space-y-1.5">
            <p><span className="text-[var(--color-accent)]">Double-click</span> canvas to add states</p>
            <p>Press <span className="text-[var(--color-accent)]">T</span> then drag between states for transitions</p>
            <p><span className="text-[var(--color-accent)]">Right-click</span> states to set initial/accepting</p>
            <p><span className="text-[var(--color-accent)]">V/S/T</span> keys: Pointer, Add State, Add Transition</p>
            <p><span className="text-[var(--color-accent)]">Ctrl+Z</span> to undo, <span className="text-[var(--color-accent)]">Share</span> button encodes in URL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
