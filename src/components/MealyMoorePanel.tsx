'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { mealyRun, mooreRun, type MealySimState, type MooreSimState } from '@/lib/mealy-moore';
import { StepForward, FastForward, RotateCcw, Zap } from 'lucide-react';
import Tooltip from './Tooltip';

export default function MealyMoorePanel({ isMobile }: { isMobile: boolean }) {
  const showSimPanel = useStore(s => s.showSimPanel);
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);
  const mode = useStore(s => s.mode);

  const [input, setInput] = useState('');
  const [mealyResult, setMealyResult] = useState<MealySimState | null>(null);
  const [mooreResult, setMooreResult] = useState<MooreSimState | null>(null);
  const [visibleSteps, setVisibleSteps] = useState(0);

  if (!showSimPanel) return null;

  const isMealy = mode === 'mealy';
  const hasInitial = states.some(s => s.isInitial);

  const handleRun = () => {
    if (isMealy) {
      const r = mealyRun(states, transitions, input);
      setMealyResult(r); setMooreResult(null);
      setVisibleSteps(r.steps.length);
    } else {
      const r = mooreRun(states, transitions, input);
      setMooreResult(r); setMealyResult(null);
      setVisibleSteps(r.steps.length);
    }
  };

  const handleStep = () => {
    if (!mealyResult && !mooreResult) {
      if (isMealy) {
        const r = mealyRun(states, transitions, input);
        setMealyResult(r); setMooreResult(null);
        setVisibleSteps(1);
      } else {
        const r = mooreRun(states, transitions, input);
        setMooreResult(r); setMealyResult(null);
        setVisibleSteps(1);
      }
      return;
    }
    const totalSteps = (isMealy ? mealyResult?.steps.length : mooreResult?.steps.length) ?? 0;
    if (visibleSteps < totalSteps) setVisibleSteps(visibleSteps + 1);
  };

  const handleReset = () => {
    setMealyResult(null); setMooreResult(null); setVisibleSteps(0);
  };

  const result = isMealy ? mealyResult : mooreResult;
  const status = result?.status;
  const allSteps = result?.steps ?? [];
  const shownSteps = allSteps.slice(0, visibleSteps);
  const fullOutput = result ? (isMealy ? mealyResult?.outputStr : mooreResult?.outputStr) : undefined;
  const displayOutput = visibleSteps >= allSteps.length ? fullOutput : (isMealy
    ? shownSteps.map(s => (s as MealySimState['steps'][0]).output).join('')
    : fullOutput?.slice(0, visibleSteps + 1));

  const statusColor = !result ? 'var(--color-text-muted)'
    : status === 'done' ? 'var(--color-accept)' : 'var(--color-reject)';
  const statusText = !result ? 'IDLE'
    : status === 'done' ? 'COMPLETE' : 'ERROR';

  // Sync canvas highlighting
  useEffect(() => {
    if (result && shownSteps.length > 0) {
      const lastStep = shownSteps[shownSteps.length - 1] as { nextState?: string; stateLabel?: string };
      // Find state id by label
      const label = lastStep.nextState || lastStep.stateLabel;
      const st = states.find(s => s.label === label);
      if (st) useStore.setState({ simCurrentStates: new Set([st.id]), simStatus: 'stepping' });
    } else if (!result) {
      useStore.setState({ simCurrentStates: new Set(), simStatus: 'idle' });
    }
  }, [result, visibleSteps, shownSteps, states]);

  const controlBtn = (onClick: () => void, disabled: boolean, title: string, icon: React.ReactNode, shortcut?: string) => (
    <Tooltip label={title} shortcut={shortcut} position="top">
      <button onClick={onClick} disabled={disabled} aria-label={title}
        className="p-1.5 flex items-center justify-center text-[var(--color-text-dim)] hover:text-[var(--color-accent)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
        {icon}
      </button>
    </Tooltip>
  );

  return (
    <div className={`bg-[var(--bg-surface-raised)] border-t border-[var(--color-border)] shadow-panel flex flex-col shrink-0 select-none ${isMobile ? '' : 'h-56'}`}>
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-3">
        <Zap size={11} className="text-[var(--color-accent)]" />
        <span className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase font-medium">
          {isMealy ? 'Mealy Machine' : 'Moore Machine'}
        </span>
        <span className="font-mono text-sm font-bold" style={{ color: statusColor }}>{statusText}</span>
        {result && (
          <span className="font-mono text-[11px] text-[var(--color-text-dim)]">
            ({visibleSteps}/{allSteps.length})
          </span>
        )}
      </div>

      {/* Body */}
      <div className={`flex-1 flex overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
        {/* Left: Input + Controls */}
        <div className={`flex flex-col gap-2 p-3 ${isMobile ? '' : 'w-72 border-r border-[var(--color-border)]'}`}>
          <div className="flex items-center gap-1">
            <span className="font-mono text-[11px] text-[var(--color-text-dim)] w-10 shrink-0">INPUT</span>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); handleReset(); }}
              className="flex-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1.5 outline-none focus:border-[var(--color-accent)]"
              placeholder="Input string..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleStep(); }}}
            />
          </div>
          <div className="flex items-center gap-0.5 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] w-fit">
            {controlBtn(handleStep, result !== null && visibleSteps >= allSteps.length, 'Step', <StepForward size={14} />, 'Enter')}
            {controlBtn(handleRun, false, 'Fast Run', <FastForward size={14} />)}
            {controlBtn(handleReset, false, 'Reset', <RotateCcw size={14} />)}
          </div>
          {/* Output display */}
          {displayOutput !== undefined ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[11px] text-[var(--color-text-dim)]">OUTPUT</span>
              <span className="font-mono text-sm text-[var(--color-accent)] font-bold tracking-wider">{displayOutput || 'ε'}</span>
            </div>
          ) : (
            <div className="font-mono text-[11px] text-[var(--color-text-muted)] mt-1">
              {!hasInitial && states.length > 0
                ? <span className="text-[var(--color-reject)]">⚠ No initial state set</span>
                : isMealy ? 'Transition: input/output (e.g. a/1)' : 'State label: name/output (e.g. q0/0)'}
            </div>
          )}
        </div>

        {/* Right: Step table */}
        <div className="flex-1 overflow-y-auto p-3">
          {shownSteps.length > 0 ? (
            <table className="w-full font-mono text-[11px]">
              <thead>
                <tr className="text-[var(--color-text-dim)] border-b border-[var(--color-border)]">
                  <td className="pb-1 pr-3">#</td>
                  <td className="pb-1 pr-3">State</td>
                  <td className="pb-1 pr-3">Input</td>
                  <td className="pb-1 pr-3">Output</td>
                  <td className="pb-1">Next</td>
                </tr>
              </thead>
              <tbody>
                {shownSteps.map((s, i) => {
                  const mStep = s as MealySimState['steps'][0];
                  const moStep = s as MooreSimState['steps'][0];
                  return (
                    <tr key={i} className={i === visibleSteps - 1 ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}>
                      <td className="py-0.5 pr-3 text-[var(--color-text-dim)]">{i + 1}</td>
                      <td className="py-0.5 pr-3">{mStep.stateLabel}</td>
                      <td className="py-0.5 pr-3">{isMealy ? mStep.input : moStep.input}</td>
                      <td className="py-0.5 pr-3 text-[var(--color-accent)]">{isMealy ? mStep.output : moStep.stateOutput}</td>
                      <td className="py-0.5">{isMealy ? mStep.nextState : moStep.nextState}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col gap-2">
              <div className="font-mono text-[11px] text-[var(--color-text-muted)]">
                {isMealy ? 'Mealy' : 'Moore'} · {states.length} states
              </div>
              {status === 'error' && result && (
                <div className="font-mono text-xs px-2 py-1.5 border bg-[var(--color-reject)]/10 text-[var(--color-reject)] border-[var(--color-reject)]/20">
                  ✗ No valid transition found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
