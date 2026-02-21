import type { State, Transition, Mode } from './types';

let _uid = 0;
function uid() { return `conv_${Date.now()}_${_uid++}`; }

function layoutCircular(count: number, cx = 400, cy = 300, baseRadius = 140, perNode = 50) {
  const radius = Math.max(baseRadius, count * perNode);
  return (i: number) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };
}

// ── Helpers ──

function epsilonClosure(stateIds: Set<string>, transitions: Transition[]): Set<string> {
  const closure = new Set(stateIds);
  const stack = [...stateIds];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const t of transitions) {
      if (t.from === current && t.symbols.includes('ε') && !closure.has(t.to)) {
        closure.add(t.to);
        stack.push(t.to);
      }
    }
  }
  return closure;
}

function setKey(ids: Set<string>, sortedStateIds: string[]): string {
  // Deterministic key based on original state order
  return sortedStateIds.filter(id => ids.has(id)).join(',');
}

function setLabel(ids: Set<string>, stateMap: Map<string, State>): string {
  const labels = [...ids]
    .map(id => stateMap.get(id)?.label ?? id)
    .sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, ''));
      const nb = parseInt(b.replace(/\D/g, ''));
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  return `{${labels.join(',')}}`;
}

// ── Conversion step tracking ──

export interface SubsetStep {
  /** The subset being processed */
  subsetKey: string;
  subsetLabel: string;
  /** Symbol being consumed */
  symbol: string;
  /** Resulting subset (after move + ε-closure) */
  resultKey: string;
  resultLabel: string;
  /** Whether this result is a new (previously unseen) subset */
  isNew: boolean;
}

export interface NFAToDFAResult {
  states: State[];
  transitions: Transition[];
  steps: SubsetStep[];
  /** Map from DFA state id → set of NFA state ids */
  subsetMap: Map<string, Set<string>>;
}

// ── NFA → DFA (Subset Construction) ──

export function nfaToDFA(
  nfaStates: State[],
  nfaTransitions: Transition[],
): NFAToDFAResult {
  const stateMap = new Map(nfaStates.map(s => [s.id, s]));
  const sortedIds = nfaStates.map(s => s.id);

  // Gather alphabet (exclude ε)
  const alphabet = new Set<string>();
  for (const t of nfaTransitions) {
    for (const sym of t.symbols) {
      if (sym !== 'ε') alphabet.add(sym);
    }
  }
  const sortedAlphabet = [...alphabet].sort();

  // Find initial state
  const initial = nfaStates.find(s => s.isInitial);
  if (!initial) {
    return { states: [], transitions: [], steps: [], subsetMap: new Map() };
  }

  // Start with ε-closure of initial
  const startSet = epsilonClosure(new Set([initial.id]), nfaTransitions);
  const startKey = setKey(startSet, sortedIds);

  // BFS
  const dfaStatesMap = new Map<string, { id: string; subset: Set<string>; label: string }>();
  const queue: string[] = [startKey];
  const startId = uid();
  dfaStatesMap.set(startKey, { id: startId, subset: startSet, label: setLabel(startSet, stateMap) });

  const dfaTransitions: Transition[] = [];
  const steps: SubsetStep[] = [];

  while (queue.length > 0) {
    const currentKey = queue.shift()!;
    const current = dfaStatesMap.get(currentKey)!;

    for (const sym of sortedAlphabet) {
      // Move: collect all states reachable on `sym` from any state in current subset
      const moveSet = new Set<string>();
      for (const sid of current.subset) {
        for (const t of nfaTransitions) {
          if (t.from === sid && t.symbols.includes(sym)) {
            moveSet.add(t.to);
          }
        }
      }

      if (moveSet.size === 0) continue; // dead state, skip (or we could add trap)

      // ε-closure of move result
      const resultSet = epsilonClosure(moveSet, nfaTransitions);
      const resultKey = setKey(resultSet, sortedIds);

      let isNew = false;
      if (!dfaStatesMap.has(resultKey)) {
        isNew = true;
        const newId = uid();
        dfaStatesMap.set(resultKey, {
          id: newId,
          subset: resultSet,
          label: setLabel(resultSet, stateMap),
        });
        queue.push(resultKey);
      }

      const resultEntry = dfaStatesMap.get(resultKey)!;

      // Check if transition already exists (for merging symbols)
      const existingTrans = dfaTransitions.find(
        t => t.from === current.id && t.to === resultEntry.id
      );
      if (existingTrans) {
        if (!existingTrans.symbols.includes(sym)) {
          existingTrans.symbols.push(sym);
        }
      } else {
        dfaTransitions.push({
          id: uid(),
          from: current.id,
          to: resultEntry.id,
          symbols: [sym],
        });
      }

      steps.push({
        subsetKey: currentKey,
        subsetLabel: current.label,
        symbol: sym,
        resultKey,
        resultLabel: resultEntry.label,
        isNew,
      });
    }
  }

  // Build DFA states with layout
  const entries = [...dfaStatesMap.values()];
  const count = entries.length;
  const cx = 400, cy = 300;
  const radius = Math.max(140, count * 50);

  const dfaStates: State[] = entries.map((entry, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    const isAccepting = [...entry.subset].some(sid => stateMap.get(sid)?.isAccepting);
    return {
      id: entry.id,
      label: entry.label,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      isInitial: entry.id === startId,
      isAccepting,
    };
  });

  const subsetMap = new Map<string, Set<string>>();
  for (const entry of entries) {
    subsetMap.set(entry.id, entry.subset);
  }

  return { states: dfaStates, transitions: dfaTransitions, steps, subsetMap };
}

