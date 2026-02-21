'use client';

import { useState, useRef, useCallback } from 'react';
import { useStore } from '@/store';
import {
  tmInit, tmStep, tmFastRun, tapeToString,
  type TMSimState,
} from '@/tm';
import {
  Play, StepForward, FastForward, RotateCcw, GripHorizontal,
  SkipBack, Gauge,
} from 'lucide-react';

export default function TMSimPanel({ isMobile }: { isMobile: boolean }) {
  const showSimPanel = useStore(s => s.showSimPanel);
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);

  const [input, setInput] = useState('');
  const [sim, setSim] = useState<TMSimState | null>(null);
  const [maxSteps, setMaxSteps] = useState(1000);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const touchStartY = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (dy > 40) setMobileExpanded(true);
    if (dy < -40) setMobileExpanded(false);
  }, []);

  if (!showSimPanel) return null;

  const handleStart = () => {
    const s = tmInit(states, input);
    setSim(s);
    // Highlight initial state
    if (s) {
      useStore.setState({ simCurrentStates: new Set([s.stateId]), simStatus: 'stepping' });
    }
  };

  const handleStep = () => {
    if (!sim) { handleStart(); return; }
    if (sim.status !== 'running') return;
    const next = tmStep(sim, states, transitions);
    setSim(next);
    useStore.setState({
      simCurrentStates: new Set([next.stateId]),
      simStatus: next.status === 'accepted' ? 'accepted' : next.status === 'running' ? 'stepping' : 'rejected',
    });
  };

  const handleFastRun = () => {
    const result = tmFastRun(states, transitions, input, maxSteps);
    setSim(result);
    if (result) {
      useStore.setState({
        simCurrentStates: new Set([result.stateId]),
        simStatus: result.status === 'accepted' ? 'accepted' : 'rejected',
      });
    }
  };

  const handleReset = () => {
    setSim(null);
    useStore.setState({ simCurrentStates: new Set(), simStatus: 'idle' });
  };

  const stateMap = new Map(states.map(s => [s.id, s]));

  const statusColor = !sim ? 'var(--color-text-dim)'
    : sim.status === 'accepted' ? 'var(--color-accept)'
    : sim.status === 'rejected' ? 'var(--color-reject)'
    : sim.status === 'halted' ? 'var(--color-sim-active)'
    : 'var(--color-sim-active)';

  const statusText = !sim ? 'IDLE'
    : sim.status === 'accepted' ? 'ACCEPTED'
    : sim.status === 'rejected' ? 'REJECTED'
    : sim.status === 'halted' ? `HALTED (${maxSteps} steps)`
    : 'RUNNING';

  // Tape visualization
  const tapeViz = sim ? tapeToString(sim.tape, 8) : null;

  return (
    <div
      className={`bg-[var(--bg-surface)] border-t border-[var(--color-border)] flex flex-col shrink-0 select-none ${
        isMobile ? (mobileExpanded ? 'max-h-[60vh]' : 'max-h-[180px]') : 'h-52'
      }`}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-3">
        {isMobile && (
          <div className="cursor-grab" onClick={() => setMobileExpanded(!mobileExpanded)}>
            <GripHorizontal size={16} className="text-[var(--color-border)]" />
          </div>
        )}
        <span className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase">Turing Machine</span>
        <span className="font-mono text-[10px] font-bold" style={{ color: statusColor }}>{statusText}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <Gauge size={11} className="text-[var(--color-text-dim)]" />
          <span className="font-mono text-[10px] text-[var(--color-text-dim)]">Limit:</span>
          <input
            type="number"
            value={maxSteps}
            onChange={e => setMaxSteps(Math.max(1, parseInt(e.target.value) || 1000))}
            className="w-16 bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-[10px] px-1 py-0.5 outline-none"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: input + controls + tape */}
        <div className="flex flex-col gap-2 px-3 py-2 flex-1">
          {/* Input + controls */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[var(--color-text-dim)] shrink-0">INPUT</span>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); handleReset(); }}
              className="flex-1 bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)] max-w-[200px]"
              placeholder="Tape input..."
            />
            <div className="flex items-center gap-0.5">
              <button onClick={handleStart} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><Play size={14} /></button>
              <button onClick={handleStep} disabled={sim?.status !== 'running' && sim !== null} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><StepForward size={14} /></button>
              <button onClick={handleFastRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><FastForward size={14} /></button>
              <button onClick={handleReset} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={14} /></button>
            </div>
            {sim && <span className="font-mono text-[10px] text-[var(--color-text-dim)]">Step {sim.step}</span>}
          </div>

          {/* Tape visualization */}
          {tapeViz && (
            <div className="overflow-x-auto">
              <div className="flex items-end gap-0 font-mono text-xs">
                {[...tapeViz.str].map((ch, i) => {
                  const isHead = i === tapeViz.headIdx;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      {isHead && (
                        <div className="text-[var(--color-accent)] text-[10px] mb-0.5">▼</div>
                      )}
                      <span
                        className={`w-6 h-6 flex items-center justify-center border shrink-0 ${
                          isHead
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--bg-primary)] font-bold'
                            : 'border-[var(--color-border)] bg-[var(--bg-primary)] text-[var(--color-text)]'
                        }`}
                      >
                        {ch}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current state */}
          {sim && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-[var(--color-text-dim)]">STATE</span>
                <span className="font-mono text-xs text-[var(--color-accent)]">{stateMap.get(sim.stateId)?.label ?? '?'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-[var(--color-text-dim)]">HEAD</span>
                <span className="font-mono text-xs text-[var(--color-text)]">{sim.tape.head}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: History */}
        <div className={`border-l border-[var(--color-border)] overflow-y-auto px-3 py-2 ${isMobile ? 'w-40' : 'w-56'} shrink-0`}>
          <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">
            History {sim ? `(${sim.history.length})` : ''}
          </div>
          {sim && (
            <div className="space-y-0.5">
              {sim.history.map((h, i) => (
                <div key={i} className={`font-mono text-[10px] py-0.5 ${i === sim.history.length - 1 ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}>
                  <span className="text-[var(--color-text-dim)] w-4 inline-block">{i}.</span>
                  {h.action}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
