import type { State, Transition } from './types';

// ── TM Transition Parsing ──

export interface TMTransitionEntry {
  read: string;       // symbol to read
  write: string;      // symbol to write
  move: 'L' | 'R' | 'S'; // head movement
}

/**
 * Parse a TM transition label like "a → b, R" or "a/b,R"
 */
export function parseTMLabel(label: string): TMTransitionEntry | null {
  // Format: read → write, direction  OR  read/write,direction
  const match = label.match(/^\s*(.+?)\s*(?:→|->|\/)\s*(.+?)\s*,\s*([LRS])\s*$/i);
  if (!match) return null;
  return {
    read: match[1].trim(),
    write: match[2].trim(),
    move: match[3].toUpperCase() as 'L' | 'R' | 'S',
  };
}

export function formatTMLabel(entry: TMTransitionEntry): string {
  return `${entry.read} → ${entry.write}, ${entry.move}`;
}

export function getTMEntries(t: Transition): TMTransitionEntry[] {
  return t.symbols.map(s => parseTMLabel(s)).filter((e): e is TMTransitionEntry => e !== null);
}

// ── TM Tape ──

export interface TMTape {
  cells: Map<number, string>;  // position → symbol
  head: number;                // head position
  blankSymbol: string;
}

export function createTape(input: string, blankSymbol = '⊔'): TMTape {
  const cells = new Map<number, string>();
  for (let i = 0; i < input.length; i++) {
    cells.set(i, input[i]);
  }
  return { cells, head: 0, blankSymbol };
}

export function readTape(tape: TMTape): string {
  return tape.cells.get(tape.head) ?? tape.blankSymbol;
}

export function writeTape(tape: TMTape, symbol: string): TMTape {
  const newCells = new Map(tape.cells);
  if (symbol === tape.blankSymbol) {
    newCells.delete(tape.head);
  } else {
    newCells.set(tape.head, symbol);
  }
  return { ...tape, cells: newCells };
}

export function moveTape(tape: TMTape, direction: 'L' | 'R' | 'S'): TMTape {
  const delta = direction === 'L' ? -1 : direction === 'R' ? 1 : 0;
  return { ...tape, head: tape.head + delta };
}

export function tapeToString(tape: TMTape, padding = 3): { str: string; headIdx: number; startPos: number } {
  let minPos = tape.head - padding;
  let maxPos = tape.head + padding;
  for (const pos of tape.cells.keys()) {
    minPos = Math.min(minPos, pos);
    maxPos = Math.max(maxPos, pos);
  }
  // Add padding
  minPos -= 1;
  maxPos += 1;

  const chars: string[] = [];
  for (let i = minPos; i <= maxPos; i++) {
    chars.push(tape.cells.get(i) ?? tape.blankSymbol);
  }
  return { str: chars.join(''), headIdx: tape.head - minPos, startPos: minPos };
}

// ── TM Simulation ──

export interface TMSimState {
  stateId: string;
  tape: TMTape;
  step: number;
  status: 'running' | 'accepted' | 'rejected' | 'halted';
  history: { stateId: string; tape: TMTape; action: string }[];
}

export function tmInit(
  states: State[],
  input: string,
): TMSimState | null {
  const initial = states.find(s => s.isInitial);
  if (!initial) return null;

  const tape = createTape(input);
  return {
    stateId: initial.id,
    tape,
    step: 0,
    status: 'running',
    history: [{ stateId: initial.id, tape, action: 'Start' }],
  };
}

export function tmStep(
  sim: TMSimState,
  states: State[],
  transitions: Transition[],
): TMSimState {
  if (sim.status !== 'running') return sim;

  const currentSymbol = readTape(sim.tape);

  // Find applicable transition
  for (const t of transitions) {
    if (t.from !== sim.stateId) continue;
    const entries = getTMEntries(t);
    for (const entry of entries) {
      if (entry.read === currentSymbol || entry.read === '*') {
        // Apply transition
        const writeSymbol = entry.write === '*' ? currentSymbol : entry.write;
        let newTape = writeTape(sim.tape, writeSymbol);
        newTape = moveTape(newTape, entry.move);

        const toState = states.find(s => s.id === t.to);
        const isAccepting = toState?.isAccepting ?? false;

        const action = `Read '${currentSymbol}', write '${writeSymbol}', move ${entry.move} → ${toState?.label ?? t.to}`;

        const newHistory = [...sim.history, { stateId: t.to, tape: newTape, action }];

        return {
          stateId: t.to,
          tape: newTape,
          step: sim.step + 1,
          status: isAccepting ? 'accepted' : 'running',
          history: newHistory,
        };
      }
    }
  }

  // No transition found — halt/reject
  const currentState = states.find(s => s.id === sim.stateId);
  const haltHistory = [...sim.history, { stateId: sim.stateId, tape: sim.tape, action: 'No transition — halt' }];
  return {
    ...sim,
    status: currentState?.isAccepting ? 'accepted' : 'rejected',
    history: haltHistory,
  };
}

