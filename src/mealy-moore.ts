import type { State, Transition } from './types';

// ── Mealy Machine ──
// Output on transitions: symbols format "input/output" e.g. "a/1"

export interface MealyEntry {
  input: string;
  output: string;
}

export function parseMealyLabel(label: string): MealyEntry | null {
  const match = label.match(/^\s*(.+?)\s*\/\s*(.+?)\s*$/);
  if (!match) return null;
  return { input: match[1].trim(), output: match[2].trim() };
}

export function formatMealyLabel(entry: MealyEntry): string {
  return `${entry.input}/${entry.output}`;
}

export interface MealySimState {
  stateId: string;
  inputPos: number;
  outputStr: string;
  status: 'running' | 'done' | 'error';
  steps: { stateLabel: string; input: string; output: string; nextState: string }[];
}

export function mealyRun(
  states: State[],
  transitions: Transition[],
  input: string,
): MealySimState {
  const initial = states.find(s => s.isInitial);
  if (!initial) return { stateId: '', inputPos: 0, outputStr: '', status: 'error', steps: [] };

  const stateMap = new Map(states.map(s => [s.id, s]));
  let currentId = initial.id;
  let output = '';
  const steps: MealySimState['steps'] = [];

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    let found = false;

    for (const t of transitions) {
      if (t.from !== currentId) continue;
      for (const sym of t.symbols) {
        const entry = parseMealyLabel(sym);
        if (entry && entry.input === ch) {
          const fromLabel = stateMap.get(currentId)?.label ?? '?';
          const toLabel = stateMap.get(t.to)?.label ?? '?';
          steps.push({ stateLabel: fromLabel, input: ch, output: entry.output, nextState: toLabel });
          output += entry.output;
          currentId = t.to;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      return { stateId: currentId, inputPos: i, outputStr: output, status: 'error', steps };
    }
  }

  return { stateId: currentId, inputPos: input.length, outputStr: output, status: 'done', steps };
}

// ── Moore Machine ──
// Output on states: state label includes output, format "q0/0"
// We store output in a separate field or parse from label

export interface MooreOutput {
  stateId: string;
  output: string;
}

export function parseMooreLabel(label: string): { name: string; output: string } {
  const match = label.match(/^(.+?)\/(.+)$/);
  if (match) return { name: match[1].trim(), output: match[2].trim() };
  return { name: label, output: '' };
}

export interface MooreSimState {
  stateId: string;
  inputPos: number;
  outputStr: string;
  status: 'running' | 'done' | 'error';
  steps: { stateLabel: string; stateOutput: string; input: string; nextState: string }[];
}

export function mooreRun(
  states: State[],
  transitions: Transition[],
  input: string,
): MooreSimState {
  const initial = states.find(s => s.isInitial);
  if (!initial) return { stateId: '', inputPos: 0, outputStr: '', status: 'error', steps: [] };

  const stateMap = new Map(states.map(s => [s.id, s]));
  let currentId = initial.id;

  // Initial output from start state
  const startParsed = parseMooreLabel(initial.label);
  let output = startParsed.output;
  const steps: MooreSimState['steps'] = [];

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    let found = false;

    for (const t of transitions) {
      if (t.from !== currentId) continue;
      if (t.symbols.includes(ch)) {
        const toState = stateMap.get(t.to);
        const toLabel = toState?.label ?? '?';
        const toParsed = parseMooreLabel(toLabel);
        steps.push({
          stateLabel: stateMap.get(currentId)?.label ?? '?',
          stateOutput: toParsed.output,
          input: ch,
          nextState: toLabel,
        });
        output += toParsed.output;
        currentId = t.to;
        found = true;
        break;
      }
    }

    if (!found) {
      return { stateId: currentId, inputPos: i, outputStr: output, status: 'error', steps };
    }
  }

  return { stateId: currentId, inputPos: input.length, outputStr: output, status: 'done', steps };
}
