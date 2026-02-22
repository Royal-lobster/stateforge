'use client';

import { useState, useCallback, useMemo } from 'react';
import { X, RotateCcw, ChevronRight, Trophy, Frown } from 'lucide-react';

/* ── Language definitions ─────────────────────────────────── */

interface Language {
  id: string;
  label: string;
  description: string;
  alphabet: string[];
  validate: (s: string) => boolean;
  /** hint for generating valid strings */
  generate: (p: number) => string[];
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

const REGULAR_LANGUAGES: Language[] = [
  {
    id: '0n1n',
    label: '{ 0ⁿ1ⁿ | n ≥ 0 }',
    description: 'Equal 0s followed by equal 1s',
    alphabet: ['0', '1'],
    validate: (s) => {
      if (s === '') return true;
      const m = s.match(/^(0+)(1+)$/);
      if (!m) return false;
      return m[1].length === m[2].length;
    },
    generate: (p) => {
      const results: string[] = [];
      for (let n = p; n <= p + 3; n++) results.push('0'.repeat(n) + '1'.repeat(n));
      return results;
    },
  },
  {
    id: 'ww',
    label: '{ ww | w ∈ {a,b}* }',
    description: 'String that is some word repeated twice',
    alphabet: ['a', 'b'],
    validate: (s) => {
      if (s.length % 2 !== 0) return false;
      const half = s.length / 2;
      return s.slice(0, half) === s.slice(half);
    },
    generate: (p) => {
      const results: string[] = [];
      for (let n = p; n <= p + 2; n++) {
        const w = 'a'.repeat(n);
        results.push(w + w);
        const w2 = 'a'.repeat(n - 1) + 'b';
        results.push(w2 + w2);
      }
      return results;
    },
  },
  {
    id: 'anbncn',
    label: '{ aⁿbⁿcⁿ | n ≥ 0 }',
    description: 'Equal as, bs, and cs in order',
    alphabet: ['a', 'b', 'c'],
    validate: (s) => {
      if (s === '') return true;
      const m = s.match(/^(a+)(b+)(c+)$/);
      if (!m) return false;
      return m[1].length === m[2].length && m[2].length === m[3].length;
    },
    generate: (p) => {
      const results: string[] = [];
      for (let n = p; n <= p + 3; n++) results.push('a'.repeat(n) + 'b'.repeat(n) + 'c'.repeat(n));
      return results;
    },
  },
  {
    id: 'aprime',
    label: '{ aᵖ | p is prime }',
    description: 'String of as whose length is prime',
    alphabet: ['a'],
    validate: (s) => {
      if (!/^a+$/.test(s)) return false;
      return isPrime(s.length);
    },
    generate: (p) => {
      const results: string[] = [];
      for (let n = p; n <= 30; n++) {
        if (isPrime(n)) results.push('a'.repeat(n));
        if (results.length >= 4) break;
      }
      return results;
    },
  },
];

const CF_LANGUAGES: Language[] = [
  REGULAR_LANGUAGES.find(l => l.id === 'anbncn')!,
  REGULAR_LANGUAGES.find(l => l.id === 'ww')!,
];

/* ── Types ────────────────────────────────────────────────── */

type GameType = 'regular' | 'context-free';

type GameStep =
  | 'select-language'
  | 'system-picks-p'
  | 'user-picks-string'
  | 'system-picks-decomposition'
  | 'user-picks-i'
  | 'result';

interface RegularDecomposition {
  xLen: number;
  yLen: number;
  // z is the rest
}

interface CFDecomposition {
  uLen: number;
  vLen: number;
  xLen: number;
  yLen: number;
  // z is the rest
}

/* ── Decomposition colors ─────────────────────────────────── */

const REG_COLORS = {
  x: '#a78bfa', // purple
  y: '#22d3ee', // cyan (accent)
  z: '#f59e0b', // amber
};

const CF_COLORS = {
  u: '#a78bfa', // purple
  v: '#22d3ee', // cyan
  x: '#f59e0b', // amber
  y: '#34d399', // green
  z: '#f472b6', // pink
};

/* ── Helper: all valid decompositions ─────────────────────── */

function getRegularDecompositions(s: string, p: number): RegularDecomposition[] {
  const result: RegularDecomposition[] = [];
  for (let xyLen = 1; xyLen <= Math.min(p, s.length); xyLen++) {
    for (let yLen = 1; yLen <= xyLen; yLen++) {
      const xLen = xyLen - yLen;
      result.push({ xLen, yLen });
    }
  }
  return result;
}

function getCFDecompositions(s: string, p: number): CFDecomposition[] {
  const result: CFDecomposition[] = [];
  const n = s.length;
  // vxy must be a contiguous substring of length ≤ p, |vy| ≥ 1
  for (let vxyStart = 0; vxyStart < n; vxyStart++) {
    for (let vxyLen = 1; vxyLen <= Math.min(p, n - vxyStart); vxyLen++) {
      // v starts at vxyStart, x is middle, y ends at vxyStart+vxyLen
      for (let vLen = 0; vLen <= vxyLen; vLen++) {
        for (let yLen = 0; yLen <= vxyLen - vLen; yLen++) {
          if (vLen + yLen === 0) continue; // |vy| ≥ 1
          const xLen = vxyLen - vLen - yLen;
          const uLen = vxyStart;
          result.push({ uLen, vLen, xLen, yLen });
        }
      }
    }
  }
  return result;
}

function pumpRegular(s: string, d: RegularDecomposition, i: number): string {
  const x = s.slice(0, d.xLen);
  const y = s.slice(d.xLen, d.xLen + d.yLen);
  const z = s.slice(d.xLen + d.yLen);
  return x + y.repeat(i) + z;
}

function pumpCF(s: string, d: CFDecomposition, i: number): string {
  const u = s.slice(0, d.uLen);
  const v = s.slice(d.uLen, d.uLen + d.vLen);
  const x = s.slice(d.uLen + d.vLen, d.uLen + d.vLen + d.xLen);
  const y = s.slice(d.uLen + d.vLen + d.xLen, d.uLen + d.vLen + d.xLen + d.yLen);
  const z = s.slice(d.uLen + d.vLen + d.xLen + d.yLen);
  return u + v.repeat(i) + x + y.repeat(i) + z;
}

/* ── Component ────────────────────────────────────────────── */

export default function PumpingLemma({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<GameType>('regular');
  const [step, setStep] = useState<GameStep>('select-language');
  const [language, setLanguage] = useState<Language | null>(null);
  const [p, setP] = useState(3);
  const [userString, setUserString] = useState('');
  const [stringError, setStringError] = useState('');
  const [decomposition, setDecomposition] = useState<RegularDecomposition | null>(null);
  const [cfDecomposition, setCfDecomposition] = useState<CFDecomposition | null>(null);
  const [pumpI, setPumpI] = useState(0);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [resultExplanation, setResultExplanation] = useState('');

  const reset = useCallback(() => {
    setStep('select-language');
    setLanguage(null);
    setUserString('');
    setStringError('');
    setDecomposition(null);
    setCfDecomposition(null);
    setPumpI(0);
    setResult(null);
    setResultExplanation('');
  }, []);

  const switchTab = useCallback((t: GameType) => {
    setTab(t);
    reset();
  }, [reset]);

  const languages = tab === 'regular' ? REGULAR_LANGUAGES : CF_LANGUAGES;

  const selectLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    const newP = Math.floor(Math.random() * 4) + 2; // 2-5
    setP(newP);
    setStep('user-picks-string');
  }, []);