// ════════════════════════════════════════════════════
// ── DFA Minimization (Table-Filling / Hopcroft-style) ──
// ════════════════════════════════════════════════════

export interface MinimizationStep {
  /** Pair of state labels that were marked distinguishable */
  stateA: string;
  stateB: string;
  /** Reason they're distinguishable */
  reason: string;
  /** Round number (0 = base case accept/reject split) */
  round: number;
}

export interface MinimizationResult {
  states: State[];
  transitions: Transition[];
  steps: MinimizationStep[];
  /** Map from merged state label → set of original state labels */
  mergedGroups: Map<string, string[]>;
  removedCount: number;
}

export function minimizeDFA(
  dfaStates: State[],
  dfaTransitions: Transition[],
): MinimizationResult {
  // 1. Remove unreachable states
  const initial = dfaStates.find(s => s.isInitial);
  if (!initial) return { states: [], transitions: [], steps: [], mergedGroups: new Map(), removedCount: 0 };

  const reachable = new Set<string>();
  const rQueue = [initial.id];
  reachable.add(initial.id);
  while (rQueue.length > 0) {
    const cur = rQueue.shift()!;
    for (const t of dfaTransitions) {
      if (t.from === cur && !reachable.has(t.to)) {
        reachable.add(t.to);
        rQueue.push(t.to);
      }
    }
  }
  const states = dfaStates.filter(s => reachable.has(s.id));
  const trans = dfaTransitions.filter(t => reachable.has(t.from) && reachable.has(t.to));

  const stateMap = new Map(states.map(s => [s.id, s]));
  const stateIds = states.map(s => s.id);
  const n = stateIds.length;

  // Alphabet
  const alphabet = new Set<string>();
  for (const t of trans) for (const sym of t.symbols) alphabet.add(sym);
  const sortedAlpha = [...alphabet].sort();

  // Transition function: state × symbol → state | null
  const delta = new Map<string, string>();
  for (const t of trans) {
    for (const sym of t.symbols) {
      delta.set(`${t.from}|${sym}`, t.to);
    }
  }

  // 2. Table-filling algorithm
  const distinguishable = new Set<string>();
  const pairKey = (a: string, b: string) => a < b ? `${a}|${b}` : `${b}|${a}`;
  const steps: MinimizationStep[] = [];

  // Base case: accepting vs non-accepting
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const si = stateMap.get(stateIds[i])!;
      const sj = stateMap.get(stateIds[j])!;
      if (si.isAccepting !== sj.isAccepting) {
        distinguishable.add(pairKey(stateIds[i], stateIds[j]));
        steps.push({
          stateA: si.label,
          stateB: sj.label,
          reason: `${si.isAccepting ? si.label : sj.label} is accepting, ${si.isAccepting ? sj.label : si.label} is not`,
          round: 0,
        });
      }
    }
  }

  // Iterative refinement
  let changed = true;
  let round = 1;
  while (changed) {
    changed = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const pk = pairKey(stateIds[i], stateIds[j]);
        if (distinguishable.has(pk)) continue;
        for (const sym of sortedAlpha) {
          const di = delta.get(`${stateIds[i]}|${sym}`) ?? null;
          const dj = delta.get(`${stateIds[j]}|${sym}`) ?? null;
          if (di === null && dj === null) continue;
          if (di === null || dj === null || (di !== dj && distinguishable.has(pairKey(di, dj)))) {
            distinguishable.add(pk);
            changed = true;
            const si = stateMap.get(stateIds[i])!;
            const sj = stateMap.get(stateIds[j])!;
            const destA = di ? stateMap.get(di)?.label ?? '∅' : '∅';
            const destB = dj ? stateMap.get(dj)?.label ?? '∅' : '∅';
            steps.push({
              stateA: si.label,
              stateB: sj.label,
              reason: `On '${sym}': ${si.label}→${destA}, ${sj.label}→${destB} (distinguishable)`,
              round,
            });
            break;
          }
        }
      }
    }
    round++;
  }

  // 3. Merge equivalent states using Union-Find
  const parent = new Map<string, string>();
  for (const id of stateIds) parent.set(id, id);
  function find(x: string): string {
    while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x)!)!); x = parent.get(x)!; }
    return x;
  }
  function union(a: string, b: string) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) {
      // Prefer initial state as root, then lower label
      const sa = stateMap.get(ra)!, sb = stateMap.get(rb)!;
      if (sb.isInitial) parent.set(ra, rb);
      else parent.set(rb, ra);
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!distinguishable.has(pairKey(stateIds[i], stateIds[j]))) {
        union(stateIds[i], stateIds[j]);
      }
    }
  }

  // Build groups
  const groups = new Map<string, string[]>();
  for (const id of stateIds) {
    const root = find(id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(id);
  }

  // Build new states
  const pos = layoutCircular(groups.size);
  const newStates: State[] = [];
  const mergedGroups = new Map<string, string[]>();
  const oldToNew = new Map<string, string>();
  let idx = 0;

  for (const [root, members] of groups) {
    const newId = uid();
    const labels = members.map(m => stateMap.get(m)!.label).sort();
    const representative = stateMap.get(root)!;
    const label = members.length > 1 ? labels.join(',') : representative.label;
    const { x, y } = pos(idx++);

    newStates.push({
      id: newId,
      label,
      x, y,
      isInitial: members.some(m => stateMap.get(m)!.isInitial),
      isAccepting: representative.isAccepting,
    });

    mergedGroups.set(label, labels);
    for (const m of members) oldToNew.set(m, newId);
  }

  // Build new transitions
  const newTransSet = new Map<string, Transition>();
  for (const t of trans) {
    const from = oldToNew.get(t.from)!;
    const to = oldToNew.get(t.to)!;
    const key = `${from}|${to}`;
    if (newTransSet.has(key)) {
      const existing = newTransSet.get(key)!;
      for (const sym of t.symbols) {
        if (!existing.symbols.includes(sym)) existing.symbols.push(sym);
      }
    } else {
      newTransSet.set(key, { id: uid(), from, to, symbols: [...t.symbols] });
    }
  }

  return {
    states: newStates,
    transitions: [...newTransSet.values()],
    steps,
    mergedGroups,
    removedCount: dfaStates.length - newStates.length,
  };
}

