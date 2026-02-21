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

export type Mode = 'dfa' | 'nfa' | 'grammar';
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

// ── Grammar types ──

export interface Production {
  id: string;
  head: string;        // non-terminal (uppercase)
  body: string[];      // array of symbols (terminals + non-terminals)
}

export interface Grammar {
  productions: Production[];
  startSymbol: string;
}

export type GrammarType = 'regular' | 'context-free' | 'context-sensitive' | 'unrestricted' | 'unknown';

// ── Parse tree ──

export interface ParseTreeNode {
  symbol: string;
  children: ParseTreeNode[];
  isTerminal: boolean;
}

// ── CYK table cell ──

export interface CYKCell {
  nonTerminals: string[];
  row: number;
  col: number;
}