  const submitString = useCallback(() => {
    if (!language) return;
    const s = userString.trim();
    if (s.length < p) {
      setStringError(`String must have length ≥ ${p}`);
      return;
    }
    if (!language.validate(s)) {
      setStringError(`String is not in the language ${language.label}`);
      return;
    }
    // Check alphabet
    for (const ch of s) {
      if (!language.alphabet.includes(ch)) {
        setStringError(`Character '${ch}' not in alphabet {${language.alphabet.join(',')}}`);
        return;
      }
    }
    setStringError('');

    if (tab === 'regular') {
      // System picks a decomposition that is hardest for the user
      const decomps = getRegularDecompositions(s, p);
      // Pick a random valid decomposition (adversarial: try to find one where all pumps stay in language)
      // For simplicity, pick random
      const chosen = decomps[Math.floor(Math.random() * decomps.length)];
      setDecomposition(chosen);
      setStep('user-picks-i');
    } else {
      const decomps = getCFDecompositions(s, p);
      const chosen = decomps[Math.floor(Math.random() * decomps.length)];
      setCfDecomposition(chosen);
      setStep('user-picks-i');
    }
    setPumpI(0);
  }, [language, userString, p, tab]);

  const pumpedString = useMemo(() => {
    if (!userString) return '';
    if (tab === 'regular' && decomposition) {
      return pumpRegular(userString, decomposition, pumpI);
    }
    if (tab === 'context-free' && cfDecomposition) {
      return pumpCF(userString, cfDecomposition, pumpI);
    }
    return '';
  }, [userString, tab, decomposition, cfDecomposition, pumpI]);