// ════════════════════════════════════════════════════
// ── RE → NFA (Thompson's Construction) ──
// ════════════════════════════════════════════════════

// Parser for regular expressions
// Grammar:
//   union   → concat ('|' concat)*
//   concat  → kleene+
//   kleene  → atom ('*' | '+' | '?')*
//   atom    → char | '(' union ')' | 'ε'

interface RENode {
  type: 'char' | 'epsilon' | 'concat' | 'union' | 'star' | 'plus' | 'question';
  value?: string;       // for char
  left?: RENode;        // for concat, union
  right?: RENode;       // for concat, union
  child?: RENode;       // for star, plus, question
}

function parseRegex(input: string): RENode {
  let pos = 0;

  function peek(): string | null { return pos < input.length ? input[pos] : null; }
  function advance(): string { return input[pos++]; }
  function expect(ch: string) {
    if (advance() !== ch) throw new Error(`Expected '${ch}' at position ${pos - 1}`);
  }

  function parseUnion(): RENode {
    let node = parseConcat();
    while (peek() === '|') {
      advance();
      const right = parseConcat();
      node = { type: 'union', left: node, right };
    }
    return node;
  }

  function parseConcat(): RENode {
    const parts: RENode[] = [];
    while (peek() !== null && peek() !== ')' && peek() !== '|') {
      parts.push(parseKleene());
    }
    if (parts.length === 0) return { type: 'epsilon' };
    if (parts.length === 1) return parts[0];
    return parts.reduce((left, right) => ({ type: 'concat', left, right }));
  }

  function parseKleene(): RENode {
    let node = parseAtom();
    while (peek() === '*' || peek() === '+' || peek() === '?') {
      const op = advance();
      if (op === '*') node = { type: 'star', child: node };
      else if (op === '+') node = { type: 'plus', child: node };
      else node = { type: 'question', child: node };
    }
    return node;
  }

  function parseAtom(): RENode {
    const ch = peek();
    if (ch === '(') {
      advance();
      const node = parseUnion();
      expect(')');
      return node;
    }
    if (ch === 'ε' || ch === 'ϵ') {
      advance();
      return { type: 'epsilon' };
    }
    if (ch === '\\') {
      advance();
      const escaped = advance();
      return { type: 'char', value: escaped };
    }
    if (ch !== null && ch !== ')' && ch !== '|' && ch !== '*' && ch !== '+' && ch !== '?') {
      advance();
      return { type: 'char', value: ch };
    }
    throw new Error(`Unexpected character '${ch}' at position ${pos}`);
  }

  const result = parseUnion();
  if (pos !== input.length) throw new Error(`Unexpected character at position ${pos}`);
  return result;
}

