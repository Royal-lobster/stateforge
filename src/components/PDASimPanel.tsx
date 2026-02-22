'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { pdaInit, pdaStep, pdaFastRun, type PDASimState } from '@/pda';
import {
  Play, StepForward, FastForward, RotateCcw, Zap,
} from 'lucide-react';
import Tooltip from './Tooltip';

export default function PDASimPanel({ isMobile }: { isMobile: boolean }) {
  const showSimPanel = useStore(s => s.showSimPanel);
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);

  const [input, setInput] = useState('');
  const [acceptMode, setAcceptMode] = useState<'final-state' | 'empty-stack'>('final-state');
  const [simState, setSimState] = useState<PDASimState | null>(null);
  const [stepCount, setStepCount] = useState(0);

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
    setStepCount(-1);
  };

  const handleReset = () => {
    setSimState(null);
    setStepCount(0);
  };

  const stateMap = new Map(states.map(s => [s.id, s]));
  const hasInitial = states.some(s => s.isInitial);

  const isAccepted = simState ? simState.accepted.length > 0 : false;
  const isDone = simState?.done ?? false;

  const statusColor = !simState ? 'var(--color-text-muted)'
    : isAccepted ? 'var(--color-accept)'
    : isDone ? 'var(--color-reject)'
    : 'var(--color-sim-active)';

  const statusText = !simState ? 'IDLE'
    : isAccepted ? 'ACCEPTED'
    : isDone ? 'REJECTED'
    : 'RUNNING';

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

  const controlBtn = (onClick: () => void, disabled: boolean, title: string, icon: React.ReactNode, shortcut?: string) => (
    <Tooltip label={title} shortcut={shortcut} position="top">
      <button onClick={onClick} disabled={disabled} aria-label={title}
        className="p-1.5 flex items-center justify-center text-[var(--color-text-dim)] hover:text-[var(--color-accent)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
        {icon}
      </button>
    </Tooltip>
  );

  return (
    <div
      className={`bg-[var(--bg-surface-raised)] border-t border-[var(--color-border)] shadow-panel flex flex-col shrink-0 select-none ${
        isMobile ? '' : 'h-56'
      }`}
    >
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-2 flex-wrap">
        <Zap size={11} className="text-[var(--color-accent)] shrink-0" />
        <span className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase font-medium">PDA Simulation</span>
        <span className="font-mono text-sm font-bold" style={{ color: statusColor }}>{statusText}</span>
        <div className="flex-1 min-w-1" />
        <div className="flex items-center gap-0.5 font-mono text-[11px] shrink-0">
          <button
            onClick={() => setAcceptMode('final-state')}
            className={`px-2 py-0.5 transition-colors ${acceptMode === 'final-state' ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}
          >Final State</button>
          <button
            onClick={() => setAcceptMode('empty-stack')}
            className={`px-2 py-0.5 transition-colors ${acceptMode === 'empty-stack' ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}
          >Empty Stack</button>
        </div>
      </div>

      {/* Body */}
      <div className={`flex-1 flex overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
        {/* Left: Input + Controls */}
        <div className={`flex flex-col gap-2 p-3 ${isMobile ? 'border-b border-[var(--color-border)]' : 'w-72 border-r border-[var(--color-border)]'}`}>
          <div className="flex items-center gap-1">
            <span className="font-mono text-[11px] text-[var(--color-text-dim)] w-10 shrink-0">INPUT</span>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); handleReset(); }}
              className="flex-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1.5 outline-none focus:border-[var(--color-accent)]"
              placeholder="Input string..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); !simState ? handleStart() : handleStep(); }}}
            />
          </div>
          <div className="flex items-center gap-0.5 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] w-fit">
            {controlBtn(handleStart, !!simState && !simState.done, 'Start', <Play size={14} />, 'Enter')}
            {controlBtn(handleStep, !!simState && simState.done, 'Step', <StepForward size={14} />, 'Enter')}
            {controlBtn(handleFastRun, false, 'Fast Run', <FastForward size={14} />)}
            {controlBtn(handleReset, false, 'Reset', <RotateCcw size={14} />)}
          </div>
          {/* Input tape */}
          {simState ? (
            <div className="flex items-center gap-0 font-mono text-xs mt-1 overflow-x-auto">
              {[...input].map((ch, i) => {
                const isConsumed = simState.configs.length > 0
                  ? i < Math.min(...simState.configs.map(c => c.inputPos))
                  : i < input.length;
                const isCurrent = simState.configs.some(c => c.inputPos === i);
                return (
                  <span key={i} className={`w-6 h-6 flex items-center justify-center border border-[var(--color-border)] shrink-0 ${
                    isConsumed ? 'bg-[var(--bg-surface-sunken)] text-[var(--color-text-dim)]'
                    : isCurrent ? 'bg-[var(--color-sim-active)] text-[var(--bg-primary)] font-bold'
                    : 'bg-[var(--bg-surface)] text-[var(--color-text)]'
                  }`}>{ch}</span>
                );
              })}
              {input.length === 0 && <span className="text-[var(--color-text-muted)] text-[11px]">ε (empty string)</span>}
            </div>
          ) : (
            <div className="font-mono text-[11px] text-[var(--color-text-muted)] mt-1">
              {!hasInitial && states.length > 0
                ? <span className="text-[var(--color-reject)]">⚠ No initial state set</span>
                : 'Press Enter or ▶ to start'}
            </div>
          )}
        </div>

        {/* Middle: Configs + Stack */}
        <div className="flex-1 flex overflow-hidden">
          {/* Active configs */}
          <div className="flex-1 overflow-y-auto p-3">
            {!simState ? (
              <div className="flex-1 flex flex-col gap-2">
                <div className="font-mono text-[11px] text-[var(--color-text-muted)]">
                  PDA · {states.length} states · Accept: {acceptMode === 'final-state' ? 'Final State' : 'Empty Stack'}
                </div>
                <div className="font-mono text-[11px] text-[var(--color-text-muted)] mt-auto">
                  Transition format: input,pop→push
                </div>
              </div>
            ) : (
              <>
                <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">
                  Active Configs ({simState.configs.length})
                  {stepCount > 0 && <span className="ml-2 normal-case tracking-normal text-[var(--color-text-muted)]">Step {stepCount}</span>}
                </div>
                <div className="space-y-0.5">
                  {simState.configs.map(config => (
                    <div key={config.id} className="font-mono text-[11px] flex items-center gap-2 py-0.5">
                      <span className="text-[var(--color-accent)] font-medium">{stateMap.get(config.stateId)?.label ?? '?'}</span>
                      <span className="text-[var(--color-text-dim)]">pos:{config.inputPos}</span>
                      <span className="text-[var(--color-sim-active)]">[{config.stack.join('') || 'ε'}]</span>
                    </div>
                  ))}
                </div>
                {simState.accepted.length > 0 && (
                  <div className="mt-2">
                    <div className="font-mono text-[11px] tracking-widest text-[var(--color-accept)] uppercase mb-1">Accepted ({simState.accepted.length})</div>
                    {simState.accepted.map(config => (
                      <div key={config.id} className="font-mono text-[11px] flex items-center gap-2 py-0.5 text-[var(--color-accept)]">
                        <span>{stateMap.get(config.stateId)?.label ?? '?'}</span>
                        <span>[{config.stack.join('') || 'ε'}]</span>
                      </div>
                    ))}
                  </div>
                )}
                {isDone && !isAccepted && (
                  <div className="font-mono text-xs px-2 py-1.5 border mt-2 bg-[var(--color-reject)]/10 text-[var(--color-reject)] border-[var(--color-reject)]/20">
                    ✗ String &quot;{input || 'ε'}&quot; is rejected by the PDA
                  </div>
                )}
                {isAccepted && (
                  <div className="font-mono text-xs px-2 py-1.5 border mt-2 bg-[var(--color-accept)]/10 text-[var(--color-accept)] border-[var(--color-accept)]/20">
                    ✓ String &quot;{input || 'ε'}&quot; is accepted by the PDA
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stack viz (desktop only) */}
          <div className={`w-20 border-l border-[var(--color-border)] p-2 flex flex-col shrink-0 ${isMobile ? 'hidden' : ''}`}>
            <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">Stack</div>
            {simState && simState.configs.length > 0 ? (() => {
              const config = simState.configs[0];
              return (
                <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-0">
                  {[...config.stack].reverse().map((sym, i) => (
                    <div key={i} className={`font-mono text-xs text-center border border-[var(--color-border)] py-0.5 ${
                      i === config.stack.length - 1
                        ? 'bg-[var(--color-sim-active)] text-[var(--bg-primary)] font-bold'
                        : 'bg-[var(--bg-surface-sunken)] text-[var(--color-text)]'
                    }`}>{sym}</div>
                  ))}
                  {config.stack.length === 0 && (
                    <div className="font-mono text-[11px] text-[var(--color-text-dim)] text-center">empty</div>
                  )}
                </div>
              );
            })() : (
              <div className="font-mono text-[11px] text-[var(--color-text-muted)] text-center mt-2">—</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
