'use client';

import { useStore } from '@/store';
import type { State, Transition, Mode } from '@/types';
import {
  CircleDot, GitBranch, BookOpen, Layers, Cpu,
  Sparkles, ArrowRight,
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

const CATEGORIES = ['DFA', 'NFA', 'PDA', 'TM'];

export default function Gallery({ onSelect }: { onSelect: () => void }) {
  const loadAutomaton = useStore(s => s.loadAutomaton);

  const handleSelect = (example: Example) => {
    loadAutomaton(example.states, example.transitions, example.mode);
    onSelect();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-canvas)]">
      {/* Hero */}
      <div className="text-center py-8 md:py-12 px-4">
        <h1 className="font-mono text-2xl md:text-3xl font-bold text-[var(--color-accent)] tracking-wider mb-2">
          STATEFORGE
        </h1>
        <p className="font-mono text-xs text-[var(--color-text-dim)] max-w-md mx-auto">
          Build, simulate, and share automata in the browser. No install, no accounts, just a URL.
        </p>
      </div>

      {/* Examples by category */}
      <div className="max-w-4xl mx-auto px-4 pb-12 space-y-6">
        {CATEGORIES.map(cat => {
          const examples = EXAMPLES.filter(e => e.category === cat);
          if (examples.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2 px-1">
                {cat}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(ex)}
                    className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-left group"
                  >
                    <ex.icon size={20} className="text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                        {ex.name}
                      </div>
                      <div className="font-mono text-[10px] text-[var(--color-text-dim)] truncate">
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
        <div className="border border-[var(--color-border)] p-4">
          <h2 className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">Quick Start</h2>
          <div className="font-mono text-[10px] text-[var(--color-text-dim)] space-y-1">
            <p><span className="text-[var(--color-accent)]">Double-click</span> canvas to add states</p>
            <p><span className="text-[var(--color-accent)]">Drag</span> between states for transitions</p>
            <p><span className="text-[var(--color-accent)]">Right-click</span> states for initial/accepting</p>
            <p><span className="text-[var(--color-accent)]">V/S/T</span> keys: Pointer, Add State, Add Transition</p>
            <p><span className="text-[var(--color-accent)]">Share</span> button encodes automaton in URL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
