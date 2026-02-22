'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import {
  nfaToDFA, minimizeDFA, reToNFA, faToRegex, faToGrammar, combineDFA,
  type NFAToDFAResult, type MinimizationResult, type REToNFAResult,
  type FAToREResult, type FAToGrammarResult, type CombineResult, type CombineOp,
} from '@/lib/conversions';
import {
  X, Play, Pause, StepForward, FastForward, RotateCcw,
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
  const setConversionHighlight = useStore(s => s.setConversionHighlight);
  const conversionHighlightLabel = useStore(s => s.conversionHighlight?.label);

  const [tab, setTab] = useState<ConversionType>('nfa2dfa');
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Auto-play state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(500); // ms
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
  const [combineReB, setCombineReB] = useState('');
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

  // ── Highlight sync ──
  // Update store highlights whenever step changes
  useEffect(() => {
    if (tab === 'nfa2dfa' && nfaResult && nfaStepIdx >= 0) {
      const step = nfaResult.steps[nfaStepIdx];
      if (step) {
        // Find NFA state IDs in the current subset being processed
        const highlightedStates = new Set<string>();
        // The subsetKey maps to NFA state IDs via subsetMap... but subsetMap maps DFA id -> NFA ids
        // We need to find the DFA state whose label matches subsetLabel, then get its NFA states
        for (const [dfaId, nfaIds] of nfaResult.subsetMap) {
          const dfaState = nfaResult.states.find(s => s.id === dfaId);
          if (dfaState && dfaState.label === step.subsetLabel) {
            // Highlight the NFA states in this subset on the canvas
            for (const nid of nfaIds) highlightedStates.add(nid);
            break;
          }
        }
        setConversionHighlight({
          highlightedStates,
          highlightedTransitions: new Set<string>(),
          label: `δ(${step.subsetLabel}, ${step.symbol}) = ${step.resultLabel}`,
        });
      }
    } else if (tab === 'minimize' && minResult && minStepIdx >= 0) {
      const step = minResult.steps[minStepIdx];
      if (step) {
        // Find state IDs by label
        const highlightedStates = new Set<string>();
        for (const s of states) {
          if (s.label === step.stateA || s.label === step.stateB) {
            highlightedStates.add(s.id);
          }
        }
        setConversionHighlight({
          highlightedStates,
          highlightedTransitions: new Set<string>(),
          label: `✗ (${step.stateA}, ${step.stateB}) — ${step.reason}`,
        });
      }
    } else if (tab === 're2nfa' && reResult && reStepIdx >= 0 && !reResult.error) {
      const step = reResult.steps[reStepIdx];
      if (step) {
        // Highlight the start and end states of the current fragment
        const highlightedStates = new Set<string>();
        for (const s of reResult.states) {
          if (s.label === step.startLabel || s.label === step.endLabel) {
            highlightedStates.add(s.id);
          }
        }
        setConversionHighlight({
          highlightedStates,
          highlightedTransitions: new Set<string>(),
          label: step.description,
        });
      }
    } else if (tab === 'fa2re' && fareResult && fareStepIdx >= 0) {
      const step = fareResult.steps[fareStepIdx];
      if (step) {
        // Highlight the state being eliminated
        const highlightedStates = new Set<string>();
        for (const s of states) {
          if (s.label === step.eliminatedState) {
            highlightedStates.add(s.id);
          }
        }
        setConversionHighlight({
          highlightedStates,
          highlightedTransitions: new Set<string>(),
          label: `Eliminate ${step.eliminatedState} (${step.edgesUpdated} edges updated)`,
        });
      }
    } else if (tab === 'combine' && combineResult && combineStepIdx >= 0) {
      const step = combineResult.steps[combineStepIdx];
      if (step) {
        setConversionHighlight({
          highlightedStates: new Set<string>(),
          highlightedTransitions: new Set<string>(),
          label: `δ(${step.pairLabel}, ${step.symbol}) = ${step.resultLabel}`,
        });
      }
    } else {
      setConversionHighlight(null);
    }
  }, [tab, nfaResult, nfaStepIdx, minResult, minStepIdx, reResult, reStepIdx, fareResult, fareStepIdx, combineResult, combineStepIdx, states, setConversionHighlight]);

  // Clean up highlights on unmount
  useEffect(() => {
    return () => { setConversionHighlight(null); };
  }, [setConversionHighlight]);

  // ── Auto-play logic ──
  const stopPlay = useCallback(() => {
    setIsPlaying(false);
    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, []);

  // Get current step info for auto-play
  const getCurrentMaxSteps = useCallback(() => {
    if (tab === 'nfa2dfa' && nfaResult) return nfaResult.steps.length;
    if (tab === 'minimize' && minResult) return minResult.steps.length;
    if (tab === 're2nfa' && reResult && !reResult.error) return reResult.steps.length;
    if (tab === 'fa2re' && fareResult) return fareResult.steps.length;
    if (tab === 'combine' && combineResult) return combineResult.steps.length;
    return 0;
  }, [tab, nfaResult, minResult, reResult, fareResult, combineResult]);

  const getCurrentStepIdx = useCallback(() => {
    if (tab === 'nfa2dfa') return nfaStepIdx;
    if (tab === 'minimize') return minStepIdx;
    if (tab === 're2nfa') return reStepIdx;
    if (tab === 'fa2re') return fareStepIdx;
    if (tab === 'combine') return combineStepIdx;
    return -1;
  }, [tab, nfaStepIdx, minStepIdx, reStepIdx, fareStepIdx, combineStepIdx]);

  const advanceStep = useCallback(() => {
    if (tab === 'nfa2dfa') setNfaStepIdx(p => p + 1);
    else if (tab === 'minimize') setMinStepIdx(p => p + 1);
    else if (tab === 're2nfa') setReStepIdx(p => p + 1);
    else if (tab === 'fa2re') setFareStepIdx(p => p + 1);
    else if (tab === 'combine') setCombineStepIdx(p => p + 1);
  }, [tab]);

  // Use refs for auto-play to avoid stale closures
  const stepIdxRef = useRef(-1);
  const maxStepsRef = useRef(0);
  useEffect(() => { stepIdxRef.current = getCurrentStepIdx(); }, [getCurrentStepIdx]);
  useEffect(() => { maxStepsRef.current = getCurrentMaxSteps(); }, [getCurrentMaxSteps]);

  const startPlay = useCallback(() => {
    const max = maxStepsRef.current;
    if (max === 0) return;
    setIsPlaying(true);
    playTimerRef.current = setInterval(() => {
      // Read from refs for fresh values
      const cur = stepIdxRef.current;
      const maxNow = maxStepsRef.current;
      if (cur >= maxNow - 1) {
        stopPlay();
        return;
      }
      advanceStep();
    }, playSpeed);
  }, [playSpeed, advanceStep, stopPlay]);

  // Stop play when speed changes or tab changes
  useEffect(() => { stopPlay(); }, [playSpeed, tab, stopPlay]);

  // Stop play when reaching the end
  useEffect(() => {
    if (isPlaying && getCurrentStepIdx() >= getCurrentMaxSteps() - 1) {
      stopPlay();
    }
  }, [isPlaying, getCurrentStepIdx, getCurrentMaxSteps, stopPlay]);

  const resetAll = () => {
    stopPlay();
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
        {renderControls(canRun, run, stepFwd, ffwd, () => { stopPlay(); setNfaResult(null); setNfaStepIdx(-1); setNfaApplied(false); },
          !canRun ? 'Switch to NFA mode first' : undefined,
          nfaResult !== null && nfaStepIdx < nfaResult.steps.length - 1)}
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
                    <div key={i} className={`font-mono text-xs flex items-center gap-1 py-0.5 transition-all duration-200 ${i === nfaStepIdx ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/5 -mx-1 px-1' : 'text-[var(--color-text-dim)]'}`}>
                      <span className="text-[11px] w-5 shrink-0">{i + 1}.</span>
                      <span>δ({step.subsetLabel}, {step.symbol}) = {step.resultLabel}</span>
                      {step.isNew && <span className="text-[11px] text-[var(--color-accent)] ml-1 animate-pulse">NEW</span>}
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
        {renderControls(canRun, run, stepFwd, ffwd, () => { stopPlay(); setMinResult(null); setMinStepIdx(-1); setMinApplied(false); },
          !canRun ? 'Switch to DFA mode first' : undefined,
          minResult !== null && minStepIdx < minResult.steps.length - 1)}
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
                    <div key={i} className={`font-mono text-xs py-0.5 transition-all duration-200 ${i === minStepIdx ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/5 -mx-1 px-1' : 'text-[var(--color-text-dim)]'}`}>
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
    const canPlay = reResult !== null && !reResult.error && reStepIdx < reResult.steps.length - 1;

    return (
      <>
        <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-2">
          <span className="font-mono text-[11px] text-[var(--color-text-dim)] shrink-0">RE</span>
          <input
            value={reInput}
            onChange={e => { setReInput(e.target.value); setReResult(null); setReStepIdx(-1); setReApplied(false); }}
            className="flex-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)]"
            placeholder="e.g. (a|b)*abb"
          />
          <div className="flex items-center gap-0.5">
            <button onClick={run} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><Play size={14} /></button>
            <button onClick={stepFwd} disabled={!canRun || (reResult !== null && reStepIdx >= reResult.steps.length - 1)} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><StepForward size={14} /></button>
            {isPlaying ? (
              <button onClick={stopPlay} className="p-1 text-[var(--color-accent)]"><Pause size={14} /></button>
            ) : (
              <button onClick={() => { if (!reResult) run(); startPlay(); }} disabled={!canPlay && !canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30" title="Auto-play"><FastForward size={14} /></button>
            )}
            <button onClick={ffwd} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30" title="Jump to end"><FastForward size={14} className="opacity-60" /></button>
            <button onClick={() => { stopPlay(); setReResult(null); setReStepIdx(-1); setReApplied(false); }} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={14} /></button>
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
                    <div key={i} className={`font-mono text-xs py-0.5 transition-all duration-200 ${i === reStepIdx ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/5 -mx-1 px-1' : 'text-[var(--color-text-dim)]'}`}>
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
        {renderControls(canRun, run, stepFwd, ffwd, () => { stopPlay(); setFareResult(null); setFareStepIdx(-1); },
          !canRun ? 'Build an automaton first' : undefined,
          fareResult !== null && fareStepIdx < fareResult.steps.length - 1)}
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
                    <div key={i} className={`font-mono text-xs py-0.5 transition-all duration-200 ${i === fareStepIdx ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/5 -mx-1 px-1' : 'text-[var(--color-text-dim)]'}`}>
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
    canAutoPlay?: boolean,
  ) => (
    <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-2">
      {warning && <span className="font-mono text-[11px] text-[var(--color-reject)]">{warning}</span>}
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <button onClick={onRun} disabled={!canRun} className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-30 transition-colors">
          <Play size={12} /> Run
        </button>
        <button onClick={onStep} disabled={!canRun} className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-30 transition-colors">
          <StepForward size={12} /> Step
        </button>
        {isPlaying ? (
          <button onClick={stopPlay} className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] text-[var(--color-accent)] bg-[var(--color-accent)]/10 transition-colors">
            <Pause size={12} /> Pause
          </button>
        ) : (
          <button onClick={() => { if (getCurrentMaxSteps() === 0) onRun(); setTimeout(startPlay, 50); }} disabled={!canRun && !canAutoPlay} className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-30 transition-colors" title="Auto-play steps">
            <Play size={12} /><Play size={10} className="-ml-2.5" /> Auto
          </button>
        )}
        <button onClick={onFfwd} disabled={!canRun} className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-30 transition-colors">
          <FastForward size={12} /> All
        </button>
        <div className="w-px h-4 bg-[var(--color-border)] mx-0.5" />
        <button onClick={onReset} className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--bg-surface-sunken)] transition-colors">
          <RotateCcw size={12} /> Reset
        </button>
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
    <div className={`border-l border-[var(--color-accent)]/20 bg-[var(--bg-surface)]/50 px-3 py-2 flex flex-col gap-1.5 shrink-0 ${isMobile ? 'w-36' : 'w-48'}`}>
      <div className="flex items-center justify-between">
        <div className="font-mono text-[11px] tracking-widest text-[var(--color-accent)] uppercase font-medium">Result</div>
        <div className="font-mono text-[10px] text-[var(--color-text-muted)]">{rStates.length}S · {rTransitions.length}T</div>
      </div>
      {extra && <div className="font-mono text-[11px] text-[var(--color-accept)] -mt-0.5">{extra}</div>}
      <div className="flex-1 overflow-y-auto space-y-0.5 border border-[var(--color-border)] bg-[var(--bg-surface-sunken)] p-1.5">
        {rStates.map(s => (
          <div key={s.id} className="font-mono text-[11px] flex items-center gap-1">
            {s.isInitial && <span className="text-[var(--color-accent)]">→</span>}
            <span className={s.isAccepting ? 'text-[var(--color-accept)]' : 'text-[var(--color-text)]'}>{s.label}</span>
            {s.isAccepting && <span className="text-[var(--color-accept)]">●</span>}
          </div>
        ))}
      </div>
      <button
        onClick={onApply}
        disabled={applied}
        className={`flex items-center justify-center gap-1.5 px-2 py-2 font-mono text-[11px] tracking-wider transition-colors ${
          applied ? 'bg-[var(--color-accept)] text-[var(--bg-primary)]' : 'bg-[var(--color-accent)] text-[var(--bg-primary)] hover:opacity-90'
        }`}
      >
        {applied ? <><Check size={12} /> APPLIED</> : <><ArrowRightLeft size={12} /> APPLY RESULT</>}
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
                  combineOp === o.id ? 'text-[var(--color-accent)] bg-[var(--bg-surface-sunken)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
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
                className="flex-1 min-w-[100px] bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)]"
                placeholder="RE for automaton B, e.g. (a|b)*a"
              />
            </>
          )}
          {mode !== 'dfa' && <span className="font-mono text-[11px] text-[var(--color-reject)]">Switch to DFA mode</span>}
          <div className="flex items-center gap-0.5 ml-auto">
            <button onClick={run} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><Play size={14} /></button>
            <button onClick={stepFwd} disabled={!canRun || (combineResult !== null && combineStepIdx >= combineResult.steps.length - 1)} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><StepForward size={14} /></button>
            {isPlaying ? (
              <button onClick={stopPlay} className="p-1 text-[var(--color-accent)]"><Pause size={14} /></button>
            ) : (
              <button onClick={() => { if (!combineResult) run(); setTimeout(startPlay, 50); }} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30" title="Auto-play"><FastForward size={14} /></button>
            )}
            <button onClick={ffwd} disabled={!canRun} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] disabled:opacity-30"><FastForward size={14} className="opacity-60" /></button>
            <button onClick={() => { stopPlay(); setCombineResult(null); setCombineStepIdx(-1); setCombineApplied(false); }} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={14} /></button>
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
                    <div key={i} className={`font-mono text-xs py-0.5 transition-all duration-200 ${i === combineStepIdx ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/5 -mx-1 px-1' : 'text-[var(--color-text-dim)]'}`}>
                      <span className="text-[11px] w-5 inline-block">{i + 1}.</span>
                      δ({step.pairLabel}, {step.symbol}) = {step.resultLabel}
                      {step.isNew && <span className="text-[11px] text-[var(--color-accent)] ml-1 animate-pulse">NEW</span>}
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
      className={`bg-[var(--bg-surface-raised)] border-t border-[var(--color-border)] flex flex-col shrink-0 select-none ${
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
        <span className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase ml-2 mr-1 shrink-0 hidden md:inline">CONVERT</span>
        <div className="w-px h-4 bg-[var(--color-border)] mx-1 shrink-0 hidden md:block" />
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide flex-1 ml-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`px-2.5 py-1.5 font-mono text-[11px] tracking-wider whitespace-nowrap transition-colors relative ${
                tab === t.id
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
              }`}
            >
              {isMobile ? t.short : t.label}
              {tab === t.id && <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-[var(--color-accent)]" />}
            </button>
          ))}
        </div>

        {/* Speed slider */}
        <div className="flex items-center gap-1 mr-1 shrink-0">
          <span className="font-mono text-[9px] text-[var(--color-text-dim)]">⚡</span>
          <input
            type="range"
            min={100}
            max={1500}
            step={100}
            value={1600 - playSpeed}
            onChange={e => setPlaySpeed(1600 - Number(e.target.value))}
            className="w-12 h-1 accent-[var(--color-accent)] cursor-pointer"
            title={`Speed: ${playSpeed}ms per step`}
          />
        </div>

        <button onClick={onClose} className="p-2 text-[var(--color-text-dim)] hover:text-[var(--color-text)] shrink-0">
          <X size={14} />
        </button>
      </div>

      {/* Step label banner */}
      {conversionHighlightLabel && (
        <div className="px-3 py-1 bg-[var(--color-accent)]/10 border-b border-[var(--color-accent)]/20">
          <span className="font-mono text-[11px] text-[var(--color-accent)]">
            {conversionHighlightLabel}
          </span>
        </div>
      )}

      {/* Tab content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {content}
      </div>
    </div>
  );
}
