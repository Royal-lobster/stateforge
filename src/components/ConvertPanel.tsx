'use client';

import { useState, useRef, useCallback } from 'react';
import { useStore } from '@/store';
import {
  nfaToDFA, minimizeDFA, reToNFA, faToRegex, faToGrammar, combineDFA,
  type NFAToDFAResult, type MinimizationResult, type REToNFAResult,
  type FAToREResult, type FAToGrammarResult, type CombineResult, type CombineOp,
} from '@/conversions';
import {
  X, Play, StepForward, FastForward, RotateCcw,
  ArrowRightLeft, Check, GripHorizontal,
} from 'lucide-react';

type ConversionType = 'nfa2dfa' | 'minimize' | 're2nfa' | 'fa2re' | 'fa2grammar' | 'combine';

const TABS: { id: ConversionType; label: string; short: string }[] = [
  { id: 'nfa2dfa', label: 'NFA → DFA', short: 'N→D' },
  { id: 'minimize', label: 'DFA Minimize', short: 'MIN' },
  { id: 're2nfa', label: 'RE → NFA', short: 'R→N' },
  { id: 'fa2re', label: 'FA → RE', short: 'F→R' },
  { id: 'fa2grammar', label: 'FA → Grammar', short: 'F→G' },
  { id: 'combine', label: 'Combine', short: 'A∘B' },
];