export interface ThompsonStep {
  description: string;
  /** NFA fragment info */
  startLabel: string;
  endLabel: string;
}

export interface REToNFAResult {
  states: State[];
  transitions: Transition[];
  steps: ThompsonStep[];
  error?: string;
}

export function reToNFA(regex: string): REToNFAResult {
  const steps: ThompsonStep[] = [];
  let stateNum = 0;

  interface Fragment {
    start: string;
    end: string;
    states: State[];
    transitions: Transition[];
  }

  function newState(): string {
    return `q${stateNum++}`;
  }

  function build(node: RENode): Fragment {
    switch (node.type) {
      case 'epsilon': {
        const s = newState(), e = newState();
        steps.push({ description: `ε-transition: ${s} → ${e}`, startLabel: s, endLabel: e });
        return {
          start: s, end: e,
          states: [
            { id: s, label: s, x: 0, y: 0, isInitial: false, isAccepting: false },
            { id: e, label: e, x: 0, y: 0, isInitial: false, isAccepting: false },
          ],
          transitions: [{ id: uid(), from: s, to: e, symbols: ['ε'] }],
        };
      }
      case 'char': {
        const s = newState(), e = newState();
        steps.push({ description: `Symbol '${node.value}': ${s} → ${e}`, startLabel: s, endLabel: e });
        return {
          start: s, end: e,
          states: [
            { id: s, label: s, x: 0, y: 0, isInitial: false, isAccepting: false },
            { id: e, label: e, x: 0, y: 0, isInitial: false, isAccepting: false },
          ],
          transitions: [{ id: uid(), from: s, to: e, symbols: [node.value!] }],
        };
      }
      case 'concat': {
        const left = build(node.left!);
        const right = build(node.right!);
        // Merge left.end with right.start
        const merged = mergeStates(left, right);
        steps.push({ description: `Concat: ${left.start} ⟶ ${right.end}`, startLabel: left.start, endLabel: right.end });
        return merged;
      }
      case 'union': {
        const left = build(node.left!);
        const right = build(node.right!);
        const s = newState(), e = newState();
        const allStates = [
          { id: s, label: s, x: 0, y: 0, isInitial: false, isAccepting: false },
          ...left.states, ...right.states,
          { id: e, label: e, x: 0, y: 0, isInitial: false, isAccepting: false },
        ];
        const allTrans = [
          ...left.transitions, ...right.transitions,
          { id: uid(), from: s, to: left.start, symbols: ['ε'] },
          { id: uid(), from: s, to: right.start, symbols: ['ε'] },
          { id: uid(), from: left.end, to: e, symbols: ['ε'] },
          { id: uid(), from: right.end, to: e, symbols: ['ε'] },
        ];
        steps.push({ description: `Union: ${s} ⟶ (${left.start}|${right.start}) ⟶ ${e}`, startLabel: s, endLabel: e });
        return { start: s, end: e, states: allStates, transitions: allTrans };
      }
      case 'star': {
        const inner = build(node.child!);
        const s = newState(), e = newState();
        const allStates = [
          { id: s, label: s, x: 0, y: 0, isInitial: false, isAccepting: false },
          ...inner.states,
          { id: e, label: e, x: 0, y: 0, isInitial: false, isAccepting: false },
        ];
        const allTrans = [
          ...inner.transitions,
          { id: uid(), from: s, to: inner.start, symbols: ['ε'] },
          { id: uid(), from: s, to: e, symbols: ['ε'] },
          { id: uid(), from: inner.end, to: inner.start, symbols: ['ε'] },
          { id: uid(), from: inner.end, to: e, symbols: ['ε'] },
        ];
        steps.push({ description: `Star(*): ${s} ⟶ ${inner.start}...${inner.end} ⟶ ${e}`, startLabel: s, endLabel: e });
        return { start: s, end: e, states: allStates, transitions: allTrans };
      }
      case 'plus': {
        // a+ = a·a*
        const inner = build(node.child!);
        const s = newState(), e = newState();
        const allStates = [
          { id: s, label: s, x: 0, y: 0, isInitial: false, isAccepting: false },
          ...inner.states,
          { id: e, label: e, x: 0, y: 0, isInitial: false, isAccepting: false },
        ];
        const allTrans = [
          ...inner.transitions,
          { id: uid(), from: s, to: inner.start, symbols: ['ε'] },
          { id: uid(), from: inner.end, to: inner.start, symbols: ['ε'] },
          { id: uid(), from: inner.end, to: e, symbols: ['ε'] },
        ];
        steps.push({ description: `Plus(+): ${s} ⟶ ${inner.start}...${inner.end} ⟶ ${e}`, startLabel: s, endLabel: e });
        return { start: s, end: e, states: allStates, transitions: allTrans };
      }
      case 'question': {
        // a? = a|ε
        const inner = build(node.child!);
        const s = newState(), e = newState();
        const allStates = [
          { id: s, label: s, x: 0, y: 0, isInitial: false, isAccepting: false },
          ...inner.states,
          { id: e, label: e, x: 0, y: 0, isInitial: false, isAccepting: false },
        ];
        const allTrans = [
          ...inner.transitions,
          { id: uid(), from: s, to: inner.start, symbols: ['ε'] },
          { id: uid(), from: s, to: e, symbols: ['ε'] },
          { id: uid(), from: inner.end, to: e, symbols: ['ε'] },
        ];
        steps.push({ description: `Optional(?): ${s} ⟶ ${inner.start}|ε ⟶ ${e}`, startLabel: s, endLabel: e });
        return { start: s, end: e, states: allStates, transitions: allTrans };
      }
    }
  }

  function mergeStates(left: Fragment, right: Fragment): Fragment {
    // Redirect all transitions pointing to right.start to left.end
    // Remove right.start from states
    const newTrans = [
      ...left.transitions,
      ...right.transitions.map(t => ({
        ...t,
        from: t.from === right.start ? left.end : t.from,
        to: t.to === right.start ? left.end : t.to,
      })),
    ];
    const newStates = [
      ...left.states,
      ...right.states.filter(s => s.id !== right.start),
    ];
    return { start: left.start, end: right.end, states: newStates, transitions: newTrans };
  }

  try {
    const ast = parseRegex(regex);
    const fragment = build(ast);

    // Layout states
    const count = fragment.states.length;
    const pos = layoutCircular(count, 400, 300, 100, 35);

    const finalStates: State[] = fragment.states.map((s, i) => {
      const { x, y } = pos(i);
      return {
        ...s,
        x, y,
        isInitial: s.id === fragment.start,
        isAccepting: s.id === fragment.end,
      };
    });

    return { states: finalStates, transitions: fragment.transitions, steps };
  } catch (e: unknown) {
    return { states: [], transitions: [], steps: [], error: (e as Error).message };
  }
}

