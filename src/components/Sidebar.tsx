'use client';

import { useStore } from '@/store';
import { Circle, ArrowRight, Hash, X, Share2, LayoutGrid, RotateCcw, Download, Upload, ChevronRight } from 'lucide-react';
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
  const addTrapState = useStore(s => s.addTrapState);

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
  const initialState = states.find(s => s.isInitial);
  const acceptingStates = states.filter(s => s.isAccepting);

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
        if (count > 1) dfaErrors.push(`${s.label}: multiple on '${sym}'`);
      }
    }
  }

  const handleShare = async () => {
    const hash = encodeAutomaton(states, transitions, mode);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    try { await navigator.clipboard.writeText(url); } catch { prompt('Copy this URL:', url); }
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full ${isMobile ? 'w-full' : 'w-64'}`}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--color-border)] font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase flex items-center justify-between">
        <span>Properties</span>
        {isMobile && (
          <button onClick={toggleSidebar} className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2">
            <X size={16} className="text-[var(--color-text-dim)]" />
          </button>
        )}
      </div>

      {/* Formal Definition */}
      <div className="px-3 py-2.5 border-b border-[var(--color-border)]">
        <div className="font-mono text-[11px] tracking-widest text-[var(--color-accent)] uppercase mb-2 font-medium">{mode.toUpperCase()} Definition</div>
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-start gap-2">
            <span className="text-[var(--color-text-dim)] w-6 shrink-0">Q</span>
            <span className="text-[var(--color-text)]">
              {states.length > 0 ? `{${states.map(s => s.label).join(', ')}}` : '∅'}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[var(--color-text-dim)] w-6 shrink-0">Σ</span>
            <span className="text-[var(--color-text)]">
              {alphabet.size > 0 ? `{${[...alphabet].sort().join(', ')}}` : '∅'}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[var(--color-text-dim)] w-6 shrink-0">q₀</span>
            <span className="text-[var(--color-text)]">{initialState?.label ?? '—'}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[var(--color-text-dim)] w-6 shrink-0">F</span>
            <span className="text-[var(--color-text)]">
              {acceptingStates.length > 0 ? `{${acceptingStates.map(s => s.label).join(', ')}}` : '∅'}
            </span>
          </div>
        </div>
        <div className="font-mono text-[11px] text-[var(--color-text-muted)] mt-2">
          {states.length} states · {transitions.length} transitions
        </div>
        {(mode === 'dfa' || mode === 'nfa') && states.length > 0 && (
          <button
            onClick={addTrapState}
            className="mt-2 w-full font-mono text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 px-2 py-1.5 transition-colors text-left"
          >
            + Add Trap State
          </button>
        )}
      </div>

      {/* Errors */}
      {dfaErrors.length > 0 && (
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <div className="font-mono text-[11px] tracking-widest text-[var(--color-reject)] uppercase mb-1 font-medium">Errors</div>
          {dfaErrors.map((err, i) => (
            <div key={i} className="font-mono text-[11px] text-[var(--color-reject)] py-0.5">{err}</div>
          ))}
        </div>
      )}

      {/* Mobile-only actions */}
      {isMobile && (
        <div className="border-b border-[var(--color-border)]">
          <div className="px-3 py-2 flex gap-2 flex-wrap">
            <button onClick={handleShare} className="flex items-center gap-1 px-2 py-2 font-mono text-[11px] text-[var(--color-text-dim)] active:text-[var(--color-accent)]">
              <Share2 size={14} /> SHARE
            </button>
            <button onClick={autoLayout} className="flex items-center gap-1 px-2 py-2 font-mono text-[11px] text-[var(--color-text-dim)] active:text-[var(--color-accent)]">
              <LayoutGrid size={14} /> LAYOUT
            </button>
            <button onClick={clearAll} className="flex items-center gap-1 px-2 py-2 font-mono text-[11px] text-[var(--color-text-dim)] active:text-[var(--color-accent)]">
              <RotateCcw size={14} /> CLEAR
            </button>
            <button onClick={() => {
              const data = JSON.stringify({ states, transitions, mode, _format: 'stateforge-v1' }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `stateforge-${mode}.json`; a.click();
              URL.revokeObjectURL(url);
            }} className="flex items-center gap-1 px-2 py-2 font-mono text-[11px] text-[var(--color-text-dim)] active:text-[var(--color-accent)]">
              <Download size={14} /> EXPORT
            </button>
            <button onClick={() => {
              const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,.jff';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
                const text = await file.text();
                try { const d = JSON.parse(text); if (d.states) useStore.getState().loadAutomaton(d.states, d.transitions, d.mode ?? 'dfa'); } catch {}
              };
              input.click();
            }} className="flex items-center gap-1 px-2 py-2 font-mono text-[11px] text-[var(--color-text-dim)] active:text-[var(--color-accent)]">
              <Upload size={14} /> IMPORT
            </button>
          </div>
        </div>
      )}

      {/* Selected State */}
      {selectedState && (
        <div className="px-3 py-2.5 border-b border-[var(--color-border)]">
          <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2 font-medium">Selected State</div>
          <div className="font-mono text-sm text-[var(--color-accent)] mb-2 font-semibold">{selectedState.label}</div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer min-h-[36px] md:min-h-0">
              <input type="checkbox" checked={selectedState.isInitial} onChange={() => toggleInitial(selectedState.id)} className="accent-[var(--color-accent)] w-3.5 h-3.5" />
              <span className="font-mono text-[11px] text-[var(--color-text-dim)]">Initial</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer min-h-[36px] md:min-h-0">
              <input type="checkbox" checked={selectedState.isAccepting} onChange={() => toggleAccepting(selectedState.id)} className="accent-[var(--color-accent)] w-3.5 h-3.5" />
              <span className="font-mono text-[11px] text-[var(--color-text-dim)]">Accepting</span>
            </label>
          </div>
          <button onClick={() => setEditingState(selectedState.id)} className="mt-1.5 font-mono text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors">
            Rename…
          </button>
        </div>
      )}

      {/* Selected Transition */}
      {selectedTransition && (
        <div className="px-3 py-2.5 border-b border-[var(--color-border)]">
          <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2 font-medium">Selected Transition</div>
          <div className="font-mono text-xs text-[var(--color-text)] flex items-center gap-1">
            {stateMap.get(selectedTransition.from)?.label}
            <ChevronRight size={10} className="text-[var(--color-text-dim)]" />
            {stateMap.get(selectedTransition.to)?.label}
          </div>
          <div className="font-mono text-xs text-[var(--color-accent)] mt-1 font-medium">
            {selectedTransition.symbols.join(', ')}
          </div>
          <button onClick={() => setEditingTransition(selectedTransition.id)} className="mt-1.5 font-mono text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors">
            Edit symbols…
          </button>
        </div>
      )}

      {/* Transition Table */}
      {transitions.length > 0 && (
        <div className="px-3 py-2.5 border-b border-[var(--color-border)]">
          <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2 font-medium">Transition Table (δ)</div>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-[11px]">
              <tbody>
                {transitions.map(t => (
                  <tr
                    key={t.id}
                    className={`cursor-pointer transition-colors ${selectedIds.has(t.id) ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}
                    onClick={() => setSelected(new Set([t.id]))}
                  >
                    <td className="py-0.5 pr-1 text-[var(--color-text)]">{stateMap.get(t.from)?.label}</td>
                    <td className="py-0.5 px-1 text-[var(--color-text-muted)]">→</td>
                    <td className="py-0.5 px-1 text-[var(--color-text)]">{stateMap.get(t.to)?.label}</td>
                    <td className="py-0.5 pl-1 text-[var(--color-accent)]">{t.symbols.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* States list */}
      <div className="px-3 py-2.5 flex-1 overflow-y-auto">
        <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2 font-medium">States</div>
        {states.length === 0 ? (
          <div className="font-mono text-[11px] text-[var(--color-text-muted)] italic">No states yet</div>
        ) : (
          states.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(new Set([s.id]))}
              className={`flex items-center gap-2 w-full text-left px-1 min-h-[36px] md:min-h-0 md:py-1 font-mono text-xs transition-colors ${
                selectedIds.has(s.id) ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
              }`}
            >
              <Circle size={10} className={s.isAccepting ? 'fill-current' : ''} />
              <span className="flex-1">{s.label}</span>
              {s.isInitial && <span className="text-[9px] text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-1">START</span>}
              {s.isAccepting && <span className="text-[9px] text-[var(--color-accept)] border border-[var(--color-accept)]/30 px-1">ACCEPT</span>}
            </button>
          ))
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 z-40" onClick={toggleSidebar} />
        <div className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-[var(--bg-surface)] border-l border-[var(--color-border)] z-50 flex flex-col animate-slide-in-right">
          {sidebarContent}
        </div>
      </>
    );
  }

  return (
    <div className="w-64 bg-[var(--bg-surface)] border-l border-[var(--color-border)] flex flex-col shrink-0 overflow-y-auto select-none">
      {sidebarContent}
    </div>
  );
}
