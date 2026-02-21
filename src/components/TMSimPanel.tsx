'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '@/store';
import {
  tmInit, tmStep, tmFastRun, tapeToString,
  type TMSimState,
} from '@/tm';
import {
  Play, StepForward, FastForward, RotateCcw, GripHorizontal,
  Gauge, Zap,
} from 'lucide-react';
import Tooltip from './Tooltip';

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
  };

  const handleStep = () => {
    if (!sim) { handleStart(); return; }
    if (sim.status !== 'running') return;
    const next = tmStep(sim, states, transitions);
    setSim(next);
  };

  const handleFastRun = () => {
    const result = tmFastRun(states, transitions, input, maxSteps);
    setSim(result);
  };

  const handleReset = () => {
    setSim(null);
    useStore.setState({ simCurrentStates: new Set(), simStatus: 'idle' });
  };

  // Sync canvas highlighting
  useEffect(() => {
    if (sim) {
      useStore.setState({
        simCurrentStates: new Set([sim.stateId]),
        simStatus: sim.status === 'accepted' ? 'accepted' : sim.status === 'running' ? 'stepping' : 'rejected',
      });
    }
  }, [sim]);

  const stateMap = new Map(states.map(s => [s.id, s]));
  const hasInitial = states.some(s => s.isInitial);

  const statusColor = !sim ? 'var(--color-text-muted)'
    : sim.status === 'accepted' ? 'var(--color-accept)'
    : sim.status === 'rejected' || sim.status === 'halted' ? 'var(--color-reject)'
    : 'var(--color-sim-active)';

  const statusText = !sim ? 'IDLE'
    : sim.status === 'accepted' ? 'ACCEPTED'
    : sim.status === 'rejected' ? 'REJECTED'
    : sim.status === 'halted' ? `HALTED (${maxSteps})`
    : 'RUNNING';

  const tapeViz = sim ? tapeToString(sim.tape, 10) : null;

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
        isMobile ? (mobileExpanded ? 'max-h-[60vh]' : 'max-h-[180px]') : 'h-48'
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
        <Zap size={11} className="text-[var(--color-accent)]" />
        <span className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase font-medium">Turing Machine</span>
        <span className="font-mono text-sm font-bold" style={{ color: statusColor }}>{statusText}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <Gauge size={11} className="text-[var(--color-text-dim)]" />
          <span className="font-mono text-[11px] text-[var(--color-text-dim)]">Limit:</span>
          <input
            type="number"
            value={maxSteps}
            onChange={e => setMaxSteps(Math.max(1, parseInt(e.target.value) || 1000))}
            className="w-16 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-[11px] px-1 py-0.5 outline-none"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Input + Controls */}
        <div className="flex flex-col gap-2 p-3 w-72 border-r border-[var(--color-border)]">
          <div className="flex items-center gap-1">
            <span className="font-mono text-[11px] text-[var(--color-text-dim)] w-10 shrink-0">INPUT</span>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); handleReset(); }}
              className="flex-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1.5 outline-none focus:border-[var(--color-accent)]"
              placeholder="Tape input..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); !sim ? handleStart() : handleStep(); }}}
            />
          </div>
          <div className="flex items-center gap-0.5 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] w-fit">
            {controlBtn(handleStart, !!sim, 'Start', <Play size={14} />, 'Enter')}
            {controlBtn(handleStep, sim?.status !== 'running' && sim !== null, 'Step', <StepForward size={14} />, 'Enter')}
            {controlBtn(handleFastRun, false, 'Fast Run', <FastForward size={14} />)}
            {controlBtn(handleReset, false, 'Reset', <RotateCcw size={14} />)}
          </div>
          {/* Tape visualization */}
          {tapeViz ? (
            <div className="overflow-x-auto mt-1">
              <div className="flex items-end gap-0 font-mono text-xs">
                {[...tapeViz.str].map((ch, i) => {
                  const isHead = i === tapeViz.headIdx;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      {isHead && <div className="text-[var(--color-accent)] text-[10px] mb-0.5">▼</div>}
                      <span className={`w-6 h-6 flex items-center justify-center border shrink-0 ${
                        isHead
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--bg-primary)] font-bold'
                          : 'border-[var(--color-border)] bg-[var(--bg-surface-sunken)] text-[var(--color-text)]'
                      }`}>{ch}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="font-mono text-[11px] text-[var(--color-text-muted)] mt-1">
              {!hasInitial && states.length > 0
                ? <span className="text-[var(--color-reject)]">⚠ No initial state set</span>
                : 'Press Enter or ▶ to start'}
            </div>
          )}
        </div>

        {/* Right: State info + History */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3">
            {!sim ? (
              <div className="flex flex-col gap-2">
                <div className="font-mono text-[11px] text-[var(--color-text-muted)]">
                  TM · {states.length} states · Step limit: {maxSteps}
                </div>
                <div className="font-mono text-[11px] text-[var(--color-text-muted)] mt-auto">
                  Transition format: read→write,direction
                </div>
              </div>
            ) : (
              <>
                {/* Current state info */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[11px] text-[var(--color-text-dim)]">STATE</span>
                    <span className="font-mono text-xs text-[var(--color-accent)] font-medium">{stateMap.get(sim.stateId)?.label ?? '?'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[11px] text-[var(--color-text-dim)]">HEAD</span>
                    <span className="font-mono text-xs text-[var(--color-text)]">{sim.tape.head}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[11px] text-[var(--color-text-dim)]">STEP</span>
                    <span className="font-mono text-xs text-[var(--color-text)]">{sim.step}</span>
                  </div>
                </div>
                {/* History */}
                <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">
                  History ({sim.history.length})
                </div>
                <div className="space-y-0.5 max-h-[80px] overflow-y-auto">
                  {sim.history.map((h, i) => (
                    <div key={i} className={`font-mono text-[11px] py-0.5 ${i === sim.history.length - 1 ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}>
                      <span className="text-[var(--color-text-muted)] w-4 inline-block">{i}.</span>
                      {h.action}
                    </div>
                  ))}
                </div>
                {/* Result banner */}
                {sim.status !== 'running' && (
                  <div className={`font-mono text-xs px-2 py-1.5 border mt-2 ${
                    sim.status === 'accepted'
                      ? 'bg-[var(--color-accept)]/10 text-[var(--color-accept)] border-[var(--color-accept)]/20'
                      : 'bg-[var(--color-reject)]/10 text-[var(--color-reject)] border-[var(--color-reject)]/20'
                  }`}>
                    {sim.status === 'accepted' ? '✓' : '✗'} {sim.status === 'halted' ? `Halted after ${maxSteps} steps` : `String "${input || 'ε'}" is ${sim.status} by the TM`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
