import type { State, Transition, Mode } from './types';

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

let _uid = 0;
function uid() { return `conv_${Date.now()}_${_uid++}`; }

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