export function tmFastRun(
  states: State[],
  transitions: Transition[],
  input: string,
  maxSteps = 1000,
): TMSimState | null {
  let sim = tmInit(states, input);
  if (!sim) return null;

  while (sim.status === 'running' && sim.step < maxSteps) {
    sim = tmStep(sim, states, transitions);
  }

  if (sim.step >= maxSteps && sim.status === 'running') {
    sim = { ...sim, status: 'halted' };
  }

  return sim;
}

// ── Multi-tape TM ──

export interface MultiTapeTMSimState {
  stateId: string;
  tapes: TMTape[];
  step: number;
  status: 'running' | 'accepted' | 'rejected' | 'halted';
  history: { stateId: string; tapes: TMTape[]; action: string }[];
}

export interface MultiTapeEntry {
  reads: string[];
  writes: string[];
  moves: ('L' | 'R' | 'S')[];
}

export function parseMultiTapeLabel(label: string, numTapes: number): MultiTapeEntry | null {
  // Format: "a,b → c,d, R,L" for 2 tapes
  // reads ; writes ; moves  separated by ;
  const parts = label.split(';').map(p => p.trim());
  if (parts.length !== 3) return null;

  const reads = parts[0].split(',').map(s => s.trim());
  const writes = parts[1].split(',').map(s => s.trim());
  const moves = parts[2].split(',').map(s => s.trim().toUpperCase() as 'L' | 'R' | 'S');

  if (reads.length !== numTapes || writes.length !== numTapes || moves.length !== numTapes) return null;

  return { reads, writes, moves };
}

export function multiTapeInit(
  states: State[],
  inputs: string[],  // one per tape
  numTapes: number,
): MultiTapeTMSimState | null {
  const initial = states.find(s => s.isInitial);
  if (!initial) return null;

  const tapes = Array.from({ length: numTapes }, (_, i) =>
    createTape(inputs[i] ?? '')
  );

  return {
    stateId: initial.id,
    tapes,
    step: 0,
    status: 'running',
    history: [{ stateId: initial.id, tapes: tapes.map(t => ({ ...t, cells: new Map(t.cells) })), action: 'Start' }],
  };
}

export function multiTapeStep(
  sim: MultiTapeTMSimState,
  states: State[],
  transitions: Transition[],
  numTapes: number,
): MultiTapeTMSimState {
  if (sim.status !== 'running') return sim;

  const currentSymbols = sim.tapes.map(t => readTape(t));

  for (const t of transitions) {
    if (t.from !== sim.stateId) continue;
    for (const label of t.symbols) {
      const entry = parseMultiTapeLabel(label, numTapes);
      if (!entry) continue;

      // Check if reads match
      const matches = entry.reads.every((r, i) => r === currentSymbols[i] || r === '*');
      if (!matches) continue;

      // Apply
      const newTapes = sim.tapes.map((tape, i) => {
        const writeSymbol = entry.writes[i] === '*' ? currentSymbols[i] : entry.writes[i];
        let newTape = writeTape(tape, writeSymbol);
        newTape = moveTape(newTape, entry.moves[i]);
        return newTape;
      });

      const toState = states.find(s => s.id === t.to);
      const action = `Read [${currentSymbols.join(',')}], write [${entry.writes.join(',')}], move [${entry.moves.join(',')}]`;

      return {
        stateId: t.to,
        tapes: newTapes,
        step: sim.step + 1,
        status: toState?.isAccepting ? 'accepted' : 'running',
        history: [...sim.history, { stateId: t.to, tapes: newTapes.map(t => ({ ...t, cells: new Map(t.cells) })), action }],
      };
    }
  }

  const currentState = states.find(s => s.id === sim.stateId);
  return {
    ...sim,
    status: currentState?.isAccepting ? 'accepted' : 'rejected',
    history: [...sim.history, { stateId: sim.stateId, tapes: sim.tapes, action: 'No transition — halt' }],
  };
}
