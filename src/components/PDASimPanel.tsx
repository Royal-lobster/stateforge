'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '@/store';
import { pdaInit, pdaStep, pdaFastRun, type PDASimState, type PDAConfig } from '@/pda';
import {
  Play, StepForward, FastForward, RotateCcw, GripHorizontal,
} from 'lucide-react';

export default function PDASimPanel({ isMobile }: { isMobile: boolean }) {
  const showSimPanel = useStore(s => s.showSimPanel);
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);

  const [input, setInput] = useState('');
  const [acceptMode, setAcceptMode] = useState<'final-state' | 'empty-stack'>('final-state');
  const [simState, setSimState] = useState<PDASimState | null>(null);
  const [stepCount, setStepCount] = useState(0);
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
    const sim = pdaInit(states, transitions, input, acceptMode);
    setSimState(sim);
    setStepCount(0);
  };

  const handleStep = () => {
    if (!simState) { handleStart(); return; }
    if (simState.done) return;
    const next = pdaStep(simState, states, transitions);
    setSimState(next);
    setStepCount(stepCount + 1);
  };

  const handleFastRun = () => {
    const sim = pdaFastRun(states, transitions, input, acceptMode);
    setSimState(sim);
    setStepCount(-1); // indicates fast run
  };

  const handleReset = () => {
    setSimState(null);
    setStepCount(0);
  };

  const stateMap = new Map(states.map(s => [s.id, s]));

  const isAccepted = simState ? simState.accepted.length > 0 : false;
  const isDone = simState?.done ?? false;

  const statusColor = !simState ? 'var(--color-text-dim)'
    : isAccepted ? 'var(--color-accept)'
    : isDone ? 'var(--color-reject)'
    : 'var(--color-sim-active)';

  const statusText = !simState ? 'IDLE'
    : isAccepted ? 'ACCEPTED'
    : isDone ? 'REJECTED'
    : 'RUNNING';

  // Sync canvas highlighting via useEffect (not during render)
  useEffect(() => {
    if (simState && !simState.done) {
      const activeIds = new Set(simState.configs.map(c => c.stateId));
      useStore.setState({ simCurrentStates: activeIds, simStatus: 'stepping' });
    } else if (simState && simState.done) {
      const finalIds = new Set(simState.accepted.map(c => c.stateId));
      useStore.setState({
        simCurrentStates: finalIds,
        simStatus: simState.accepted.length > 0 ? 'accepted' : 'rejected',
      });
    } else {
      useStore.setState({ simCurrentStates: new Set(), simStatus: 'idle' });
    }
  }, [simState]);

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
        <span className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase">PDA Simulation</span>
        <span className="font-mono text-[11px] font-bold" style={{ color: statusColor }}>{statusText}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-0.5 font-mono text-[11px]">
          <button
            onClick={() => setAcceptMode('final-state')}
            className={`px-2 py-0.5 ${acceptMode === 'final-state' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}
          >
            Final State
          </button>
          <button
            onClick={() => setAcceptMode('empty-stack')}
            className={`px-2 py-0.5 ${acceptMode === 'empty-stack' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}
          >
            Empty Stack
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: input + controls */}
        <div className="flex flex-col gap-2 px-3 py-2 w-60 shrink-0">
          <div className="flex items-center gap-1">
            <span className="font-mono text-[11px] text-[var(--color-text-dim)] w-10 shrink-0">INPUT</span>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); handleReset(); }}
              className="flex-1 bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)]"
              placeholder="Input string..."
            />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleStart} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><Play size={14} /></button>
            <button onClick={handleStep} disabled={simState?.done} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><StepForward size={14} /></button>
            <button onClick={handleFastRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><FastForward size={14} /></button>
            <button onClick={handleReset} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={14} /></button>
            {stepCount > 0 && <span className="font-mono text-[11px] text-[var(--color-text-dim)] ml-2">Step {stepCount}</span>}
          </div>

          {/* Input tape */}
          {simState && (
            <div className="flex items-center gap-0 font-mono text-xs overflow-x-auto">
              {[...input].map((ch, i) => {
                const isConsumed = simState.configs.length > 0
                  ? i < Math.min(...simState.configs.map(c => c.inputPos))
                  : i < input.length;
                const isCurrent = simState.configs.some(c => c.inputPos === i);
                return (
                  <span
                    key={i}
                    className={`w-5 h-5 flex items-center justify-center border border-[var(--color-border)] shrink-0 ${
                      isConsumed ? 'bg-[var(--bg-primary)] text-[var(--color-text-dim)]'
                        : isCurrent ? 'bg-[var(--color-sim-active)] text-[var(--bg-primary)]'
                        : 'bg-[var(--bg-surface)] text-[var(--color-text)]'
                    }`}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Middle: Active configurations */}
        <div className="flex-1 border-l border-[var(--color-border)] overflow-y-auto px-3 py-2">
          <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">
            Active Configs {simState ? `(${simState.configs.length})` : ''}
          </div>
          {simState && simState.configs.map(config => (
            <div key={config.id} className="font-mono text-[11px] flex items-center gap-2 py-0.5">
              <span className="text-[var(--color-accent)]">{stateMap.get(config.stateId)?.label ?? '?'}</span>
              <span className="text-[var(--color-text-dim)]">pos:{config.inputPos}</span>
              <span className="text-[var(--color-sim-active)]">[{config.stack.join('') || 'ε'}]</span>
            </div>
          ))}
          {simState && simState.accepted.length > 0 && (
            <>
              <div className="font-mono text-[11px] tracking-widest text-[var(--color-accept)] uppercase mt-2 mb-1">
                Accepted ({simState.accepted.length})
              </div>
              {simState.accepted.map(config => (
                <div key={config.id} className="font-mono text-[11px] flex items-center gap-2 py-0.5 text-[var(--color-accept)]">
                  <span>{stateMap.get(config.stateId)?.label ?? '?'}</span>
                  <span>[{config.stack.join('') || 'ε'}]</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right: Stack visualization */}
        <div className="w-24 border-l border-[var(--color-border)] px-2 py-2 flex flex-col shrink-0">
          <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">Stack</div>
          {simState && simState.configs.length > 0 && (() => {
            // Show stack of first config
            const config = simState.configs[0];
            return (
              <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-0">
                {[...config.stack].reverse().map((sym, i) => (
                  <div
                    key={i}
                    className={`font-mono text-xs text-center border border-[var(--color-border)] py-0.5 ${
                      i === config.stack.length - 1
                        ? 'bg-[var(--color-sim-active)] text-[var(--bg-primary)]'
                        : 'bg-[var(--bg-primary)] text-[var(--color-text)]'
                    }`}
                  >
                    {sym}
                  </div>
                ))}
                {config.stack.length === 0 && (
                  <div className="font-mono text-[11px] text-[var(--color-text-dim)] text-center">empty</div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