// ════════════════════════════════════════════════════
// ── FA → Regular Expression (State Elimination) ──
// ════════════════════════════════════════════════════

export interface StateEliminationStep {
  eliminatedState: string;
  resultingExpression: string;
  edgesUpdated: number;
}

export interface FAToREResult {
  regex: string;
  steps: StateEliminationStep[];
}

export function faToRegex(
  faStates: State[],
  faTransitions: Transition[],
): FAToREResult {
  const steps: StateEliminationStep[] = [];

  const initial = faStates.find(s => s.isInitial);
  if (!initial) return { regex: '∅', steps: [] };

  const accepting = faStates.filter(s => s.isAccepting);
  if (accepting.length === 0) return { regex: '∅', steps: [] };

  // Build a GNFA: add new start and accept states
  const startId = '__gnfa_start__';
  const acceptId = '__gnfa_accept__';

  // Edge map: from → to → regex string
  type EdgeMap = Map<string, Map<string, string>>;
  const edges: EdgeMap = new Map();

  const allIds = [startId, ...faStates.map(s => s.id), acceptId];
  for (const a of allIds) {
    edges.set(a, new Map());
  }

  // New start → old initial
  edges.get(startId)!.set(initial.id, 'ε');

  // Old accepting → new accept
  for (const a of accepting) {
    const existing = edges.get(a.id)!.get(acceptId);
    edges.get(a.id)!.set(acceptId, existing ? `${existing}|ε` : 'ε');
  }

  // Original transitions
  for (const t of faTransitions) {
    const label = t.symbols.join('|');
    const existing = edges.get(t.from)!.get(t.to);
    if (existing) {
      edges.get(t.from)!.set(t.to, `${existing}|${label}`);
    } else {
      edges.get(t.from)!.set(t.to, label);
    }
  }

  // Eliminate states one by one (not start or accept)
  const toEliminate = faStates.map(s => s.id);

  for (const elimId of toEliminate) {
    const stateLabel = faStates.find(s => s.id === elimId)?.label ?? elimId;
    let edgesUpdated = 0;

    // Self-loop on the eliminated state
    const selfLoop = edges.get(elimId)?.get(elimId) ?? null;
    const selfLoopStr = selfLoop ? (needsParens(selfLoop) ? `(${selfLoop})*` : `${selfLoop}*`) : '';

    // For every pair (p, q) where p → elim and elim → q
    const incoming: [string, string][] = [];
    const outgoing: [string, string][] = [];

    for (const [from, tos] of edges) {
      if (from === elimId) continue;
      const label = tos.get(elimId);
      if (label !== undefined) incoming.push([from, label]);
    }

    const elimOutgoing = edges.get(elimId);
    if (elimOutgoing) {
      for (const [to, label] of elimOutgoing) {
        if (to === elimId) continue;
        outgoing.push([to, label]);
      }
    }

    for (const [p, rIn] of incoming) {
      for (const [q, rOut] of outgoing) {
        // New label: rIn · selfLoop* · rOut
        let newLabel: string;
        const parts: string[] = [];
        if (rIn !== 'ε') parts.push(needsParens(rIn) && hasUnion(rIn) ? `(${rIn})` : rIn);
        if (selfLoopStr) parts.push(selfLoopStr);
        if (rOut !== 'ε') parts.push(needsParens(rOut) && hasUnion(rOut) ? `(${rOut})` : rOut);
        newLabel = parts.length > 0 ? parts.join('') : 'ε';

        const existing = edges.get(p)!.get(q);
        if (existing) {
          edges.get(p)!.set(q, `${existing}|${newLabel}`);
        } else {
          edges.get(p)!.set(q, newLabel);
        }
        edgesUpdated++;
      }
    }

    // Remove eliminated state from all edges
    edges.delete(elimId);
    for (const [, tos] of edges) {
      tos.delete(elimId);
    }

    const currentExpr = edges.get(startId)?.get(acceptId) ?? '∅';
    steps.push({
      eliminatedState: stateLabel,
      resultingExpression: currentExpr,
      edgesUpdated,
    });
  }

  const finalRegex = edges.get(startId)?.get(acceptId) ?? '∅';
  return { regex: simplifyRegex(finalRegex), steps };
}

