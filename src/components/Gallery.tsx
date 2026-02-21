'use client';

import { useStore } from '@/store';
import type { State, Transition, Mode } from '@/types';
import {
  CircleDot, GitBranch, Layers, Cpu,
  ArrowRight, Plus,
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

const EXAMPLES: Example[] = [
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

const MEALY_MOORE_EXAMPLES: Example[] = [
  {
    name: 'Mealy: Parity Bit',
    description: 'Mealy machine that outputs parity of input so far',
    icon: CircleDot,
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
    name: 'Moore: Binary Counter',
    description: 'Moore machine outputting count mod 4',
    icon: CircleDot,
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
];

const ALL_EXAMPLES = [...EXAMPLES, ...MEALY_MOORE_EXAMPLES];
const CATEGORIES = ['DFA', 'NFA', 'PDA', 'TM', 'MEALY', 'MOORE'];

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
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
          <div className="font-mono text-[11px] leading-tight text-[var(--color-accent)] whitespace-pre select-none" style={{ transform: 'rotate(-3deg) scale(1.5)', transformOrigin: 'center' }}>
            {Array(20).fill('q0 → q1 → q2 → q3 ⊢ accept\n').join('')}
          </div>
        </div>
        <h1 className="font-mono text-3xl md:text-5xl font-bold tracking-wider mb-3 relative">
          <span className="text-[var(--color-accent)]">STATE</span><span className="text-[var(--color-text-bright)]">FORGE</span>
        </h1>
        <p className="font-mono text-sm text-[var(--color-text-dim)] max-w-lg mx-auto relative">
          Build, simulate, and convert finite automata — DFA, NFA, PDA, Turing machines.
        </p>
        <p className="font-mono text-xs text-[var(--color-text-muted)] mt-2 relative">
          No install · No accounts · Just a URL
        </p>
      </div>

      {/* Examples by category */}
      <div className="max-w-4xl mx-auto px-4 pb-12 space-y-6">
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
        {CATEGORIES.map(cat => {
          const examples = ALL_EXAMPLES.filter(e => e.category === cat);
          if (examples.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="font-mono text-xs tracking-widest text-[var(--color-accent)] uppercase mb-3 px-1 flex items-center gap-2 font-medium"><span className="w-4 h-px bg-[var(--color-accent)] opacity-50" />
                {cat}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(ex)}
                    className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all text-left group"
                  >
                    <ex.icon size={20} className="text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                        {ex.name}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--color-text-dim)] truncate">
                        {ex.description}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-[var(--color-border)] group-hover:text-[var(--color-accent)] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}

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
