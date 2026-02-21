'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  parseGrammarText, classifyGrammar, getTerminals, getNonTerminals,
  removeEpsilonProductions, removeUnitProductions, removeUselessSymbols,
  toCNF, toGNF,
  cykParse, ll1Parse, bruteForceParse,
  type TransformResult, type CYKResult, type LL1Result,
} from '@/grammar';
import type { Grammar, GrammarType, ParseTreeNode } from '@/types';
import {
  Play, RotateCcw, ChevronDown, ChevronRight,
  Wand2, Table, BookOpen,
} from 'lucide-react';

const EXAMPLE_GRAMMARS: { name: string; text: string }[] = [
  {
    name: 'Simple CFG (anbn)',
    text: 'S → aSb | ε',
  },
  {
    name: 'Arithmetic',
    text: `E → E+T | T
T → T*F | F
F → (E) | a`,
  },
  {
    name: 'Balanced Parens',
    text: `S → (S)S | ε`,
  },
  {
    name: 'Palindrome',
    text: `S → aSa | bSb | a | b | ε`,
  },
];

function ParseTree({ node, depth = 0 }: { node: ParseTreeNode; depth?: number }) {
  const [collapsed, setCollapsed] = useState(false);

  if (node.isTerminal) {
    return (
      <span className="font-mono text-xs text-[var(--color-accept)] inline-block mx-0.5">
        {node.symbol === 'ε' ? 'ε' : `'${node.symbol}'`}
      </span>
    );
  }

  return (
    <div className="ml-3" style={{ marginLeft: depth === 0 ? 0 : 12 }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="font-mono text-xs text-[var(--color-accent)] hover:text-[var(--color-text)] flex items-center gap-0.5"
      >
        {node.children.length > 0 ? (
          collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />
        ) : null}
        {node.symbol}
      </button>
      {!collapsed && (
        <div className="border-l border-[var(--color-border)] ml-1 pl-1">
          {node.children.map((child, i) => (
            <ParseTree key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function GrammarEditor({ isMobile }: { isMobile: boolean }) {
  const [grammarText, setGrammarText] = useState(EXAMPLE_GRAMMARS[0].text);
  const [parseInput, setParseInput] = useState('');
  const [activeTab, setActiveTab] = useState<'transform' | 'cyk' | 'll1' | 'brute'>('transform');
  const [activeTransform, setActiveTransform] = useState<string | null>(null);

  // Transform results
  const [transformResult, setTransformResult] = useState<TransformResult | null>(null);
  const [transformStepIdx, setTransformStepIdx] = useState(-1);

  // Parse results
  const [cykResult, setCykResult] = useState<CYKResult | null>(null);
  const [cykStepIdx, setCykStepIdx] = useState(-1);
  const [ll1Result, setLl1Result] = useState<LL1Result | null>(null);
  const [ll1StepIdx, setLl1StepIdx] = useState(-1);
  const [bruteResult, setBruteResult] = useState<{ accepted: boolean; derivation: string[] } | null>(null);

  const grammar = useMemo(() => parseGrammarText(grammarText), [grammarText]);
  const grammarType = useMemo(() => classifyGrammar(grammar), [grammar]);
  const terminals = useMemo(() => getTerminals(grammar), [grammar]);
  const nonTerminals = useMemo(() => getNonTerminals(grammar), [grammar]);

  const typeColor: Record<GrammarType, string> = {
    regular: 'var(--color-accept)',
    'context-free': 'var(--color-accent)',
    'context-sensitive': 'var(--color-sim-active)',
    unrestricted: 'var(--color-reject)',
    unknown: 'var(--color-text-dim)',
  };

  const handleTransform = (name: string) => {
    setActiveTransform(name);
    let result: TransformResult;
    switch (name) {
      case 'epsilon': result = removeEpsilonProductions(grammar); break;
      case 'unit': result = removeUnitProductions(grammar); break;
      case 'useless': result = removeUselessSymbols(grammar); break;
      case 'cnf': result = toCNF(grammar); break;
      case 'gnf': result = toGNF(grammar); break;
      default: return;
    }
    setTransformResult(result);
    setTransformStepIdx(-1);
  };

  const applyTransform = () => {
    if (!transformResult) return;
    const text = transformResult.grammar.productions
      .reduce((acc, p) => {
        const existing = acc.find(e => e.head === p.head);
        if (existing) {
          existing.bodies.push(p.body.join(''));
        } else {
          acc.push({ head: p.head, bodies: [p.body.join('')] });
        }
        return acc;
      }, [] as { head: string; bodies: string[] }[])
      .map(e => `${e.head} → ${e.bodies.join(' | ')}`)
      .join('\n');
    setGrammarText(text);
    setTransformResult(null);
  };

  const handleCYK = () => {
    const cnf = toCNF(grammar);
    const result = cykParse(cnf.grammar, parseInput);
    setCykResult(result);
    setCykStepIdx(-1);
  };

  const handleLL1 = () => {
    const result = ll1Parse(grammar, parseInput);
    setLl1Result(result);
    setLl1StepIdx(-1);
  };

  const handleBrute = () => {
    const result = bruteForceParse(grammar, parseInput);
    setBruteResult(result);
  };

  const resetParse = () => {
    setCykResult(null); setCykStepIdx(-1);
    setLl1Result(null); setLl1StepIdx(-1);
    setBruteResult(null);
  };

  const transforms = [
    { id: 'epsilon', label: 'Remove ε-prod' },
    { id: 'unit', label: 'Remove unit prod' },
    { id: 'useless', label: 'Remove useless' },
    { id: 'cnf', label: 'To CNF' },
    { id: 'gnf', label: 'To GNF' },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* Left: Grammar editor */}
      <div className={`flex flex-col border-r border-[var(--color-border)] ${isMobile ? 'h-[40%]' : 'w-80'} shrink-0`}>
        {/* Header */}
        <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-2">
          <BookOpen size={12} className="text-[var(--color-accent)]" />
          <span className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase">Grammar</span>
          <span className="font-mono text-[11px] ml-auto" style={{ color: typeColor[grammarType] }}>
            {grammarType.toUpperCase()}
          </span>
        </div>

        {/* Examples dropdown */}
        <div className="px-3 py-1 border-b border-[var(--color-border)] flex items-center gap-2">
          <select
            onChange={e => { setGrammarText(EXAMPLE_GRAMMARS[parseInt(e.target.value)].text); resetParse(); setTransformResult(null); }}
            className="flex-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-[11px] px-1 py-1 outline-none"
          >
            {EXAMPLE_GRAMMARS.map((eg, i) => (
              <option key={i} value={i}>{eg.name}</option>
            ))}
          </select>
        </div>

        {/* Text area */}
        <textarea
          value={grammarText}
          onChange={e => { setGrammarText(e.target.value); resetParse(); setTransformResult(null); }}
          className="flex-1 bg-[var(--bg-canvas)] text-[var(--color-text)] font-mono text-xs px-3 py-2 outline-none resize-none border-b border-[var(--color-border)]"
          placeholder={`S → aSb | ε\nUse → or -> for arrow\n| for alternatives`}
          spellCheck={false}
        />

        {/* Stats */}
        <div className="px-3 py-1.5 flex items-center gap-3 text-[11px] font-mono text-[var(--color-text-dim)]">
          <span>Σ = {terminals.size > 0 ? `{${[...terminals].sort().join(',')}}` : '∅'}</span>
          <span>V = {nonTerminals.size > 0 ? `{${[...nonTerminals].sort().join(',')}}` : '∅'}</span>
          <span>{grammar.productions.length} prod</span>
        </div>
      </div>

      {/* Right: Transforms + Parsing */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center border-b border-[var(--color-border)] shrink-0 overflow-x-auto scrollbar-hide">
          {([
            { id: 'transform', label: 'Transforms', icon: Wand2 },
            { id: 'cyk', label: 'CYK', icon: Table },
            { id: 'll1', label: 'LL(1)', icon: Table },
            { id: 'brute', label: 'Brute Force', icon: Play },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1 px-3 py-1.5 font-mono text-[11px] tracking-wider whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'text-[var(--color-accent)] border-b border-[var(--color-accent)]'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
              }`}
            >
              <t.icon size={11} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Transform tab */}
        {activeTab === 'transform' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-1 flex-wrap">
              {transforms.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTransform(t.id)}
                  className={`px-2 py-1 font-mono text-[11px] transition-colors ${
                    activeTransform === t.id
                      ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
                      : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)] bg-[var(--bg-surface-sunken)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {!transformResult ? (
                <p className="font-mono text-xs text-[var(--color-text-dim)]">Select a transformation to apply</p>
              ) : (
                <div className="space-y-2">
                  {/* Steps */}
                  {transformResult.steps.map((step, i) => (
                    <div key={i}>
                      <div className="font-mono text-[11px] text-[var(--color-accent)] mb-1">{step.description}</div>
                      <div className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] p-2 space-y-0.5">
                        {step.productions.map((p, j) => (
                          <div key={j} className="font-mono text-xs text-[var(--color-text)]">
                            <span className="text-[var(--color-accent)]">{p.head}</span>
                            <span className="text-[var(--color-text-dim)]"> → </span>
                            {p.body.join(' ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={applyTransform}
                    className="flex items-center gap-1 px-3 py-1.5 font-mono text-[11px] tracking-wider bg-[var(--color-accent)] text-[var(--bg-primary)] hover:opacity-90"
                  >
                    APPLY TO EDITOR
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CYK tab */}
        {activeTab === 'cyk' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--color-text-dim)] shrink-0">INPUT</span>
              <input
                value={parseInput}
                onChange={e => { setParseInput(e.target.value); setCykResult(null); }}
                className="flex-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)]"
                placeholder="String to parse..."
              />
              <button onClick={handleCYK} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><Play size={14} /></button>
              <button onClick={() => setCykResult(null)} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={14} /></button>
            </div>
            <div className="flex-1 overflow-auto px-3 py-2">
              {!cykResult ? (
                <div className="font-mono text-xs text-[var(--color-text-dim)] space-y-1">
                  <p>CYK parser (requires CNF — auto-converts).</p>
                  <p>Enter a string and press ▶</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Result */}
                  <div className="font-mono text-sm font-bold" style={{ color: cykResult.accepted ? 'var(--color-accept)' : 'var(--color-reject)' }}>
                    {cykResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                  </div>

                  {/* CYK Table */}
                  {cykResult.table.length > 0 && (
                    <div>
                      <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">CYK Table</div>
                      <div className="overflow-x-auto">
                        <table className="border-collapse font-mono text-[11px]">
                          <tbody>
                            {[...Array(cykResult.table.length)].map((_, l) => (
                              <tr key={l}>
                                <td className="pr-2 text-[var(--color-text-dim)] text-right">{l + 1}</td>
                                {cykResult.table[l].map((cell, i) => (
                                  <td key={i} className="border border-[var(--color-border)] px-1.5 py-0.5 text-center min-w-[40px]">
                                    <span className={cell.nonTerminals.length > 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}>
                                      {cell.nonTerminals.length > 0 ? `{${cell.nonTerminals.join(',')}}` : '∅'}
                                    </span>
                                  </td>
                                ))}
                              </tr>
                            )).reverse()}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td></td>
                              {[...parseInput].map((ch, i) => (
                                <td key={i} className="text-center text-[var(--color-text-dim)] pt-1">{ch}</td>
                              ))}
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Parse tree */}
                  {cykResult.parseTree && (
                    <div>
                      <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">Parse Tree</div>
                      <div className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] p-2 overflow-auto max-h-[200px]">
                        <ParseTree node={cykResult.parseTree} />
                      </div>
                    </div>
                  )}

                  {/* Steps */}
                  <div>
                    <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">
                      Steps ({cykResult.steps.length})
                    </div>
                    <div className="max-h-[150px] overflow-y-auto space-y-0.5">
                      {cykResult.steps.map((step, i) => (
                        <div key={i} className="font-mono text-[11px] text-[var(--color-text-dim)]">
                          {step.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LL(1) tab */}
        {activeTab === 'll1' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--color-text-dim)] shrink-0">INPUT</span>
              <input
                value={parseInput}
                onChange={e => { setParseInput(e.target.value); setLl1Result(null); }}
                className="flex-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)]"
                placeholder="String to parse..."
              />
              <button onClick={handleLL1} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><Play size={14} /></button>
              <button onClick={() => setLl1Result(null)} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={14} /></button>
            </div>
            <div className="flex-1 overflow-auto px-3 py-2">
              {!ll1Result ? (
                <div className="font-mono text-xs text-[var(--color-text-dim)] space-y-1">
                  <p>LL(1) predictive parser.</p>
                  <p>Computes FIRST/FOLLOW sets and parse table.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Result */}
                  <div className="font-mono text-sm font-bold" style={{ color: ll1Result.accepted ? 'var(--color-accept)' : 'var(--color-reject)' }}>
                    {ll1Result.accepted ? 'ACCEPTED' : 'REJECTED'}
                  </div>

                  {/* Conflicts */}
                  {ll1Result.conflicts.length > 0 && (
                    <div>
                      <div className="font-mono text-[11px] tracking-widest text-[var(--color-reject)] uppercase mb-1">
                        Conflicts ({ll1Result.conflicts.length})
                      </div>
                      {ll1Result.conflicts.map((c, i) => (
                        <div key={i} className="font-mono text-[11px] text-[var(--color-reject)]">{c}</div>
                      ))}
                    </div>
                  )}

                  {/* FIRST / FOLLOW */}
                  <div className="flex gap-4">
                    <div>
                      <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">FIRST</div>
                      {[...ll1Result.firstSets].filter(([k]) => k.length === 1 && k >= 'A' && k <= 'Z').map(([nt, set]) => (
                        <div key={nt} className="font-mono text-[11px]">
                          <span className="text-[var(--color-accent)]">{nt}</span>
                          <span className="text-[var(--color-text-dim)]">: </span>
                          <span className="text-[var(--color-text)]">{`{${[...set].join(', ')}}`}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">FOLLOW</div>
                      {[...ll1Result.followSets].map(([nt, set]) => (
                        <div key={nt} className="font-mono text-[11px]">
                          <span className="text-[var(--color-accent)]">{nt}</span>
                          <span className="text-[var(--color-text-dim)]">: </span>
                          <span className="text-[var(--color-text)]">{`{${[...set].join(', ')}}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parse table */}
                  <div>
                    <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">Parse Table</div>
                    <div className="overflow-x-auto">
                      {(() => {
                        const allTerms = [...getTerminals(grammar), '$'].sort();
                        const allNTs = [...getNonTerminals(grammar)].sort();
                        return (
                          <table className="border-collapse font-mono text-[11px]">
                            <thead>
                              <tr>
                                <th className="border border-[var(--color-border)] px-1.5 py-0.5 text-[var(--color-text-dim)]"></th>
                                {allTerms.map(t => (
                                  <th key={t} className="border border-[var(--color-border)] px-1.5 py-0.5 text-[var(--color-text-dim)]">{t}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {allNTs.map(nt => (
                                <tr key={nt}>
                                  <td className="border border-[var(--color-border)] px-1.5 py-0.5 text-[var(--color-accent)]">{nt}</td>
                                  {allTerms.map(t => {
                                    const prod = ll1Result.parseTable.get(nt)?.get(t);
                                    return (
                                      <td key={t} className="border border-[var(--color-border)] px-1.5 py-0.5 text-center">
                                        {prod ? (
                                          <span className="text-[var(--color-text)]">{prod.head}→{prod.body.join('')}</span>
                                        ) : (
                                          <span className="text-[var(--color-text-dim)]">-</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Parse steps */}
                  <div>
                    <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">
                      Parse Steps ({ll1Result.parseSteps.length})
                    </div>
                    <div className="overflow-x-auto max-h-[150px] overflow-y-auto">
                      <table className="border-collapse font-mono text-[11px] w-full">
                        <thead>
                          <tr className="text-[var(--color-text-dim)]">
                            <td className="pr-2 pb-1">#</td>
                            <td className="pr-2 pb-1">Stack</td>
                            <td className="pr-2 pb-1">Input</td>
                            <td className="pb-1">Action</td>
                          </tr>
                        </thead>
                        <tbody>
                          {ll1Result.parseSteps.map((step, i) => (
                            <tr key={i} className="text-[var(--color-text)]">
                              <td className="pr-2 text-[var(--color-text-dim)]">{i + 1}</td>
                              <td className="pr-2">{step.stack.join(' ')}</td>
                              <td className="pr-2">{step.remaining}</td>
                              <td className="text-[var(--color-accent)]">{step.action}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Parse tree */}
                  {ll1Result.parseTree && (
                    <div>
                      <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">Parse Tree</div>
                      <div className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] p-2 overflow-auto max-h-[200px]">
                        <ParseTree node={ll1Result.parseTree} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Brute force tab */}
        {activeTab === 'brute' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[var(--color-border)] flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--color-text-dim)] shrink-0">INPUT</span>
              <input
                value={parseInput}
                onChange={e => { setParseInput(e.target.value); setBruteResult(null); }}
                className="flex-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 outline-none focus:border-[var(--color-accent)]"
                placeholder="String to parse..."
              />
              <button onClick={handleBrute} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><Play size={14} /></button>
              <button onClick={() => setBruteResult(null)} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"><RotateCcw size={14} /></button>
            </div>
            <div className="flex-1 overflow-auto px-3 py-2">
              {!bruteResult ? (
                <div className="font-mono text-xs text-[var(--color-text-dim)] space-y-1">
                  <p>Brute force BFS parser (works with any grammar type).</p>
                  <p>Enter a string and press ▶</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-mono text-sm font-bold" style={{ color: bruteResult.accepted ? 'var(--color-accept)' : 'var(--color-reject)' }}>
                    {bruteResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                  </div>
                  {bruteResult.derivation.length > 0 && (
                    <div>
                      <div className="font-mono text-[11px] tracking-widest text-[var(--color-text-dim)] uppercase mb-1">Leftmost Derivation</div>
                      <div className="space-y-0.5">
                        {bruteResult.derivation.map((step, i) => (
                          <div key={i} className="font-mono text-xs">
                            {i > 0 && <span className="text-[var(--color-text-dim)]">⇒ </span>}
                            <span className="text-[var(--color-text)]">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