  const checkResult = useCallback(() => {
    if (!language) return;
    const pumped = pumpedString;
    const inLanguage = language.validate(pumped);

    if (!inLanguage) {
      setResult('win');
      setResultExplanation(
        `The pumped string "${pumped.length > 40 ? pumped.slice(0, 40) + '…' : pumped}" is NOT in ${language.label}. ` +
        `This proves the language is not ${tab === 'regular' ? 'regular' : 'context-free'}!`
      );
    } else {
      setResult('lose');
      setResultExplanation(
        `The pumped string "${pumped.length > 40 ? pumped.slice(0, 40) + '…' : pumped}" IS still in ${language.label}. ` +
        `Try a different pump value i, or pick a different string.`
      );
    }
    setStep('result');
  }, [language, pumpedString, tab]);

  // Render decomposed string with colors
  const renderDecomposed = (s: string, showPumped: boolean) => {
    if (tab === 'regular' && decomposition) {
      const { xLen, yLen } = decomposition;
      const x = s.slice(0, xLen);
      const y = s.slice(xLen, xLen + yLen);
      const z = s.slice(xLen + yLen);

      if (showPumped) {
        const px = s.slice(0, xLen);
        const py = y.repeat(pumpI);
        const pz = z;
        return (
          <span className="font-mono text-sm break-all">
            <span style={{ color: REG_COLORS.x }}>{px}</span>
            <span style={{ color: REG_COLORS.y, textDecoration: 'underline' }}>{py}</span>
            <span style={{ color: REG_COLORS.z }}>{pz}</span>
          </span>
        );
      }

      return (
        <span className="font-mono text-sm break-all">
          <span style={{ color: REG_COLORS.x }}>{x}</span>
          <span style={{ color: REG_COLORS.y, textDecoration: 'underline', fontWeight: 'bold' }}>{y}</span>
          <span style={{ color: REG_COLORS.z }}>{z}</span>
        </span>
      );
    }

    if (tab === 'context-free' && cfDecomposition) {
      const { uLen, vLen, xLen, yLen } = cfDecomposition;
      const u = s.slice(0, uLen);
      const v = s.slice(uLen, uLen + vLen);
      const x = s.slice(uLen + vLen, uLen + vLen + xLen);
      const y = s.slice(uLen + vLen + xLen, uLen + vLen + xLen + yLen);
      const z = s.slice(uLen + vLen + xLen + yLen);

      if (showPumped) {
        return (
          <span className="font-mono text-sm break-all">
            <span style={{ color: CF_COLORS.u }}>{u}</span>
            <span style={{ color: CF_COLORS.v, textDecoration: 'underline' }}>{v.repeat(pumpI)}</span>
            <span style={{ color: CF_COLORS.x }}>{x}</span>
            <span style={{ color: CF_COLORS.y, textDecoration: 'underline' }}>{y.repeat(pumpI)}</span>
            <span style={{ color: CF_COLORS.z }}>{z}</span>
          </span>
        );
      }

      return (
        <span className="font-mono text-sm break-all">
          <span style={{ color: CF_COLORS.u }}>{u}</span>
          <span style={{ color: CF_COLORS.v, textDecoration: 'underline', fontWeight: 'bold' }}>{v}</span>
          <span style={{ color: CF_COLORS.x }}>{x}</span>
          <span style={{ color: CF_COLORS.y, textDecoration: 'underline', fontWeight: 'bold' }}>{y}</span>
          <span style={{ color: CF_COLORS.z }}>{z}</span>
        </span>
      );
    }

    return <span className="font-mono text-sm">{s}</span>;
  };

