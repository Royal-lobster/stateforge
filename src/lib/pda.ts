import type { State, Transition, PDATransitionEntry } from './types';

/** Initial stack symbol — by convention the PDA stack starts with 'Z'. */
const INITIAL_STACK_SYMBOL = 'Z';

// ── PDA Transition Parsing ──

/**
 * Parse a PDA transition label string like "a, Z → AZ"
 * Returns { input, pop, push }
 */
export function parsePDALabel(label: string): PDATransitionEntry | null {
  // Format: input, pop → push
  // Examples: "a, Z → AZ", "ε, ε → S", "a, A → ε"
  const match = label.match(/^\s*(.+?)\s*,\s*(.+?)\s*(?:→|->)\s*(.+?)\s*$/);
  if (!match) return null;
  return {
    input: match[1].trim(),
    pop: match[2].trim(),
    push: match[3].trim(),
  };
}

export function formatPDALabel(entry: PDATransitionEntry): string {
  return `${entry.input}, ${entry.pop} → ${entry.push}`;
}

/**
 * Parse all PDA transitions from the symbols array.
 * In PDA mode, symbols[] stores labels like "a, Z → AZ"
 */
export function getPDAEntries(t: Transition): PDATransitionEntry[] {
  if (t.pdaTransitions && t.pdaTransitions.length > 0) return t.pdaTransitions;
  return t.symbols.map(s => parsePDALabel(s)).filter((e): e is PDATransitionEntry => e !== null);
}

// ── PDA Configuration (for nondeterministic simulation) ──

export interface PDAConfig {
  stateId: string;
  stack: string[];     // stack[0] = top
  inputPos: number;
  id: number;          // unique config id for tree display
  parentId: number | null;
  transitionUsed: string; // description of transition taken
}

let _configId = 0;

export function resetConfigId() { _configId = 0; }

// ── PDA Simulation ──

export interface PDASimState {
  configs: PDAConfig[];         // all active configurations
  accepted: PDAConfig[];        // configs that reached acceptance
  rejected: PDAConfig[];        // dead configs
  allConfigs: PDAConfig[];      // every config ever created (for tree)
  inputStr: string;
  acceptMode: 'final-state' | 'empty-stack';
  done: boolean;
}

export function pdaInit(
  states: State[],
  transitions: Transition[],
  input: string,
  acceptMode: 'final-state' | 'empty-stack' = 'final-state',
): PDASimState {
  _configId = 0;
  const initial = states.find(s => s.isInitial);
  if (!initial) return { configs: [], accepted: [], rejected: [], allConfigs: [], inputStr: input, acceptMode, done: true };

  const startConfig: PDAConfig = {
    stateId: initial.id,
    stack: [INITIAL_STACK_SYMBOL],
    inputPos: 0,
    id: _configId++,
    parentId: null,
    transitionUsed: 'Start',
  };

  // Check immediate acceptance
  const accepted: PDAConfig[] = [];
  if (input.length === 0) {
    if (acceptMode === 'final-state' && initial.isAccepting) {
      accepted.push(startConfig);
    }
    if (acceptMode === 'empty-stack' && startConfig.stack.length === 0) {
      accepted.push(startConfig);
    }
  }

  return {
    configs: [startConfig],
    accepted,
    rejected: [],
    allConfigs: [startConfig],
    inputStr: input,
    acceptMode,
    done: false,
  };
}

export function pdaStep(
  simState: PDASimState,
  states: State[],
  transitions: Transition[],
): PDASimState {
  if (simState.done) return simState;

  const newConfigs: PDAConfig[] = [];
  const newRejected: PDAConfig[] = [];
  const newAccepted = [...simState.accepted];
  const allConfigs = [...simState.allConfigs];

  for (const config of simState.configs) {
    const currentChar = config.inputPos < simState.inputStr.length
      ? simState.inputStr[config.inputPos]
      : null;
    const stackTop = config.stack.length > 0 ? config.stack[0] : null;

    let hasTransition = false;

    for (const t of transitions) {
      if (t.from !== config.stateId) continue;
      const entries = getPDAEntries(t);

      for (const entry of entries) {
        // Check if transition is applicable
        const inputMatch = entry.input === 'ε' || entry.input === currentChar;
        const popMatch = entry.pop === 'ε' || entry.pop === stackTop;

        if (!inputMatch || !popMatch) continue;
        if (entry.input !== 'ε' && currentChar === null) continue;
        if (entry.pop !== 'ε' && stackTop === null) continue;

        hasTransition = true;

        // Build new stack
        let newStack = [...config.stack];
        if (entry.pop !== 'ε') newStack.shift(); // pop
        if (entry.push !== 'ε') {
          // Push characters (leftmost = top)
          const pushChars = entry.push.split('').reverse();
          for (const ch of pushChars) {
            newStack.unshift(ch);
          }
        }

        const newPos = entry.input === 'ε' ? config.inputPos : config.inputPos + 1;

        const newConfig: PDAConfig = {
          stateId: t.to,
          stack: newStack,
          inputPos: newPos,
          id: _configId++,
          parentId: config.id,
          transitionUsed: `${formatPDALabel(entry)} → ${states.find(s => s.id === t.to)?.label ?? t.to}`,
        };

        allConfigs.push(newConfig);

        // Check acceptance
        const toState = states.find(s => s.id === t.to);
        const inputConsumed = newPos >= simState.inputStr.length;

        if (inputConsumed && simState.acceptMode === 'final-state' && toState?.isAccepting) {
          newAccepted.push(newConfig);
        } else if (inputConsumed && simState.acceptMode === 'empty-stack' && newStack.length === 0) {
          newAccepted.push(newConfig);
        } else {
          newConfigs.push(newConfig);
        }
      }
    }

    if (!hasTransition) {
      newRejected.push(config);
    }
  }

  const totalConfigs = simState.allConfigs.length + newConfigs.length;
  const done = newConfigs.length === 0 || totalConfigs > 10000;

  return {
    configs: done && newConfigs.length > 0 ? [] : newConfigs,
    accepted: newAccepted,
    rejected: [...simState.rejected, ...newRejected],
    allConfigs,
    inputStr: simState.inputStr,
    acceptMode: simState.acceptMode,
    done,
  };
}

export function pdaFastRun(
  states: State[],
  transitions: Transition[],
  input: string,
  acceptMode: 'final-state' | 'empty-stack' = 'final-state',
  maxSteps = 500,
): PDASimState {
  let sim = pdaInit(states, transitions, input, acceptMode);
  let steps = 0;
  while (!sim.done && steps < maxSteps) {
    sim = pdaStep(sim, states, transitions);
    steps++;
  }
  return sim;
}
