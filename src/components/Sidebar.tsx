'use client';

import { useStore } from '@/store';
import { Circle, ArrowRight, Hash, X, Share2, LayoutGrid, RotateCcw } from 'lucide-react';
import { encodeAutomaton } from '@/url';

export default function Sidebar({ isMobile }: { isMobile: boolean }) {
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
  const toggleSidebar = useStore(s => s.toggleSidebar);
  const autoLayout = useStore(s => s.autoLayout);
  const clearAll = useStore(s => s.clearAll);

  if (!showSidebar) return null;

  const alphabet = new Set<string>();
  for (const t of transitions) {
    for (const sym of t.symbols) {
      if (sym !== 'ε') alphabet.add(sym);
    }
  }

  const selectedState = states.find(s => selectedIds.has(s.id));
  const selectedTransition = transitions.find(t => selectedIds.has(t.id));
  const stateMap = new Map(states.map(s => [s.id, s]));

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

  const handleShare = () => {
    const hash = encodeAutomaton(states, transitions, mode);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    navigator.clipboard.writeText(url);
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full ${isMobile ? 'w-full' : 'w-56'}`}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--color-border)] font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase flex items-center justify-between">
        <span>Properties</span>
        {isMobile && (
          <button onClick={toggleSidebar} className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2">
            <X size={16} className="text-[var(--color-text-dim)]" />
          </button>
        )}
      </div>

      {/* Mode + Alphabet */}
      <div className="px-3 py-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 mb-1">
          <Hash size={11} className="text-[var(--color-text-dim)]" />
          <span className="font-mono text-[11px] text-[var(--color-text-dim)]">MODE</span>
          <span className="font-mono text-xs text-[var(--color-accent)] ml-auto">{mode.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] text-[var(--color-text-dim)]">Σ =</span>
          <span className="font-mono text-xs text-[var(--color-text)]">
            {alphabet.size > 0 ? `{${[...alphabet].sort().join(', ')}}` : '∅'}
          </span>
        </div>
        <div className="font-mono text-[11px] text-[var(--color-text-dim)] mt-1">
          {states.length} states, {transitions.length} transitions
        </div>
      </div>

      {/* Mobile-only actions */}
      {isMobile && (
        <div className="px-3 py-2 border-b border-[var(--color-border)] flex gap-2">
          <button onClick={handleShare} className="flex items-center gap-1 px-2 py-2 font-mono text-[11px] text-[var(--color-text-dim)] active:text-[var(--color-accent)]">
            <Share2 size={14} /> SHARE
          </button>
          <button onClick={autoLayout} className="flex items-center gap-1 px-2 py-2 font-mono text-[11px] text-[var(--color-text-dim)] active:text-[var(--color-accent)]">
            <LayoutGrid size={14} /> LAYOUT
          </button>
          <button onClick={clearAll} className="flex items-center gap-1 px-2 py-2 font-mono text-[11px] text-[var(--color-text-dim)] active:text-[var(--color-accent)]">
            <RotateCcw size={14} /> CLEAR
          </button>
        </div>
      )}

      {dfaErrors.length > 0 && (
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <div className="font-mono text-[11px] tracking-widest text-[var(--color-reject)] uppercase mb-1">Errors</div>
          {dfaErrors.map((err, i) => (
            <div key={i} className="font-mono text-[11px] text-[var(--color-reject)]">{err}</div>
          ))}
        </div>
      )}

      {selectedState && (
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">Selected State</div>
          <div className="font-mono text-sm text-[var(--color-accent)] mb-2">{selectedState.label}</div>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] md:min-h-0">
              <input type="checkbox" checked={selectedState.isInitial} onChange={() => toggleInitial(selectedState.id)} className="accent-[var(--color-accent)] w-4 h-4" />
              <span className="font-mono text-[11px] text-[var(--color-text-dim)]">Initial</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] md:min-h-0">
              <input type="checkbox" checked={selectedState.isAccepting} onChange={() => toggleAccepting(selectedState.id)} className="accent-[var(--color-accent)] w-4 h-4" />
              <span className="font-mono text-[11px] text-[var(--color-text-dim)]">Accepting</span>
            </label>
          </div>
          <button
            onClick={() => setEditingState(selectedState.id)}
            className="mt-2 w-full text-left font-mono text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] min-h-[44px] md:min-h-0 flex items-center"
          >
            Rename...
          </button>
        </div>
      )}

      {selectedTransition && (
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">Selected Transition</div>
          <div className="font-mono text-xs text-[var(--color-text)]">
            {stateMap.get(selectedTransition.from)?.label} → {stateMap.get(selectedTransition.to)?.label}
          </div>
          <div className="font-mono text-xs text-[var(--color-accent)] mt-1">
            {selectedTransition.symbols.join(', ')}
          </div>
          <button
            onClick={() => setEditingTransition(selectedTransition.id)}
            className="mt-2 w-full text-left font-mono text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] min-h-[44px] md:min-h-0 flex items-center"
          >
            Edit symbols...
          </button>
        </div>
      )}

      {/* States list */}
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">States</div>
        {states.map(s => (
          <button
            key={s.id}
            onClick={() => setSelected(new Set([s.id]))}
            className={`flex items-center gap-1.5 w-full text-left px-1 min-h-[44px] md:min-h-0 md:py-0.5 font-mono text-xs transition-colors ${
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

  // Mobile: slide-in drawer from right with overlay
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={toggleSidebar}
        />
        {/* Drawer */}
        <div className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-[var(--bg-surface)] border-l border-[var(--color-border)] z-50 flex flex-col animate-slide-in-right">
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop: inline sidebar
  return (
    <div className="w-56 bg-[var(--bg-surface)] border-l border-[var(--color-border)] flex flex-col shrink-0 overflow-y-auto select-none">
      {sidebarContent}
    </div>
  );
}
