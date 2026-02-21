'use client';

import { useState, useRef, useCallback } from 'react';
import { useStore } from '@/store';
import { Play, StepForward, FastForward, RotateCcw, ListChecks, ChevronUp, GripHorizontal } from 'lucide-react';

export default function SimPanel({ isMobile }: { isMobile: boolean }) {
  const showSimPanel = useStore(s => s.showSimPanel);
  const simInput = useStore(s => s.simInput);
  const simStatus = useStore(s => s.simStatus);
  const simConsumed = useStore(s => s.simConsumed);
  const simRemaining = useStore(s => s.simRemaining);
  const simCurrentStates = useStore(s => s.simCurrentStates);
  const multiRunResults = useStore(s => s.multiRunResults);
  const states = useStore(s => s.states);

  const setSimInput = useStore(s => s.setSimInput);
  const simStart = useStore(s => s.simStart);
  const simStep = useStore(s => s.simStep);
  const simFastRun = useStore(s => s.simFastRun);
  const simReset = useStore(s => s.simReset);
  const simMultiRun = useStore(s => s.simMultiRun);

  const [multiInput, setMultiInput] = useState('');
  const [showMulti, setShowMulti] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Swipe-up gesture for mobile bottom sheet
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

  const stateMap = new Map(states.map(s => [s.id, s]));
  const activeLabels = [...simCurrentStates].map(id => stateMap.get(id)?.label).filter(Boolean);

  const statusColor =
    simStatus === 'accepted' ? 'var(--color-accept)' :
    simStatus === 'rejected' ? 'var(--color-reject)' :
    simStatus === 'stepping' ? 'var(--color-sim-active)' :
    'var(--color-text-dim)';

  const statusText =
    simStatus === 'accepted' ? 'ACCEPTED' :
    simStatus === 'rejected' ? 'REJECTED' :
    simStatus === 'stepping' ? 'STEPPING' :
    'IDLE';

  const handleMultiRun = () => {
    const inputs = multiInput.split('\n').map(s => s.trim()).filter(Boolean);
    simMultiRun(inputs);
  };

  const controlButtons = (
    <div className="flex items-center gap-1">
      <button onClick={simStart} disabled={simStatus === 'stepping'} title="Start" className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:p-1 flex items-center justify-center text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30">
        <Play size={14} />
      </button>
      <button onClick={simStep} disabled={simStatus !== 'stepping'} title="Step" className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:p-1 flex items-center justify-center text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30">
        <StepForward size={14} />
      </button>
      <button onClick={simFastRun} disabled={simStatus === 'stepping'} title="Fast run" className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:p-1 flex items-center justify-center text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30">
        <FastForward size={14} />
      </button>
      <button onClick={simReset} title="Reset" className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:p-1 flex items-center justify-center text-[var(--color-text-dim)] hover:text-[var(--color-accent)]">
        <RotateCcw size={14} />
      </button>
    </div>
  );

  // Mobile bottom sheet
  if (isMobile) {
    return (
      <div
        className={`bg-[var(--bg-surface)] border-t border-[var(--color-border)] shrink-0 select-none transition-all duration-200 ${mobileExpanded ? 'max-h-[60vh]' : 'max-h-[140px]'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex items-center justify-center py-1 cursor-grab" onClick={() => setMobileExpanded(!mobileExpanded)}>
          <GripHorizontal size={20} className="text-[var(--color-border)]" />
        </div>

        {/* Header */}
        <div className="px-3 pb-1 flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase">Sim</span>
          <span className="font-mono text-[10px] font-bold" style={{ color: statusColor }}>{statusText}</span>
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => setShowMulti(false)} className={`font-mono text-[10px] px-2 py-1 min-h-[36px] ${!showMulti ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}>Single</button>
            <button onClick={() => setShowMulti(true)} className={`font-mono text-[10px] px-2 py-1 min-h-[36px] ${showMulti ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}>Multi</button>
          </div>
        </div>

        {!showMulti ? (
          <div className="px-3 pb-2 flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <input
                value={simInput}
                onChange={e => setSimInput(e.target.value)}
                disabled={simStatus === 'stepping'}
                className="flex-1 bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-2 outline-none focus:border-[var(--color-accent)]"
                placeholder="Input string..."
              />
            </div>
            {controlButtons}
            {/* Tape + active states */}
            {simStatus !== 'idle' && (
              <div className="flex items-center gap-0 font-mono text-xs overflow-x-auto">
                {[...simConsumed].map((ch, i) => (
                  <span key={`c${i}`} className="w-6 h-6 flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text-dim)] shrink-0">{ch}</span>
                ))}
                {[...simRemaining].map((ch, i) => (
                  <span key={`r${i}`} className={`w-6 h-6 flex items-center justify-center border border-[var(--color-border)] shrink-0 ${i === 0 && simStatus === 'stepping' ? 'bg-[var(--color-sim-active)] text-[var(--bg-primary)]' : 'bg-[var(--bg-surface)] text-[var(--color-text)]'}`}>{ch}</span>
                ))}
              </div>
            )}
            {mobileExpanded && activeLabels.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[var(--color-text-dim)]">ACTIVE</span>
                <span className="font-mono text-xs text-[var(--color-sim-active)]">{activeLabels.join(', ')}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 pb-2 flex flex-col gap-2 overflow-hidden" style={{ maxHeight: mobileExpanded ? '50vh' : '80px' }}>
            <textarea
              value={multiInput}
              onChange={e => setMultiInput(e.target.value)}
              className="bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)] resize-none h-16"
              placeholder="One string per line..."
            />
            <button onClick={handleMultiRun} className="flex items-center justify-center gap-1 px-2 py-2 bg-[var(--color-accent)] text-[var(--bg-primary)] font-mono text-[10px] tracking-wider min-h-[44px]">
              <ListChecks size={12} /> RUN ALL
            </button>
            {multiRunResults.length > 0 && (
              <div className="overflow-y-auto flex-1">
                {multiRunResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between font-mono text-xs py-1">
                    <span className="text-[var(--color-text)]">{r.input || 'ε'}</span>
                    <span className="font-bold" style={{ color: r.accepted ? 'var(--color-accept)' : 'var(--color-reject)' }}>{r.accepted ? 'ACCEPT' : 'REJECT'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="h-44 bg-[var(--bg-surface)] border-t border-[var(--color-border)] flex flex-col shrink-0 select-none">
      <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase">Simulation</span>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setShowMulti(false)} className={`font-mono text-[10px] px-2 py-0.5 transition-colors ${!showMulti ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>Single</button>
          <button onClick={() => setShowMulti(true)} className={`font-mono text-[10px] px-2 py-0.5 transition-colors ${showMulti ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>Multi</button>
        </div>
      </div>
      {!showMulti ? (
        <div className="flex-1 flex gap-4 px-3 py-2 overflow-hidden">
          <div className="flex flex-col gap-2 w-72">
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] text-[var(--color-text-dim)] w-10 shrink-0">INPUT</span>
              <input value={simInput} onChange={e => setSimInput(e.target.value)} disabled={simStatus === 'stepping'} className="flex-1 bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)]" placeholder="Enter string..." />
            </div>
            {controlButtons}
            {simStatus !== 'idle' && (
              <div className="flex items-center gap-0 font-mono text-xs mt-1">
                {[...simConsumed].map((ch, i) => (
                  <span key={`c${i}`} className="w-5 h-5 flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text-dim)]">{ch}</span>
                ))}
                {[...simRemaining].map((ch, i) => (
                  <span key={`r${i}`} className={`w-5 h-5 flex items-center justify-center border border-[var(--color-border)] ${i === 0 && simStatus === 'stepping' ? 'bg-[var(--color-sim-active)] text-[var(--bg-primary)]' : 'bg-[var(--bg-surface)] text-[var(--color-text)]'}`}>{ch}</span>
                ))}
                {simRemaining.length === 0 && simConsumed.length === 0 && (
                  <span className="text-[var(--color-text-dim)] text-[10px]">ε (empty string)</span>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[var(--color-text-dim)]">STATUS</span>
              <span className="font-mono text-xs font-bold" style={{ color: statusColor }}>{statusText}</span>
            </div>
            {activeLabels.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[var(--color-text-dim)]">ACTIVE</span>
                <span className="font-mono text-xs text-[var(--color-sim-active)]">{activeLabels.join(', ')}</span>
              </div>
            )}
            {simStatus !== 'idle' && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[var(--color-text-dim)]">CONSUMED</span>
                <span className="font-mono text-xs text-[var(--color-text)]">{simConsumed || 'ε'}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-3 px-3 py-2 overflow-hidden">
          <div className="flex flex-col gap-1 w-56">
            <textarea value={multiInput} onChange={e => setMultiInput(e.target.value)} className="flex-1 bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)] resize-none" placeholder="One string per line..." />
            <button onClick={handleMultiRun} className="flex items-center justify-center gap-1 px-2 py-1 bg-[var(--color-accent)] text-[var(--bg-primary)] font-mono text-[10px] tracking-wider hover:opacity-90">
              <ListChecks size={12} /> RUN ALL
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {multiRunResults.length > 0 && (
              <table className="w-full font-mono text-xs">
                <thead><tr className="text-[var(--color-text-dim)] text-[10px]"><td className="pb-1 pr-4">INPUT</td><td className="pb-1">RESULT</td></tr></thead>
                <tbody>
                  {multiRunResults.map((r, i) => (
                    <tr key={i}><td className="pr-4 py-0.5 text-[var(--color-text)]">{r.input || 'ε'}</td><td className="py-0.5"><span className="font-bold" style={{ color: r.accepted ? 'var(--color-accept)' : 'var(--color-reject)' }}>{r.accepted ? 'ACCEPT' : 'REJECT'}</span></td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
