'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { mealyRun, mooreRun, type MealySimState, type MooreSimState } from '@/mealy-moore';
import { Play, StepForward, FastForward, RotateCcw } from 'lucide-react';

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

  // Build partial output string from visible steps
  const outputStr = isMealy
    ? (mooreResult ? '' : shownSteps.map(s => (s as MealySimState['steps'][0]).output).join(''))
    : (!isMealy && mooreResult
      ? (mooreResult.steps.length > 0 ? mooreResult.outputStr.slice(0, visibleSteps + 1) : mooreResult.outputStr)
      : '');
  const fullOutput = result ? (isMealy ? mealyResult?.outputStr : mooreResult?.outputStr) : undefined;
  const displayOutput = visibleSteps >= allSteps.length ? fullOutput : (isMealy
    ? shownSteps.map(s => (s as MealySimState['steps'][0]).output).join('')
    : fullOutput?.slice(0, visibleSteps + 1));

  return (
    <div className={`bg-[var(--bg-surface)] border-t border-[var(--color-border)] flex flex-col shrink-0 select-none ${isMobile ? 'max-h-[50vh]' : 'h-52'}`}>
      <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase">
          {isMealy ? 'Mealy Machine' : 'Moore Machine'}
        </span>
        {status && (
          <span className="font-mono text-[11px] font-bold" style={{
            color: status === 'done' ? 'var(--color-accept)' : 'var(--color-reject)',
          }}>
            {status === 'done' ? 'COMPLETE' : 'ERROR'}
          </span>
        )}
        {result && (
          <span className="font-mono text-[11px] text-[var(--color-text-dim)]">
            ({visibleSteps}/{allSteps.length})
          </span>
        )}
      </div>
      <div className="flex-1 flex gap-3 px-3 py-2 overflow-hidden">
        <div className="flex flex-col gap-2 w-64 shrink-0">
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
            <button onClick={handleStep} disabled={result !== null && visibleSteps >= allSteps.length} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30" aria-label="Step"><StepForward size={14} /></button>
            <button onClick={handleRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]" aria-label="Fast run"><FastForward size={14} /></button>
            <button onClick={handleReset} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]" aria-label="Reset"><RotateCcw size={14} /></button>
          </div>
          {displayOutput !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--color-text-dim)]">OUTPUT</span>
              <span className="font-mono text-sm text-[var(--color-accent)] font-bold">{displayOutput || 'ε'}</span>
            </div>
          )}
          <div className="text-[var(--color-text-dim)] font-mono text-[11px]">
            {isMealy ? 'Transitions: input/output (e.g. a/1)' : 'State labels: name/output (e.g. q0/0)'}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {shownSteps.length > 0 && (
            <table className="w-full font-mono text-[11px]">
              <thead>
                <tr className="text-[var(--color-text-dim)]">
                  <td className="pb-1 pr-2">#</td>
                  <td className="pb-1 pr-2">State</td>
                  <td className="pb-1 pr-2">Input</td>
                  <td className="pb-1 pr-2">Output</td>
                  <td className="pb-1">Next</td>
                </tr>
              </thead>
              <tbody>
                {shownSteps.map((s, i) => {
                  const mStep = s as MealySimState['steps'][0];
                  const moStep = s as MooreSimState['steps'][0];
                  return (
                    <tr key={i} className={`text-[var(--color-text)] ${i === visibleSteps - 1 ? 'text-[var(--color-accent)]' : ''}`}>
                      <td className="pr-2 text-[var(--color-text-dim)]">{i + 1}</td>
                      <td className="pr-2">{mStep.stateLabel}</td>
                      <td className="pr-2">{isMealy ? mStep.input : moStep.input}</td>
                      <td className="pr-2 text-[var(--color-accent)]">{isMealy ? mStep.output : moStep.stateOutput}</td>
                      <td>{isMealy ? mStep.nextState : moStep.nextState}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
