'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { nfaToDFA, type NFAToDFAResult, type SubsetStep } from '@/conversions';
import { X, Play, StepForward, FastForward, RotateCcw, ArrowRightLeft, Check } from 'lucide-react';

export default function ConvertPanel({ isMobile, onClose }: { isMobile: boolean; onClose: () => void }) {
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);
  const mode = useStore(s => s.mode);
  const loadAutomaton = useStore(s => s.loadAutomaton);

  const [result, setResult] = useState<NFAToDFAResult | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [converted, setConverted] = useState(false);

  const canConvert = mode === 'nfa' && states.length > 0;

  const handleConvert = () => {
    const r = nfaToDFA(states, transitions);
    setResult(r);
    setStepIndex(-1);
    setConverted(false);
  };

  const handleStepForward = () => {
    if (!result) {
      handleConvert();
      return;
    }
    if (stepIndex < result.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleFastForward = () => {
    if (!result) handleConvert();
    if (result) setStepIndex(result.steps.length - 1);
  };

  const handleReset = () => {
    setResult(null);
    setStepIndex(-1);
    setConverted(false);
  };

  const handleApply = () => {
    if (!result) return;
    loadAutomaton(result.states, result.transitions, 'dfa');
    setConverted(true);
  };

  const visibleSteps = result ? result.steps.slice(0, stepIndex + 1) : [];

  return (
    <div className={`bg-[var(--bg-surface)] border-t border-[var(--color-border)] flex flex-col shrink-0 select-none ${isMobile ? 'max-h-[55vh]' : 'h-56'}`}>
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-3">
        <ArrowRightLeft size={12} className="text-[var(--color-accent)]" />
        <span className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase">NFA → DFA Conversion</span>
        <div className="flex-1" />

        {!canConvert && (
          <span className="font-mono text-[10px] text-[var(--color-reject)]">Switch to NFA mode first</span>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handleConvert}
            disabled={!canConvert}
            title="Run conversion"
            className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"
          >
            <Play size={14} />
          </button>
          <button
            onClick={handleStepForward}
            disabled={!canConvert || (result !== null && stepIndex >= result.steps.length - 1)}
            title="Step forward"
            className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"
          >
            <StepForward size={14} />
          </button>
          <button
            onClick={handleFastForward}
            disabled={!canConvert}
            title="Show all steps"
            className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"
          >
            <FastForward size={14} />
          </button>
          <button
            onClick={handleReset}
            title="Reset"
            className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        <div className="w-px h-4 bg-[var(--color-border)]" />

        <button onClick={onClose} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-text)]">
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {!result ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="font-mono text-xs text-[var(--color-text-dim)]">
                {canConvert
                  ? 'Press ▶ to run subset construction, or ⏭ to step through.'
                  : 'Build an NFA first, then convert it to a DFA.'}
              </p>
              {canConvert && (
                <p className="font-mono text-[10px] text-[var(--color-text-dim)] mt-1">
                  {states.length} states, {transitions.length} transitions
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Step log */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">
                Subset Construction Steps
                {result.steps.length > 0 && (
                  <span className="ml-2 text-[var(--color-accent)] normal-case">
                    ({Math.min(stepIndex + 1, result.steps.length)}/{result.steps.length})
                  </span>
                )}
              </div>

              {visibleSteps.length === 0 && stepIndex === -1 && (
                <p className="font-mono text-[10px] text-[var(--color-text-dim)]">
                  Press ⏩ to step through the construction...
                </p>
              )}

              <div className="space-y-1">
                {visibleSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`font-mono text-xs flex items-center gap-1 py-0.5 ${
                      i === stepIndex ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'
                    }`}
                  >
                    <span className="text-[10px] text-[var(--color-text-dim)] w-5 shrink-0">{i + 1}.</span>
                    <span>δ({step.subsetLabel}, {step.symbol})</span>
                    <span className="text-[var(--color-text-dim)]">=</span>
                    <span className={step.isNew ? 'text-[var(--color-accent)]' : ''}>
                      {step.resultLabel}
                    </span>
                    {step.isNew && (
                      <span className="text-[10px] text-[var(--color-accent)] ml-1">NEW</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Result summary */}
            <div className="w-48 border-l border-[var(--color-border)] px-3 py-2 flex flex-col gap-2 shrink-0">
              <div className="font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase">Result DFA</div>
              <div className="font-mono text-[10px] text-[var(--color-text-dim)]">
                {result.states.length} states
              </div>
              <div className="font-mono text-[10px] text-[var(--color-text-dim)]">
                {result.transitions.length} transitions
              </div>

              {/* DFA states list */}
              <div className="flex-1 overflow-y-auto space-y-0.5">
                {result.states.map(s => (
                  <div key={s.id} className="font-mono text-[10px] flex items-center gap-1">
                    {s.isInitial && <span className="text-[var(--color-accent)]">→</span>}
                    <span className={s.isAccepting ? 'text-[var(--color-accept)]' : 'text-[var(--color-text)]'}>
                      {s.label}
                    </span>
                    {s.isAccepting && <span className="text-[var(--color-accept)]">✓</span>}
                  </div>
                ))}
              </div>

              {/* Apply button */}
              <button
                onClick={handleApply}
                disabled={converted}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 font-mono text-[10px] tracking-wider transition-colors ${
                  converted
                    ? 'bg-[var(--color-accept)] text-[var(--bg-primary)]'
                    : 'bg-[var(--color-accent)] text-[var(--bg-primary)] hover:opacity-90'
                }`}
              >
                {converted ? <><Check size={12} /> APPLIED</> : 'APPLY DFA'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
