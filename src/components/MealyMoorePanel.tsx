'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { mealyRun, mooreRun, type MealySimState, type MooreSimState } from '@/mealy-moore';
import { Play, RotateCcw } from 'lucide-react';

export default function MealyMoorePanel({ isMobile }: { isMobile: boolean }) {
  const showSimPanel = useStore(s => s.showSimPanel);
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);
  const mode = useStore(s => s.mode);

  const [input, setInput] = useState('');
  const [mealyResult, setMealyResult] = useState<MealySimState | null>(null);
  const [mooreResult, setMooreResult] = useState<MooreSimState | null>(null);

  if (!showSimPanel) return null;

  const isMealy = mode === 'mealy';

  const handleRun = () => {
    if (isMealy) {
      setMealyResult(mealyRun(states, transitions, input));
      setMooreResult(null);
    } else {
      setMooreResult(mooreRun(states, transitions, input));
      setMealyResult(null);
    }
  };

  const handleReset = () => { setMealyResult(null); setMooreResult(null); };

  const outputStr = isMealy ? mealyResult?.outputStr : mooreResult?.outputStr;
  const status = isMealy ? mealyResult?.status : mooreResult?.status;
  const steps = isMealy ? mealyResult?.steps : mooreResult?.steps;

  return (
    <div className={`bg-[var(--bg-surface)] border-t border-[var(--color-border)] flex flex-col shrink-0 select-none ${isMobile ? 'max-h-[50vh]' : 'h-44'}`}>
      <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase">
          {isMealy ? 'Mealy Machine' : 'Moore Machine'}
        </span>
        {status && (
          <span className="font-mono text-[10px] font-bold" style={{
            color: status === 'done' ? 'var(--color-accept)' : status === 'error' ? 'var(--color-reject)' : 'var(--color-sim-active)',
          }}>
            {status === 'done' ? 'COMPLETE' : 'ERROR'}
          </span>
        )}
      </div>
      <div className="flex-1 flex gap-3 px-3 py-2 overflow-hidden">
        <div className="flex flex-col gap-2 w-64 shrink-0">
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-[var(--color-text-dim)] w-10 shrink-0">INPUT</span>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); handleReset(); }}
              className="flex-1 bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)]"
              placeholder="Input string..."
            />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><Play size={14} /></button>
            <button onClick={handleReset} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={14} /></button>
          </div>
          {outputStr !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[var(--color-text-dim)]">OUTPUT</span>
              <span className="font-mono text-sm text-[var(--color-accent)] font-bold">{outputStr || 'ε'}</span>
            </div>
          )}
          {isMealy && (
            <div className="text-[var(--color-text-dim)] font-mono text-[10px]">
              Transitions: input/output (e.g. a/1)
            </div>
          )}
          {!isMealy && (
            <div className="text-[var(--color-text-dim)] font-mono text-[10px]">
              State labels: name/output (e.g. q0/0)
            </div>
          )}
        </div>
        {/* Steps */}
        <div className="flex-1 overflow-y-auto">
          {steps && steps.length > 0 && (
            <table className="w-full font-mono text-[10px]">
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
                {steps.map((s, i) => (
                  <tr key={i} className="text-[var(--color-text)]">
                    <td className="pr-2 text-[var(--color-text-dim)]">{i + 1}</td>
                    <td className="pr-2">{isMealy ? (s as any).stateLabel : (s as any).stateLabel}</td>
                    <td className="pr-2">{(s as any).input}</td>
                    <td className="pr-2 text-[var(--color-accent)]">{isMealy ? (s as any).output : (s as any).stateOutput}</td>
                    <td>{(s as any).nextState}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