  const suggestedStrings = useMemo(() => {
    if (!language) return [];
    return language.generate(p);
  }, [language, p]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[var(--bg-surface)] border border-[var(--color-border)] shadow-panel w-[540px] max-h-[85vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <span className="font-mono text-xs font-semibold tracking-widest uppercase text-[var(--color-text-bright)]">
            Pumping Lemma Game
          </span>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]" title="Reset">
              <RotateCcw size={14} />
            </button>
            <button onClick={onClose} className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)]">
          {(['regular', 'context-free'] as GameType[]).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 px-4 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                tab === t
                  ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
              }`}
            >
              {t === 'regular' ? 'Regular' : 'Context-Free'}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {/* Info */}
          <div className="font-mono text-[10px] text-[var(--color-text-dim)] leading-relaxed">
            Prove a language is <strong className="text-[var(--color-accent)]">not {tab === 'regular' ? 'regular' : 'context-free'}</strong> using the pumping lemma.
            You play as the Pumper — pick a string, then find a pump value that breaks it.
          </div>

          {/* Step 1: Select language */}
          {step === 'select-language' && (
            <div className="space-y-2">
              <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--color-text-dim)]">
                Step 1 · Choose a language
              </div>
              {languages.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => selectLanguage(lang)}
                  className="w-full text-left px-3 py-2.5 border border-[var(--color-border)] bg-[var(--bg-surface-raised)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-colors group"
                >
                  <div className="font-mono text-sm text-[var(--color-text-bright)] group-hover:text-[var(--color-accent)]">
                    {lang.label}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--color-text-dim)] mt-0.5">
                    {lang.description}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: User picks string */}
          {step === 'user-picks-string' && language && (
            <div className="space-y-3">
              <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--color-text-dim)]">
                Step 2 · System chose p = {p}
              </div>
              <div className="font-mono text-xs text-[var(--color-text)]">
                Language: <span className="text-[var(--color-accent)]">{language.label}</span>
              </div>
              <div className="font-mono text-xs text-[var(--color-text)]">
                Pick a string <strong>s ∈ L</strong> with <strong>|s| ≥ {p}</strong>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1">
                {suggestedStrings.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setUserString(s); setStringError(''); }}
                    className={`px-2 py-1 font-mono text-[11px] border transition-colors ${
                      userString === s
                        ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                        : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:border-[var(--color-text-dim)]'
                    }`}
                  >
                    {s.length > 20 ? s.slice(0, 20) + '…' : s}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={userString}
                onChange={e => { setUserString(e.target.value); setStringError(''); }}
                placeholder={`Enter string using {${language.alphabet.join(',')}}`}
                className="w-full px-3 py-2 font-mono text-sm bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-accent)] focus:outline-none"
              />
              {stringError && (
                <div className="font-mono text-[10px] text-red-400">{stringError}</div>
              )}
              <button
                onClick={submitString}
                disabled={!userString.trim()}
                className="flex items-center gap-1 px-3 py-1.5 font-mono text-xs tracking-wider bg-[var(--color-accent)] text-[var(--bg-primary)] hover:brightness-110 disabled:opacity-30 transition-colors"
              >
                Submit <ChevronRight size={12} />
              </button>
            </div>
          )}

          {/* Step 3: User picks i */}
          {step === 'user-picks-i' && language && (
            <div className="space-y-3">
              <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--color-text-dim)]">
                Step 3 · System decomposed the string
              </div>

              <div className="font-mono text-xs text-[var(--color-text)]">
                s = {renderDecomposed(userString, false)}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 font-mono text-[10px]">
                {tab === 'regular' && decomposition ? (
                  <>
                    <span><span style={{ color: REG_COLORS.x }}>■</span> x ({userString.slice(0, decomposition.xLen).length > 10 ? '…' : `"${userString.slice(0, decomposition.xLen)}"`})</span>
                    <span><span style={{ color: REG_COLORS.y }}>■</span> y ({`"${userString.slice(decomposition.xLen, decomposition.xLen + decomposition.yLen)}"`})</span>
                    <span><span style={{ color: REG_COLORS.z }}>■</span> z</span>
                    <span className="text-[var(--color-text-dim)]">|xy| = {decomposition.xLen + decomposition.yLen} ≤ {p}, |y| = {decomposition.yLen} ≥ 1</span>
                  </>
                ) : tab === 'context-free' && cfDecomposition ? (
                  <>
                    <span><span style={{ color: CF_COLORS.u }}>■</span> u</span>
                    <span><span style={{ color: CF_COLORS.v }}>■</span> v</span>
                    <span><span style={{ color: CF_COLORS.x }}>■</span> x</span>
                    <span><span style={{ color: CF_COLORS.y }}>■</span> y</span>
                    <span><span style={{ color: CF_COLORS.z }}>■</span> z</span>
                    <span className="text-[var(--color-text-dim)]">|vxy| = {cfDecomposition.vLen + cfDecomposition.xLen + cfDecomposition.yLen} ≤ {p}, |vy| = {cfDecomposition.vLen + cfDecomposition.yLen} ≥ 1</span>
                  </>
                ) : null}
              </div>

              {/* Pump slider */}
              <div className="space-y-1">
                <div className="font-mono text-xs text-[var(--color-text)]">
                  Pick pump value <strong>i = {pumpI}</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={pumpI}
                  onChange={e => setPumpI(parseInt(e.target.value))}
                  className="w-full accent-[var(--color-accent)]"
                />
                <div className="flex justify-between font-mono text-[10px] text-[var(--color-text-dim)]">
                  <span>0</span><span>10</span>
                </div>
              </div>

              {/* Pumped string preview */}
              <div className="space-y-1">
                <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--color-text-dim)]">
                  Pumped string (i={pumpI})
                </div>
                <div className="px-3 py-2 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] overflow-x-auto">
                  {pumpedString.length > 0 ? (
                    <span className="font-mono text-sm break-all text-[var(--color-text)]">
                      {pumpedString.length > 80 ? pumpedString.slice(0, 80) + '…' : pumpedString}
                    </span>
                  ) : (
                    <span className="font-mono text-sm text-[var(--color-text-dim)]">ε (empty)</span>
                  )}
                </div>
                <div className="font-mono text-[10px] text-[var(--color-text-dim)]">
                  Length: {pumpedString.length}
                </div>
              </div>

              <button
                onClick={checkResult}
                className="flex items-center gap-1 px-3 py-1.5 font-mono text-xs tracking-wider bg-[var(--color-accent)] text-[var(--bg-primary)] hover:brightness-110 transition-colors"
              >
                Check <ChevronRight size={12} />
              </button>
            </div>
          )}

          {/* Result */}
          {step === 'result' && (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 px-3 py-3 border ${
                result === 'win'
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-red-500/50 bg-red-500/10'
              }`}>
                {result === 'win' ? (
                  <Trophy size={20} className="text-emerald-400 shrink-0" />
                ) : (
                  <Frown size={20} className="text-red-400 shrink-0" />
                )}
                <div>
                  <div className={`font-mono text-sm font-bold ${result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result === 'win' ? 'You Win!' : 'Not Quite!'}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--color-text-dim)] mt-1 leading-relaxed">
                    {resultExplanation}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStep('user-picks-i');
                    setResult(null);
                  }}
                  className="px-3 py-1.5 font-mono text-xs tracking-wider border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:border-[var(--color-text-dim)] transition-colors"
                >
                  Try Different i
                </button>
                <button
                  onClick={reset}
                  className="px-3 py-1.5 font-mono text-xs tracking-wider bg-[var(--color-accent)] text-[var(--bg-primary)] hover:brightness-110 transition-colors"
                >
                  New Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