export default function ConvertPanel({ isMobile, onClose }: { isMobile: boolean; onClose: () => void }) {
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);
  const mode = useStore(s => s.mode);
  const loadAutomaton = useStore(s => s.loadAutomaton);
  const setMode = useStore(s => s.setMode);

  const [tab, setTab] = useState<ConversionType>('nfa2dfa');
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // NFA → DFA state
  const [nfaResult, setNfaResult] = useState<NFAToDFAResult | null>(null);
  const [nfaStepIdx, setNfaStepIdx] = useState(-1);
  const [nfaApplied, setNfaApplied] = useState(false);

  // DFA Minimize state
  const [minResult, setMinResult] = useState<MinimizationResult | null>(null);
  const [minStepIdx, setMinStepIdx] = useState(-1);
  const [minApplied, setMinApplied] = useState(false);

  // RE → NFA state
  const [reInput, setReInput] = useState('');
  const [reResult, setReResult] = useState<REToNFAResult | null>(null);
  const [reStepIdx, setReStepIdx] = useState(-1);
  const [reApplied, setReApplied] = useState(false);

  // FA → RE state
  const [fareResult, setFareResult] = useState<FAToREResult | null>(null);
  const [fareStepIdx, setFareStepIdx] = useState(-1);

  // FA → Grammar state
  const [gramResult, setGramResult] = useState<FAToGrammarResult | null>(null);

  // Combine state
  const [combineOp, setCombineOp] = useState<CombineOp>('union');
  const [combineReB, setCombineReB] = useState(''); // RE string for second automaton
  const [combineResult, setCombineResult] = useState<CombineResult | null>(null);
  const [combineStepIdx, setCombineStepIdx] = useState(-1);
  const [combineApplied, setCombineApplied] = useState(false);

  // Swipe gesture for mobile
  const touchStartY = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (dy > 40) setMobileExpanded(true);
    if (dy < -40) setMobileExpanded(false);
  }, []);

  const resetAll = () => {
    setNfaResult(null); setNfaStepIdx(-1); setNfaApplied(false);
    setMinResult(null); setMinStepIdx(-1); setMinApplied(false);
    setReResult(null); setReStepIdx(-1); setReApplied(false);
    setFareResult(null); setFareStepIdx(-1);
    setGramResult(null);
    setCombineResult(null); setCombineStepIdx(-1); setCombineApplied(false);
  };

  const switchTab = (t: ConversionType) => { setTab(t); resetAll(); };

  // ── Tab content renderers ──

  const renderNFA2DFA = () => {
    const canRun = mode === 'nfa' && states.length > 0;
    const run = () => { const r = nfaToDFA(states, transitions); setNfaResult(r); setNfaStepIdx(-1); setNfaApplied(false); };
    const stepFwd = () => {
      if (!nfaResult) { run(); return; }
      if (nfaStepIdx < nfaResult.steps.length - 1) setNfaStepIdx(nfaStepIdx + 1);
    };
    const ffwd = () => { if (!nfaResult) run(); setNfaResult(prev => { if (prev) setNfaStepIdx(prev.steps.length - 1); return prev; }); };
    const apply = () => { if (nfaResult) { loadAutomaton(nfaResult.states, nfaResult.transitions, 'dfa'); setNfaApplied(true); } };
    const visibleSteps = nfaResult ? nfaResult.steps.slice(0, nfaStepIdx + 1) : [];

    return (
      <>
        {renderControls(canRun, run, stepFwd, ffwd, () => { setNfaResult(null); setNfaStepIdx(-1); setNfaApplied(false); },
          !canRun ? 'Switch to NFA mode first' : undefined)}
        <div className="flex-1 flex overflow-hidden">
          {!nfaResult ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-mono text-xs text-[var(--color-text-dim)]">
                {canRun ? 'Press ▶ to run subset construction.' : 'Build an NFA first, then convert.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-2">
                <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">
                  Steps <span className="text-[var(--color-accent)] normal-case ml-1">({Math.min(nfaStepIdx + 1, nfaResult.steps.length)}/{nfaResult.steps.length})</span>
                </div>
                {visibleSteps.length === 0 && <p className="font-mono text-[11px] text-[var(--color-text-dim)]">Press ⏩ to step through...</p>}
                <div className="space-y-0.5">
                  {visibleSteps.map((step, i) => (
                    <div key={i} className={`font-mono text-xs flex items-center gap-1 py-0.5 ${i === nfaStepIdx ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}>
                      <span className="text-[11px] w-5 shrink-0">{i + 1}.</span>
                      <span>δ({step.subsetLabel}, {step.symbol}) = {step.resultLabel}</span>
                      {step.isNew && <span className="text-[11px] text-[var(--color-accent)] ml-1">NEW</span>}
                    </div>
                  ))}
                </div>
              </div>
              {renderResultSidebar(nfaResult.states, nfaResult.transitions, nfaApplied, apply)}
            </>
          )}
        </div>
      </>
    );
  };

  const renderMinimize = () => {
    const canRun = mode === 'dfa' && states.length > 0;
    const run = () => { const r = minimizeDFA(states, transitions); setMinResult(r); setMinStepIdx(-1); setMinApplied(false); };
    const stepFwd = () => {
      if (!minResult) { run(); return; }
      if (minStepIdx < minResult.steps.length - 1) setMinStepIdx(minStepIdx + 1);
    };
    const ffwd = () => { if (!minResult) run(); setMinResult(prev => { if (prev) setMinStepIdx(prev.steps.length - 1); return prev; }); };
    const apply = () => { if (minResult) { loadAutomaton(minResult.states, minResult.transitions, 'dfa'); setMinApplied(true); } };
    const visibleSteps = minResult ? minResult.steps.slice(0, minStepIdx + 1) : [];

    return (
      <>
        {renderControls(canRun, run, stepFwd, ffwd, () => { setMinResult(null); setMinStepIdx(-1); setMinApplied(false); },
          !canRun ? 'Switch to DFA mode first' : undefined)}
        <div className="flex-1 flex overflow-hidden">
          {!minResult ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-mono text-xs text-[var(--color-text-dim)]">
                {canRun ? 'Press ▶ to minimize the DFA (table-filling).' : 'Build a DFA first.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-2">
                <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">
                  Distinguishable Pairs <span className="text-[var(--color-accent)] normal-case ml-1">({Math.min(minStepIdx + 1, minResult.steps.length)}/{minResult.steps.length})</span>
                </div>
                {minResult.removedCount === 0 && (
                  <p className="font-mono text-xs text-[var(--color-accept)] mb-2">DFA is already minimal!</p>
                )}
                {visibleSteps.length === 0 && minResult.steps.length > 0 && (
                  <p className="font-mono text-[11px] text-[var(--color-text-dim)]">Press ⏩ to step through...</p>
                )}
                <div className="space-y-0.5">
                  {visibleSteps.map((step, i) => (
                    <div key={i} className={`font-mono text-xs py-0.5 ${i === minStepIdx ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}>
                      <span className="text-[11px] w-5 inline-block">{i + 1}.</span>
                      <span className="text-[var(--color-reject)]">✗ </span>
                      ({step.stateA}, {step.stateB})
                      <span className="text-[11px] ml-2">{step.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
              {renderResultSidebar(minResult.states, minResult.transitions, minApplied, apply,
                minResult.removedCount > 0 ? `${minResult.removedCount} state${minResult.removedCount > 1 ? 's' : ''} removed` : undefined)}
            </>
          )}
        </div>
      </>
    );
  };

  const renderRE2NFA = () => {
    const canRun = reInput.trim().length > 0;
    const run = () => { const r = reToNFA(reInput.trim()); setReResult(r); setReStepIdx(-1); setReApplied(false); };
    const stepFwd = () => {
      if (!reResult) { run(); return; }
      if (reStepIdx < reResult.steps.length - 1) setReStepIdx(reStepIdx + 1);
    };
    const ffwd = () => { if (!reResult) run(); setReResult(prev => { if (prev) setReStepIdx(prev.steps.length - 1); return prev; }); };
    const apply = () => {
      if (reResult && !reResult.error) {
        loadAutomaton(reResult.states, reResult.transitions, 'nfa');
        setReApplied(true);
      }
    };
    const visibleSteps = reResult ? reResult.steps.slice(0, reStepIdx + 1) : [];

    return (
      <>
        <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-2">
          <span className="font-mono text-[11px] text-[var(--color-text-dim)] shrink-0">RE</span>
          <input
            value={reInput}
            onChange={e => { setReInput(e.target.value); setReResult(null); setReStepIdx(-1); setReApplied(false); }}
            className="flex-1 bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)]"
            placeholder="e.g. (a|b)*abb"
          />
          <div className="flex items-center gap-0.5">
            <button onClick={run} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><Play size={14} /></button>
            <button onClick={stepFwd} disabled={!canRun || (reResult !== null && reStepIdx >= reResult.steps.length - 1)} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><StepForward size={14} /></button>
            <button onClick={ffwd} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><FastForward size={14} /></button>
            <button onClick={() => { setReResult(null); setReStepIdx(-1); setReApplied(false); }} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={14} /></button>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {!reResult ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center font-mono text-[11px] text-[var(--color-text-dim)] space-y-1">
                <p>Enter a regular expression and press ▶</p>
                <p>Supported: a-z, 0-9, | (union), * + ? (quantifiers), () groups, ε</p>
              </div>
            </div>
          ) : reResult.error ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-mono text-xs text-[var(--color-reject)]">Error: {reResult.error}</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-2">
                <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">
                  Thompson&apos;s Construction <span className="text-[var(--color-accent)] normal-case ml-1">({Math.min(reStepIdx + 1, reResult.steps.length)}/{reResult.steps.length})</span>
                </div>
                <div className="space-y-0.5">
                  {visibleSteps.map((step, i) => (
                    <div key={i} className={`font-mono text-xs py-0.5 ${i === reStepIdx ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}>
                      <span className="text-[11px] w-5 inline-block">{i + 1}.</span>
                      {step.description}
                    </div>
                  ))}
                </div>
              </div>
              {renderResultSidebar(reResult.states, reResult.transitions, reApplied, apply)}
            </>
          )}
        </div>
      </>
    );
  };

  const renderFA2RE = () => {
    const canRun = states.length > 0;
    const run = () => { const r = faToRegex(states, transitions); setFareResult(r); setFareStepIdx(-1); };
    const stepFwd = () => {
      if (!fareResult) { run(); return; }
      if (fareStepIdx < fareResult.steps.length - 1) setFareStepIdx(fareStepIdx + 1);
    };
    const ffwd = () => { if (!fareResult) run(); setFareResult(prev => { if (prev) setFareStepIdx(prev.steps.length - 1); return prev; }); };
    const visibleSteps = fareResult ? fareResult.steps.slice(0, fareStepIdx + 1) : [];

    return (
      <>
        {renderControls(canRun, run, stepFwd, ffwd, () => { setFareResult(null); setFareStepIdx(-1); },
          !canRun ? 'Build an automaton first' : undefined)}
        <div className="flex-1 flex overflow-hidden">
          {!fareResult ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-mono text-xs text-[var(--color-text-dim)]">
                {canRun ? 'Press ▶ to convert via state elimination.' : 'Build an FA first.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-2">
                <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">
                  State Elimination <span className="text-[var(--color-accent)] normal-case ml-1">({Math.min(fareStepIdx + 1, fareResult.steps.length)}/{fareResult.steps.length})</span>
                </div>
                <div className="space-y-0.5">
                  {visibleSteps.map((step, i) => (
                    <div key={i} className={`font-mono text-xs py-0.5 ${i === fareStepIdx ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}>
                      <span className="text-[11px] w-5 inline-block">{i + 1}.</span>
                      Eliminate <span className="text-[var(--color-reject)]">{step.eliminatedState}</span>
                      <span className="text-[11px] ml-2">({step.edgesUpdated} edges updated)</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-52 border-l border-[var(--color-border)] px-3 py-2 flex flex-col gap-2 shrink-0">
                <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase">Result RE</div>
                <div className="flex-1 overflow-y-auto">
                  <div className="font-mono text-sm text-[var(--color-accent)] break-all leading-relaxed">
                    {fareResult.regex}
                  </div>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(fareResult.regex); }}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 font-mono text-[11px] tracking-wider bg-[var(--color-accent)] text-[var(--bg-primary)] hover:opacity-90"
                >
                  COPY RE
                </button>
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  const renderFA2Grammar = () => {
    const canRun = states.length > 0;
    const run = () => { setGramResult(faToGrammar(states, transitions)); };

    return (
      <>
        {renderControls(canRun, run, run, run, () => setGramResult(null),
          !canRun ? 'Build an automaton first' : undefined)}
        <div className="flex-1 flex overflow-hidden">
          {!gramResult ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-mono text-xs text-[var(--color-text-dim)]">
                {canRun ? 'Press ▶ to generate right-linear grammar.' : 'Build an FA first.'}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">
                Right-Linear Grammar <span className="text-[var(--color-accent)] normal-case ml-1">(start: {gramResult.startSymbol})</span>
              </div>
              <div className="space-y-0.5">
                {gramResult.productions.map((p, i) => (
                  <div key={i} className="font-mono text-xs text-[var(--color-text)]">
                    <span className="text-[var(--color-accent)]">{p.head}</span>
                    <span className="text-[var(--color-text-dim)]"> → </span>
                    <span>{p.body}</span>
                  </div>
                ))}
              </div>
              {gramResult.productions.length > 0 && (
                <button
                  onClick={() => {
                    const text = gramResult.productions.map(p => `${p.head} → ${p.body}`).join('\n');
                    navigator.clipboard.writeText(text);
                  }}
                  className="mt-3 flex items-center justify-center gap-1 px-2 py-1.5 font-mono text-[11px] tracking-wider bg-[var(--color-accent)] text-[var(--bg-primary)] hover:opacity-90"
                >
                  COPY GRAMMAR
                </button>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  // ── Shared UI pieces ──

  const renderControls = (
    canRun: boolean,
    onRun: () => void,
    onStep: () => void,
    onFfwd: () => void,
    onReset: () => void,
    warning?: string,
  ) => (
    <div className="px-3 py-1 border-b border-[var(--color-border)] flex items-center gap-2">
      {warning && <span className="font-mono text-[11px] text-[var(--color-reject)]">{warning}</span>}
      <div className="flex-1" />
      <div className="flex items-center gap-0.5">
        <button onClick={onRun} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><Play size={14} /></button>
        <button onClick={onStep} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><StepForward size={14} /></button>
        <button onClick={onFfwd} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><FastForward size={14} /></button>
        <button onClick={onReset} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={14} /></button>
      </div>
    </div>
  );

  const renderResultSidebar = (
    rStates: { id: string; label: string; isInitial: boolean; isAccepting: boolean }[],
    rTransitions: { id: string }[],
    applied: boolean,
    onApply: () => void,
    extra?: string,
  ) => (
    <div className={`border-l border-[var(--color-border)] px-3 py-2 flex flex-col gap-2 shrink-0 ${isMobile ? 'w-36' : 'w-44'}`}>
      <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase">Result</div>
      <div className="font-mono text-[11px] text-[var(--color-text-dim)]">{rStates.length} states, {rTransitions.length} transitions</div>
      {extra && <div className="font-mono text-[11px] text-[var(--color-accept)]">{extra}</div>}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {rStates.map(s => (
          <div key={s.id} className="font-mono text-[11px] flex items-center gap-1">
            {s.isInitial && <span className="text-[var(--color-accent)]">→</span>}
            <span className={s.isAccepting ? 'text-[var(--color-accept)]' : 'text-[var(--color-text)]'}>{s.label}</span>
            {s.isAccepting && <span className="text-[var(--color-accept)]">✓</span>}
          </div>
        ))}
      </div>
      <button
        onClick={onApply}
        disabled={applied}
        className={`flex items-center justify-center gap-1 px-2 py-1.5 font-mono text-[11px] tracking-wider transition-colors ${
          applied ? 'bg-[var(--color-accept)] text-[var(--bg-primary)]' : 'bg-[var(--color-accent)] text-[var(--bg-primary)] hover:opacity-90'
        }`}
      >
        {applied ? <><Check size={12} /> APPLIED</> : 'APPLY'}
      </button>
    </div>
  );

  const renderCombine = () => {
    const canRun = mode === 'dfa' && states.length > 0 && (combineOp === 'complement' || combineReB.trim().length > 0);
    const isComplement = combineOp === 'complement';

    const run = () => {
      if (isComplement) {
        const r = combineDFA(states, transitions, [], [], 'complement');
        setCombineResult(r); setCombineStepIdx(-1); setCombineApplied(false);
        return;
      }
      // Build DFA B from RE: RE → NFA → DFA
      const nfa = reToNFA(combineReB.trim());
      if (nfa.error || nfa.states.length === 0) return;
      const dfa = nfaToDFA(nfa.states, nfa.transitions);
      const r = combineDFA(states, transitions, dfa.states, dfa.transitions, combineOp);
      setCombineResult(r); setCombineStepIdx(-1); setCombineApplied(false);
    };

    const stepFwd = () => {
      if (!combineResult) { run(); return; }
      if (combineStepIdx < combineResult.steps.length - 1) setCombineStepIdx(combineStepIdx + 1);
    };
    const ffwd = () => { if (!combineResult) run(); setCombineResult(prev => { if (prev) setCombineStepIdx(prev.steps.length - 1); return prev; }); };
    const apply = () => {
      if (combineResult) {
        loadAutomaton(combineResult.states, combineResult.transitions, 'dfa');
        setCombineApplied(true);
      }
    };
    const visibleSteps = combineResult ? combineResult.steps.slice(0, combineStepIdx + 1) : [];

    const opButtons: { id: CombineOp; label: string; symbol: string }[] = [
      { id: 'union', label: 'Union', symbol: '∪' },
      { id: 'intersection', label: 'Intersection', symbol: '∩' },
      { id: 'difference', label: 'Difference', symbol: '−' },
      { id: 'complement', label: 'Complement', symbol: '¬' },
    ];

    return (
      <>
        <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] text-[var(--color-text-dim)] shrink-0">OP</span>
          <div className="flex items-center gap-0">
            {opButtons.map(o => (
              <button
                key={o.id}
                onClick={() => { setCombineOp(o.id); setCombineResult(null); setCombineStepIdx(-1); setCombineApplied(false); }}
                className={`px-2 py-1 font-mono text-[11px] transition-colors ${
                  combineOp === o.id ? 'text-[var(--color-accent)] bg-[var(--bg-primary)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
                title={o.label}
              >
                {o.symbol}
              </button>
            ))}
          </div>
          {!isComplement && (
            <>
              <span className="font-mono text-[11px] text-[var(--color-text-dim)] shrink-0">B (RE)</span>
              <input
                value={combineReB}
                onChange={e => { setCombineReB(e.target.value); setCombineResult(null); }}
                className="flex-1 min-w-[100px] bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)]"
                placeholder="RE for automaton B, e.g. (a|b)*a"
              />
            </>
          )}
          {mode !== 'dfa' && <span className="font-mono text-[11px] text-[var(--color-reject)]">Switch to DFA mode</span>}
          <div className="flex items-center gap-0.5 ml-auto">
            <button onClick={run} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><Play size={14} /></button>
            <button onClick={stepFwd} disabled={!canRun || (combineResult !== null && combineStepIdx >= combineResult.steps.length - 1)} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><StepForward size={14} /></button>
            <button onClick={ffwd} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><FastForward size={14} /></button>
            <button onClick={() => { setCombineResult(null); setCombineStepIdx(-1); setCombineApplied(false); }} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={14} /></button>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {!combineResult ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center font-mono text-[11px] text-[var(--color-text-dim)] space-y-1">
                <p>Canvas automaton = A (must be DFA)</p>
                {isComplement ? <p>Complement flips accepting states on A</p> : <p>Enter a RE for automaton B, then press ▶</p>}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-2">
                <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-2">
                  Product Construction <span className="text-[var(--color-accent)] normal-case ml-1">({Math.min(combineStepIdx + 1, combineResult.steps.length)}/{combineResult.steps.length})</span>
                </div>
                <div className="space-y-0.5">
                  {visibleSteps.map((step, i) => (
                    <div key={i} className={`font-mono text-xs py-0.5 ${i === combineStepIdx ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}>
                      <span className="text-[11px] w-5 inline-block">{i + 1}.</span>
                      δ({step.pairLabel}, {step.symbol}) = {step.resultLabel}
                      {step.isNew && <span className="text-[11px] text-[var(--color-accent)] ml-1">NEW</span>}
                    </div>
                  ))}
                </div>
              </div>
              {renderResultSidebar(combineResult.states, combineResult.transitions, combineApplied, apply)}
            </>
          )}
        </div>
      </>
    );
  };

  const content = (
    <>
      {tab === 'nfa2dfa' && renderNFA2DFA()}
      {tab === 'minimize' && renderMinimize()}
      {tab === 're2nfa' && renderRE2NFA()}
      {tab === 'fa2re' && renderFA2RE()}
      {tab === 'fa2grammar' && renderFA2Grammar()}
      {tab === 'combine' && renderCombine()}
    </>
  );

  return (
    <div
      className={`bg-[var(--bg-surface)] border-t border-[var(--color-border)] flex flex-col shrink-0 select-none ${
        isMobile ? (mobileExpanded ? 'max-h-[65vh]' : 'max-h-[200px]') : 'h-56'
      }`}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Tab bar + close */}
      <div className="flex items-center border-b border-[var(--color-border)] shrink-0">
        {isMobile && (
          <div className="px-2 py-1 cursor-grab" onClick={() => setMobileExpanded(!mobileExpanded)}>
            <GripHorizontal size={16} className="text-[var(--color-border)]" />
          </div>
        )}
        <ArrowRightLeft size={12} className="text-[var(--color-accent)] ml-2 shrink-0" />
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide flex-1 ml-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`px-2 py-1.5 font-mono text-[11px] tracking-wider whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'text-[var(--color-accent)] border-b border-[var(--color-accent)]'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
              }`}
            >
              {isMobile ? t.short : t.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="p-2 text-[var(--color-text-dim)] hover:text-[var(--color-text)] shrink-0">
          <X size={14} />
        </button>
      </div>

      {/* Tab content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {content}
      </div>
    </div>
  );
}
