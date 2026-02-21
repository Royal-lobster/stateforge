'use client';

import { useStore } from '@/store';
import { Circle, ArrowRight, Hash } from 'lucide-react';

export default function Sidebar() {
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);
  const selectedIds = useStore(s => s.selectedIds);
  const mode = useStore(s => s.mode);
  const showSidebar = useStore(s => s.showSidebar);

  const setSelected = useStore(s => s.setSelected);
  const setEditingState = useStore(s => s.setEditingState);
  const setEditingTransition = useStore(s => s.setEditingTransition);
  const toggleAccepting = useStore(s => s.toggleAccepting);
  const toggleInitial = useStore(s => s.toggleInitial);

  if (!showSidebar) return null;

  // Derive alphabet
  const alphabet = new Set<string>();
  for (const t of transitions) {
    for (const sym of t.symbols) {
      if (sym !== 'ε') alphabet.add(sym);
    }
  }

  // Selected state details
  const selectedState = states.find(s => selectedIds.has(s.id));
  const selectedTransition = transitions.find(t => selectedIds.has(t.id));
  const stateMap = new Map(states.map(s => [s.id, s]));

  // DFA validation
  const dfaErrors: string[] = [];
  if (mode === 'dfa') {
    const initials = states.filter(s => s.isInitial);
    if (initials.length > 1) dfaErrors.push('Multiple initial states');
    for (const s of states) {
      const symCount = new Map<string, number>();
      for (const t of transitions) {
        if (t.from === s.id) {
          for (const sym of t.symbols) {
            if (sym === 'ε') dfaErrors.push(`ε-transition from ${s.label}`);
            symCount.set(sym, (symCount.get(sym) || 0) + 1);
          }
        }
      }
      for (const [sym, count] of symCount) {
        if (count > 1) dfaErrors.push(`${s.label}: multiple transitions on '${sym}'`);
      }
    }
  }

  return (
    <div className="w-56 bg-[var(--bg-surface)] border-l border-[var(--color-border)] flex flex-col shrink-0 overflow-y-auto select-none">
      {/* Properties header */}
      <div className="px-3 py-2 border-b border-[var(--color-border)] font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase">
        Properties
      </div>

      {/* Mode + Alphabet */}
      <div className="px-3 py-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 mb-1">
          <Hash size={11} className="text-[var(--color-text-dim)]" />
          <span className="font-mono text-[10px] text-[var(--color-text-dim)]">MODE</span>
          <span className="font-mono text-xs text-[var(--color-accent)] ml-auto">{mode.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-[var(--color-text-dim)]">Σ =</span>
          <span className="font-mono text-xs text-[var(--color-text)]">
            {alphabet.size > 0 ? `{${[...alphabet].sort().join(', ')}}` : '∅'}
          </span>
        </div>
        <div className="font-mono text-[10px] text-[var(--color-text-dim)] mt-1">
          {states.length} states, {transitions.length} transitions
        </div>
      </div>

      {/* DFA errors */}
      {dfaErrors.length > 0 && (
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-reject)] uppercase mb-1">Errors</div>
          {dfaErrors.map((err, i) => (
            <div key={i} className="font-mono text-[10px] text-[var(--color-reject)]">{err}</div>
          ))}
        </div>
      )}

      {/* Selected state */}
      {selectedState && (
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">Selected State</div>
          <div className="font-mono text-sm text-[var(--color-accent)] mb-2">{selectedState.label}</div>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedState.isInitial}
                onChange={() => toggleInitial(selectedState.id)}
                className="accent-[var(--color-accent)]"
              />
              <span className="font-mono text-[10px] text-[var(--color-text-dim)]">Initial</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedState.isAccepting}
                onChange={() => toggleAccepting(selectedState.id)}
                className="accent-[var(--color-accent)]"
              />
              <span className="font-mono text-[10px] text-[var(--color-text-dim)]">Accepting</span>
            </label>
          </div>
          <button
            onClick={() => setEditingState(selectedState.id)}
            className="mt-2 w-full text-left font-mono text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors"
          >
            Rename...
          </button>
        </div>
      )}

      {/* Selected transition */}
      {selectedTransition && (
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">Selected Transition</div>
          <div className="font-mono text-xs text-[var(--color-text)]">
            {stateMap.get(selectedTransition.from)?.label} → {stateMap.get(selectedTransition.to)?.label}
          </div>
          <div className="font-mono text-xs text-[var(--color-accent)] mt-1">
            {selectedTransition.symbols.join(', ')}
          </div>
          <button
            onClick={() => setEditingTransition(selectedTransition.id)}
            className="mt-2 w-full text-left font-mono text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors"
          >
            Edit symbols...
          </button>
        </div>
      )}

      {/* States list */}
      <div className="px-3 py-2 flex-1">
        <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">States</div>
        {states.map(s => (
          <button
            key={s.id}
            onClick={() => setSelected(new Set([s.id]))}
            className={`flex items-center gap-1.5 w-full text-left px-1 py-0.5 font-mono text-xs transition-colors ${
              selectedIds.has(s.id) ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
            }`}
          >
            <Circle size={8} className={s.isAccepting ? 'fill-current' : ''} />
            <span>{s.label}</span>
            {s.isInitial && <ArrowRight size={8} className="ml-auto text-[var(--color-accent)]" />}
          </button>
        ))}
      </div>
    </div>
  );
}