function needsParens(re: string): boolean {
  return re.length > 1;
}

function hasUnion(re: string): boolean {
  // Check if top-level has '|'
  let depth = 0;
  for (const ch of re) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === '|' && depth === 0) return true;
  }
  return false;
}

function simplifyRegex(re: string): string {
  // Basic simplifications
  let s = re;
  // Remove ε in concatenation contexts (but not standalone)
  s = s.replace(/ε\|/g, (_, offset) => {
    // Keep if it makes the expression optional
    return 'ε|';
  });
  return s;
}

// ════════════════════════════════════════════════════
// ── FA → Regular Grammar ──
// ════════════════════════════════════════════════════

export interface GrammarProduction {
  head: string;
  body: string;
}

export interface FAToGrammarResult {
  productions: GrammarProduction[];
  startSymbol: string;
}

export function faToGrammar(
  faStates: State[],
  faTransitions: Transition[],
): FAToGrammarResult {
  const initial = faStates.find(s => s.isInitial);
  if (!initial) return { productions: [], startSymbol: 'S' };

  // Map state labels to non-terminal names (uppercase)
  const nonTerminal = new Map<string, string>();
  const usedNames = new Set<string>();

  // Initial state gets 'S'
  nonTerminal.set(initial.id, 'S');
  usedNames.add('S');

  // Others get A, B, C, ... or their label uppercased
  const letters = 'ABCDEFGHIJKLMNOPQRTUVWXYZ'.split(''); // skip S
  let letterIdx = 0;
  for (const s of faStates) {
    if (nonTerminal.has(s.id)) continue;
    let name: string;
    if (s.label.length === 1 && s.label.toUpperCase() !== s.label.toLowerCase()) {
      name = s.label.toUpperCase();
    } else {
      name = letters[letterIdx++] ?? `N${letterIdx}`;
    }
    while (usedNames.has(name)) {
      name = letters[letterIdx++] ?? `N${letterIdx}`;
    }
    nonTerminal.set(s.id, name);
    usedNames.add(name);
  }

  const productions: GrammarProduction[] = [];

  // For each transition from → to on symbol: Head → symbol Body
  for (const t of faTransitions) {
    const head = nonTerminal.get(t.from)!;
    const toNT = nonTerminal.get(t.to)!;
    for (const sym of t.symbols) {
      if (sym === 'ε') {
        productions.push({ head, body: toNT });
      } else {
        productions.push({ head, body: `${sym}${toNT}` });
      }
    }
  }

  // For accepting states: Head → ε
  for (const s of faStates) {
    if (s.isAccepting) {
      productions.push({ head: nonTerminal.get(s.id)!, body: 'ε' });
    }
  }

  return { productions, startSymbol: 'S' };
}
