export interface State {
  id: string;
  label: string;
  x: number;
  y: number;
  isInitial: boolean;
  isAccepting: boolean;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  symbols: string[];
}

export type Mode = 'dfa' | 'nfa';
export type Tool = 'pointer' | 'addState' | 'addTransition';

export interface AutomatonData {
  states: State[];
  transitions: Transition[];
  mode: Mode;
}

export type SimulationStatus = 'idle' | 'stepping' | 'accepted' | 'rejected';

export interface MultiRunResult {
  input: string;
  accepted: boolean;
}
