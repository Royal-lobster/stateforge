'use client';

import { useState, useRef, useCallback } from 'react';
import { useStore } from '@/store';
import { Play, StepForward, FastForward, RotateCcw, ListChecks, GripHorizontal, Zap } from 'lucide-react';
import Tooltip from './Tooltip';

export default function SimPanel({ isMobile }: { isMobile: boolean }) {
  const showSimPanel = useStore(s => s.showSimPanel);
  const simInput = useStore(s => s.simInput);
  const simStatus = useStore(s => s.simStatus);
  const simConsumed = useStore(s => s.simConsumed);
  const simRemaining = useStore(s => s.simRemaining);
  const simCurrentStates = useStore(s => s.simCurrentStates);
  const multiRunResults = useStore(s => s.multiRunResults);
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);
  const mode = useStore(s => s.mode);

  const setSimInput = useStore(s => s.setSimInput);
  const simStart = useStore(s => s.simStart);
  const simStep = useStore(s => s.simStep);
  const simFastRun = useStore(s => s.simFastRun);
  const simReset = useStore(s => s.simReset);
  const simMultiRun = useStore(s => s.simMultiRun);

  const [multiInput, setMultiInput] = useState('');
  const [showMulti, setShowMulti] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const touchStartY = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (dy > 40) setMobileExpanded(true);
    if (dy < -40) setMobileExpanded(false);
  }, []);

  if (!showSimPanel) return null;

  const hasInitial = states.some(s => s.isInitial);
  const stateMap = new Map(states.map(s => [s.id, s]));
  const activeLabels = [...simCurrentStates].map(id => stateMap.get(id)?.label).filter(Boolean);

  const statusColor =
    simStatus === 'accepted' ? 'var(--color-accept)' :
    simStatus === 'rejected' ? 'var(--color-reject)' :
    simStatus === 'stepping' ? 'var(--color-sim-active)' :
    'var(--color-text-muted)';

  const statusText =
    simStatus === 'accepted' ? 'ACCEPTED' :
    simStatus === 'rejected' && !hasInitial ? 'NO INITIAL STATE' :
    simStatus === 'rejected' ? 'REJECTED' :
    simStatus === 'stepping' ? 'STEPPING' :
    'IDLE';

  const handleMultiRun = () => {
    const inputs = multiInput.split('\n').map(s => s.trim()).filter(Boolean);
    simMultiRun(inputs);
  };

  const controlBtn = (onClick: () => void, disabled: boolean, title: string, icon: React.ReactNode, shortcut?: string) => (
    <Tooltip label={title} shortcut={shortcut} position="top">
      <button onClick={onClick} disabled={disabled} aria-label={title}
        className="p-1.5 flex items-center justify-center text-[var(--color-text-dim)] hover:text-[var(--color-accent)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
        {icon}
      </button>
    </Tooltip>
  );

  // Mobile bottom sheet
  if (isMobile) {
    return (
      <div className="bg-[var(--bg-surface-raised)] border-t border-[var(--color-border)] shadow-panel shrink-0 select-none">
        {/* Header: status + mode toggle */}
        <div className="px-3 py-1.5 flex items-center gap-2 border-b border-[var(--color-border)]/50">
          <Zap size={10} className="text-[var(--color-accent)] shrink-0" />
          <span className="font-mono text-[11px] font-bold" style={{ color: statusColor }}>{statusText}</span>
          <div className="flex-1" />
          <button onClick={() => setShowMulti(false)} className={`font-mono text-[11px] px-2 py-0.5 ${!showMulti ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'text-[var(--color-text-dim)]'}`}>Single</button>
          <button onClick={() => setShowMulti(true)} className={`font-mono text-[11px] px-2 py-0.5 ${showMulti ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'text-[var(--color-text-dim)]'}`}>Multi</button>
        </div>

        {!showMulti ? (
          <div className="p-2.5 flex flex-col gap-2">
            {/* Input + controls in one row */}
            <div className="flex items-center gap-1">
              <input value={simInput} onChange={e => setSimInput(e.target.value)} disabled={simStatus === 'stepping'}
                className="flex-1 min-w-0 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1.5 outline-none focus:border-[var(--color-accent)]"
                placeholder="Input..."
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); simStatus === 'idle' ? simStart() : simStep(); }}} />
              <div className="flex items-center gap-0 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] shrink-0">
                <button onClick={simStart} disabled={simStatus === 'stepping'} className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><Play size={13} /></button>
                <button onClick={simStep} disabled={simStatus !== 'stepping'} className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><StepForward size={13} /></button>
                <button onClick={simFastRun} disabled={simStatus === 'stepping'} className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><FastForward size={13} /></button>
                <button onClick={simReset} className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={13} /></button>
              </div>
            </div>
            {/* Tape + result */}
            {simStatus !== 'idle' && (
              <div className="flex items-center gap-0 font-mono text-xs overflow-x-auto">
                {[...simConsumed].map((ch, i) => (
                  <span key={`c${i}`} className="w-6 h-6 flex items-center justify-center bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text-dim)] shrink-0">{ch}</span>
                ))}
                {[...simRemaining].map((ch, i) => (
                  <span key={`r${i}`} className={`w-6 h-6 flex items-center justify-center border border-[var(--color-border)] shrink-0 ${i === 0 && simStatus === 'stepping' ? 'bg-[var(--color-sim-active)] text-[var(--bg-primary)] font-bold' : 'bg-[var(--bg-surface)] text-[var(--color-text)]'}`}>{ch}</span>
                ))}
                {simConsumed.length === 0 && simRemaining.length === 0 && (
                  <span className="text-[var(--color-text-muted)] text-[11px]">ε</span>
                )}
              </div>
            )}
            {(simStatus === 'accepted' || simStatus === 'rejected') && (
              <div className={`font-mono text-[11px] px-2 py-1 border ${
                simStatus === 'accepted'
                  ? 'bg-[var(--color-accept)]/10 text-[var(--color-accept)] border-[var(--color-accept)]/20'
                  : 'bg-[var(--color-reject)]/10 text-[var(--color-reject)] border-[var(--color-reject)]/20'
              }`}>
                {simStatus === 'accepted' ? '✓' : '✗'} &quot;{simInput || 'ε'}&quot; {simStatus === 'accepted' ? 'accepted' : 'rejected'}
              </div>
            )}
            {activeLabels.length > 0 && simStatus === 'stepping' && (
              <div className="font-mono text-[11px] text-[var(--color-sim-active)]">
                Active: {activeLabels.join(', ')}
              </div>
            )}
          </div>
        ) : (
          <div className="p-2.5 flex flex-col gap-2 max-h-[45vh] overflow-hidden">
            <div className="flex gap-2">
              <textarea value={multiInput} onChange={e => setMultiInput(e.target.value)}
                className="flex-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1.5 outline-none focus:border-[var(--color-accent)] resize-none h-20"
                placeholder="One per line..." />
              <button onClick={handleMultiRun} className="flex items-center justify-center gap-1 px-3 bg-[var(--color-accent)] text-[var(--bg-primary)] font-mono text-[11px] tracking-wider font-medium shrink-0 self-stretch">
                <ListChecks size={12} />
              </button>
            </div>
            {multiRunResults.length > 0 && (
              <div className="overflow-y-auto flex-1">
                <div className="font-mono text-[10px] text-[var(--color-text-muted)] mb-1">{multiRunResults.filter(r => r.accepted).length}/{multiRunResults.length} pass</div>
                {multiRunResults.map((r, i) => (
                  <div key={i} className="flex items-center font-mono text-[11px] py-0.5 border-b border-[var(--color-border)]/30 gap-1.5">
                    <span className="font-bold shrink-0" style={{ color: r.accepted ? 'var(--color-accept)' : 'var(--color-reject)' }}>{r.accepted ? '✓' : '✗'}</span>
                    <span className="text-[var(--color-text)] truncate flex-1">{r.input || 'ε'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-48 bg-[var(--bg-surface-raised)] border-t border-[var(--color-border)] shadow-panel flex flex-col shrink-0 select-none">
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-3">
        <Zap size={11} className="text-[var(--color-accent)]" />
        <span className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase font-medium">Simulation</span>
        <span className="font-mono text-sm font-bold" style={{ color: statusColor }}>{statusText}</span>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setShowMulti(false)} className={`font-mono text-[11px] px-2 py-0.5 transition-colors ${!showMulti ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>Single</button>
          <button onClick={() => setShowMulti(true)} className={`font-mono text-[11px] px-2 py-0.5 transition-colors ${showMulti ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>Multi</button>
        </div>
      </div>

      {!showMulti ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Input + Controls */}
          <div className="flex flex-col gap-2 p-3 w-72 border-r border-[var(--color-border)]">
            <div className="flex items-center gap-1">
              <span className="font-mono text-[11px] text-[var(--color-text-dim)] w-10 shrink-0">INPUT</span>
              <input value={simInput} onChange={e => setSimInput(e.target.value)} disabled={simStatus === 'stepping'}
                className="flex-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1.5 outline-none focus:border-[var(--color-accent)]"
                placeholder="Enter string..."
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); simStatus === 'idle' ? simStart() : simStep(); }}} />
            </div>
            <div className="flex items-center gap-0.5 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] w-fit">
              {controlBtn(simStart, simStatus === 'stepping', 'Start', <Play size={14} />, 'Enter')}
              {controlBtn(simStep, simStatus !== 'stepping', 'Step', <StepForward size={14} />, 'Enter')}
              {controlBtn(simFastRun, simStatus === 'stepping', 'Fast Run', <FastForward size={14} />)}
              {controlBtn(simReset, false, 'Reset', <RotateCcw size={14} />)}
            </div>
            {/* Tape visualization */}
            {simStatus !== 'idle' ? (
              <div className="flex items-center gap-0 font-mono text-xs mt-1 overflow-x-auto">
                {[...simConsumed].map((ch, i) => (
                  <span key={`c${i}`} className="w-6 h-6 flex items-center justify-center bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text-dim)]">{ch}</span>
                ))}
                {[...simRemaining].map((ch, i) => (
                  <span key={`r${i}`} className={`w-6 h-6 flex items-center justify-center border border-[var(--color-border)] ${i === 0 && simStatus === 'stepping' ? 'bg-[var(--color-sim-active)] text-[var(--bg-primary)] font-bold' : 'bg-[var(--bg-surface)] text-[var(--color-text)]'}`}>{ch}</span>
                ))}
                {simRemaining.length === 0 && simConsumed.length === 0 && (
                  <span className="text-[var(--color-text-muted)] text-[11px]">ε (empty string)</span>
                )}
              </div>
            ) : (
              <div className="font-mono text-[11px] text-[var(--color-text-muted)] mt-1">
                Press Enter or ▶ to start
              </div>
            )}
          </div>

          {/* Right: State info */}
          <div className="flex-1 flex flex-col p-3 gap-2 overflow-y-auto">
            {simStatus === 'idle' ? (
              /* Idle state — show useful info */
              <div className="flex-1 flex flex-col gap-2">
                <div className="font-mono text-[11px] text-[var(--color-text-muted)]">
                  {mode.toUpperCase()} · {states.length} states · Σ = {`{${[...new Set(states.length > 0 ? transitions.flatMap(t => t.symbols).filter(s => s !== 'ε').sort() : [])].join(', ') || '∅'}}`}
                </div>
                {!hasInitial && states.length > 0 && (
                  <div className="font-mono text-xs text-[var(--color-reject)] bg-[var(--color-reject)]/10 px-2 py-1.5 border border-[var(--color-reject)]/20">
                    ⚠ No initial state — right-click a state to set one
                  </div>
                )}
                {hasInitial && states.filter(s => s.isAccepting).length === 0 && (
                  <div className="font-mono text-xs text-[var(--color-sim-active)] bg-[var(--color-sim-active)]/10 px-2 py-1.5 border border-[var(--color-sim-active)]/20">
                    ⚠ No accepting states defined
                  </div>
                )}
                <div className="font-mono text-[11px] text-[var(--color-text-muted)] mt-auto">
                  Tip: Use Multi tab to batch-test strings
                </div>
              </div>
            ) : (
              /* Active simulation */
              <>
                {activeLabels.length > 0 && (
                  <div>
                    <div className="font-mono text-[11px] text-[var(--color-text-dim)] mb-1">ACTIVE STATES</div>
                    <div className="flex flex-wrap gap-1">
                      {activeLabels.map((label, i) => (
                        <span key={i} className="font-mono text-xs bg-[var(--color-sim-active)]/15 text-[var(--color-sim-active)] border border-[var(--color-sim-active)]/30 px-2 py-0.5 font-medium">{label}</span>
                      ))}
                    </div>
                  </div>
                )}
                {simConsumed && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[var(--color-text-dim)]">CONSUMED</span>
                    <span className="font-mono text-xs text-[var(--color-text)]">{simConsumed}</span>
                  </div>
                )}
                {simRemaining && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[var(--color-text-dim)]">REMAINING</span>
                    <span className="font-mono text-xs text-[var(--color-text)]">{simRemaining}</span>
                  </div>
                )}
                {(simStatus === 'accepted' || simStatus === 'rejected') && (
                  <div className={`font-mono text-xs px-2 py-1.5 border mt-auto ${
                    simStatus === 'accepted'
                      ? 'bg-[var(--color-accept)]/10 text-[var(--color-accept)] border-[var(--color-accept)]/20'
                      : 'bg-[var(--color-reject)]/10 text-[var(--color-reject)] border-[var(--color-reject)]/20'
                  }`}>
                    {simStatus === 'accepted' ? '✓' : '✗'} String "{simInput || 'ε'}" is {simStatus === 'accepted' ? 'accepted' : 'rejected'} by the {mode.toUpperCase()}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Multi-run — compact side-by-side layout */
        <div className="flex-1 flex overflow-hidden">
          {/* Input area */}
          <div className="flex flex-col w-52 border-r border-[var(--color-border)] p-2.5 gap-1.5">
            <div className="font-mono text-[11px] text-[var(--color-text-dim)] flex items-center justify-between">
              <span>TEST STRINGS</span>
              {multiRunResults.length > 0 && (
                <span className="text-[var(--color-text-muted)]">
                  {multiRunResults.filter(r => r.accepted).length}/{multiRunResults.length} pass
                </span>
              )}
            </div>
            <textarea value={multiInput} onChange={e => setMultiInput(e.target.value)}
              className="flex-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1.5 outline-none focus:border-[var(--color-accent)] resize-none"
              placeholder={"ε\na\nab\naab\nbba"} />
            <button onClick={handleMultiRun} className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[var(--color-accent)] text-[var(--bg-primary)] font-mono text-[11px] tracking-wider font-medium hover:opacity-90 transition-opacity">
              <ListChecks size={12} /> RUN ALL
            </button>
          </div>
          {/* Results */}
          <div className="flex-1 overflow-y-auto p-2.5">
            {multiRunResults.length > 0 ? (
              <div className="space-y-0">
                {multiRunResults.map((r, i) => (
                  <div key={i} className="flex items-center font-mono text-xs py-1 border-b border-[var(--color-border)]/30 gap-2">
                    <span className="w-5 text-center font-bold" style={{ color: r.accepted ? 'var(--color-accept)' : 'var(--color-reject)' }}>
                      {r.accepted ? '✓' : '✗'}
                    </span>
                    <span className="flex-1 text-[var(--color-text)] truncate">{r.input || 'ε'}</span>
                    <span className="text-[11px] font-medium shrink-0" style={{ color: r.accepted ? 'var(--color-accept)' : 'var(--color-reject)' }}>
                      {r.accepted ? 'ACCEPT' : 'REJECT'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <ListChecks size={24} className="text-[var(--color-text-muted)]" />
                <div className="font-mono text-[11px] text-[var(--color-text-muted)] text-center leading-relaxed">
                  Batch test multiple strings<br />
                  One per line · empty line = ε
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
