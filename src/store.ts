import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { State, Transition, Mode, Tool, SimulationStatus, MultiRunResult } from './types';

interface Snapshot {
  states: State[];
  transitions: Transition[];
  mode: Mode;
}

interface StoreState {
  // Automaton
  states: State[];
  transitions: Transition[];
  mode: Mode;
  nextStateNum: number;

  // Editor
  tool: Tool;
  selectedIds: Set<string>;
  transitionDraft: { fromId: string; x: number; y: number } | null;
  editingTransitionId: string | null;
  editingStateId: string | null;
  contextMenu: { x: number; y: number; stateId?: string; transitionId?: string; canvasX?: number; canvasY?: number } | null;

  // Viewport
  pan: { x: number; y: number };
  zoom: number;

  // Undo/Redo
  undoStack: Snapshot[];
  redoStack: Snapshot[];

  // Simulation
  simInput: string;
  simStatus: SimulationStatus;
  simCurrentStates: Set<string>;
  simConsumed: string;
  simRemaining: string;
  multiRunResults: MultiRunResult[];

  // Panels
  showSidebar: boolean;
  showSimPanel: boolean;

  // Actions - automaton
  addState: (x: number, y: number) => void;
  deleteState: (id: string) => void;
  renameState: (id: string, label: string) => void;
  moveState: (id: string, x: number, y: number) => void;
  moveStates: (ids: string[], dx: number, dy: number) => void;
  toggleInitial: (id: string) => void;
  toggleAccepting: (id: string) => void;
  addTransition: (from: string, to: string) => void;
  deleteTransition: (id: string) => void;
  updateTransitionSymbols: (id: string, symbols: string[]) => void;
  setMode: (mode: Mode) => void;
  deleteSelected: () => void;
  autoLayout: () => void;
  loadAutomaton: (states: State[], transitions: Transition[], mode: Mode) => void;
  clearAll: () => void;
  addTrapState: () => void;

  // Actions - editor
  setTool: (tool: Tool) => void;
  setSelected: (ids: Set<string>) => void;
  toggleSelected: (id: string) => void;
  clearSelection: () => void;
  setTransitionDraft: (draft: { fromId: string; x: number; y: number } | null) => void;
  setEditingTransition: (id: string | null) => void;
  setEditingState: (id: string | null) => void;
  setContextMenu: (menu: { x: number; y: number; stateId?: string; transitionId?: string; canvasX?: number; canvasY?: number } | null) => void;

  // Actions - viewport
  setPan: (pan: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;

  // Actions - undo/redo
  pushUndo: () => void;
  undo: () => void;
  redo: () => void;

  // Actions - simulation
  setSimInput: (input: string) => void;
  simStart: () => void;
  simStep: () => void;
  simFastRun: () => void;
  simReset: () => void;
  simMultiRun: (inputs: string[]) => void;

  // Actions - panels
  toggleSidebar: () => void;
  toggleSimPanel: () => void;
}

function snap(s: StoreState): Snapshot {
  return {
    states: s.states.map(st => ({ ...st })),
    transitions: s.transitions.map(t => ({ ...t, symbols: [...t.symbols] })),
    mode: s.mode,
  };
}

let uid = 0;
function genId() { return `id_${Date.now()}_${uid++}`; }

// Epsilon closure for NFA simulation
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

function stepNFA(currentStates: Set<string>, symbol: string, transitions: Transition[]): Set<string> {
  const next = new Set<string>();
  for (const sid of currentStates) {
    for (const t of transitions) {
      if (t.from === sid && t.symbols.includes(symbol)) {
        next.add(t.to);
      }
    }
  }
  return epsilonClosure(next, transitions);
}

function runAutomaton(states: State[], transitions: Transition[], input: string, mode: Mode): boolean {
  const initial = states.find(s => s.isInitial);
  if (!initial) return false;

  let current: Set<string>;
  if (mode === 'nfa') {
    current = epsilonClosure(new Set([initial.id]), transitions);
  } else {
    current = new Set([initial.id]);
  }

  for (const ch of input) {
    current = stepNFA(current, ch, transitions);
    if (current.size === 0) return false;
  }

  return [...current].some(sid => states.find(s => s.id === sid)?.isAccepting);
}

export const useStore = create<StoreState>()(
  subscribeWithSelector((set, get) => ({
    states: [],
    transitions: [],
    mode: 'dfa',
    nextStateNum: 0,

    tool: 'pointer',
    selectedIds: new Set(),
    transitionDraft: null,
    editingTransitionId: null,
    editingStateId: null,
    contextMenu: null,

    pan: { x: 0, y: 0 },
    zoom: 1,

    undoStack: [],
    redoStack: [],

    simInput: '',
    simStatus: 'idle',
    simCurrentStates: new Set(),
    simConsumed: '',
    simRemaining: '',
    multiRunResults: [],

    showSidebar: true,
    showSimPanel: true,

    addState: (x, y) => {
      const s = get();
      s.pushUndo();
      const num = s.nextStateNum;
      set({
        states: [...s.states, { id: genId(), label: `q${num}`, x, y, isInitial: s.states.length === 0, isAccepting: false }],
        nextStateNum: num + 1,
        redoStack: [],
      });
    },

    deleteState: (id) => {
      const s = get();
      s.pushUndo();
      set({
        states: s.states.filter(st => st.id !== id),
        transitions: s.transitions.filter(t => t.from !== id && t.to !== id),
        selectedIds: new Set([...s.selectedIds].filter(i => i !== id)),
        redoStack: [],
      });
    },

    renameState: (id, label) => {
      const s = get();
      s.pushUndo();
      set({
        states: s.states.map(st => st.id === id ? { ...st, label } : st),
        redoStack: [],
      });
    },

    moveState: (id, x, y) => {
      set({ states: get().states.map(st => st.id === id ? { ...st, x, y } : st) });
    },

    moveStates: (ids, dx, dy) => {
      set({
        states: get().states.map(st =>
          ids.includes(st.id) ? { ...st, x: st.x + dx, y: st.y + dy } : st
        ),
      });
    },

    toggleInitial: (id) => {
      const s = get();
      s.pushUndo();
      set({
        states: s.states.map(st => ({ ...st, isInitial: st.id === id ? !st.isInitial : false })),
        redoStack: [],
      });
    },

    toggleAccepting: (id) => {
      const s = get();
      s.pushUndo();
      set({
        states: s.states.map(st => st.id === id ? { ...st, isAccepting: !st.isAccepting } : st),
        redoStack: [],
      });
    },

    addTransition: (from, to) => {
      const s = get();
      // For DFA/NFA/Mealy/Moore, if transition exists, open it for editing instead of blocking
      if (s.mode !== 'pda' && s.mode !== 'tm') {
        const existing = s.transitions.find(t => t.from === from && t.to === to);
        if (existing) {
          set({ editingTransitionId: existing.id, tool: 'pointer' });
          return;
        }
      }
      s.pushUndo();
      const defaultSymbol = s.mode === 'tm' ? 'a → a, R'
        : s.mode === 'pda' ? 'a, Z → Z'
        : s.mode === 'mealy' ? 'a/0'
        : s.mode === 'nfa' ? 'ε' : 'a';
      const newT: Transition = {
        id: genId(), from, to, symbols: [defaultSymbol],
        ...(s.mode === 'pda' ? { pdaTransitions: [{ input: 'a', pop: 'Z', push: 'Z' }] } : {}),
      };
      set({
        transitions: [...s.transitions, newT],
        editingTransitionId: newT.id,
        tool: 'pointer',
        redoStack: [],
      });
    },

    deleteTransition: (id) => {
      const s = get();
      s.pushUndo();
      set({
        transitions: s.transitions.filter(t => t.id !== id),
        redoStack: [],
      });
    },

    updateTransitionSymbols: (id, symbols) => {
      const s = get();
      set({
        transitions: s.transitions.map(t => t.id === id ? { ...t, symbols } : t),
      });
    },

    setMode: (mode) => {
      const s = get();
      s.pushUndo();
      set({ mode, redoStack: [] });
    },

    deleteSelected: () => {
      const s = get();
      if (s.selectedIds.size === 0) return;
      s.pushUndo();
      const ids = s.selectedIds;
      set({
        states: s.states.filter(st => !ids.has(st.id)),
        transitions: s.transitions.filter(t => !ids.has(t.id) && !ids.has(t.from) && !ids.has(t.to)),
        selectedIds: new Set(),
        redoStack: [],
      });
    },

    autoLayout: () => {
      const s = get();
      if (s.states.length === 0) return;
      s.pushUndo();
      // Simple circular layout
      const cx = 400, cy = 300, radius = Math.max(120, s.states.length * 40);
      const newStates = s.states.map((st, i) => {
        const angle = (2 * Math.PI * i) / s.states.length - Math.PI / 2;
        return { ...st, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
      });
      set({ states: newStates, redoStack: [] });
    },

    loadAutomaton: (states, transitions, mode) => {
      let maxNum = 0;
      for (const s of states) {
        const match = s.label.match(/^q(\d+)$/);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1]) + 1);
      }
      set({ states, transitions, mode, nextStateNum: maxNum, undoStack: [], redoStack: [] });
    },

    clearAll: () => {
      const s = get();
      s.pushUndo();
      set({ states: [], transitions: [], nextStateNum: 0, selectedIds: new Set(), redoStack: [] });
    },

    addTrapState: () => {
      const s = get();
      s.pushUndo();
      // Collect alphabet
      const alphabet = new Set<string>();
      for (const t of s.transitions) {
        for (const sym of t.symbols) {
          if (sym !== 'ε') alphabet.add(sym);
        }
      }
      if (alphabet.size === 0) return;

      // Find missing transitions for each state
      const stateIds = s.states.map(st => st.id);
      let needTrap = false;
      const missingTransitions: { from: string; symbols: string[] }[] = [];

      for (const st of s.states) {
        const covered = new Set<string>();
        for (const t of s.transitions) {
          if (t.from === st.id) {
            for (const sym of t.symbols) covered.add(sym);
          }
        }
        const missing = [...alphabet].filter(sym => !covered.has(sym));
        if (missing.length > 0) {
          needTrap = true;
          missingTransitions.push({ from: st.id, symbols: missing });
        }
      }

      if (!needTrap) return; // Already complete

      // Create trap state
      const trapId = genId();
      const maxX = Math.max(...s.states.map(st => st.x), 0);
      const avgY = s.states.reduce((sum, st) => sum + st.y, 0) / s.states.length || 300;
      const trapState: State = {
        id: trapId,
        label: `trap`,
        x: maxX + 150,
        y: avgY,
        isInitial: false,
        isAccepting: false,
      };

      // Create transitions to trap
      const newTransitions: Transition[] = [];
      for (const { from, symbols } of missingTransitions) {
        newTransitions.push({ id: genId(), from, to: trapId, symbols });
      }
      // Self-loop on trap for all symbols
      newTransitions.push({ id: genId(), from: trapId, to: trapId, symbols: [...alphabet] });

      set({
        states: [...s.states, trapState],
        transitions: [...s.transitions, ...newTransitions],
        nextStateNum: s.nextStateNum,
        redoStack: [],
      });
    },

    setTool: (tool) => set({ tool }),
    setSelected: (ids) => set({ selectedIds: ids }),
    toggleSelected: (id) => {
      const s = get();
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      set({ selectedIds: next });
    },
    clearSelection: () => set({ selectedIds: new Set(), editingTransitionId: null, editingStateId: null, contextMenu: null }),
    setTransitionDraft: (draft) => set({ transitionDraft: draft }),
    setEditingTransition: (id) => set({ editingTransitionId: id }),
    setEditingState: (id) => set({ editingStateId: id }),
    setContextMenu: (menu) => set({ contextMenu: menu }),

    setPan: (pan) => set({ pan }),
    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

    pushUndo: () => {
      const s = get();
      set({ undoStack: [...s.undoStack.slice(-50), snap(s)] });
    },

    undo: () => {
      const s = get();
      if (s.undoStack.length === 0) return;
      const prev = s.undoStack[s.undoStack.length - 1];
      set({
        undoStack: s.undoStack.slice(0, -1),
        redoStack: [...s.redoStack, snap(s)],
        states: prev.states,
        transitions: prev.transitions,
        mode: prev.mode,
      });
    },

    redo: () => {
      const s = get();
      if (s.redoStack.length === 0) return;
      const next = s.redoStack[s.redoStack.length - 1];
      set({
        redoStack: s.redoStack.slice(0, -1),
        undoStack: [...s.undoStack, snap(s)],
        states: next.states,
        transitions: next.transitions,
        mode: next.mode,
      });
    },

    setSimInput: (input) => set({ simInput: input }),

    simStart: () => {
      const s = get();
      const initial = s.states.find(st => st.isInitial);
      if (!initial) {
        set({ simStatus: 'rejected', simCurrentStates: new Set(), simConsumed: '', simRemaining: '' });
        return;
      }
      let current: Set<string>;
      if (s.mode === 'nfa') {
        current = epsilonClosure(new Set([initial.id]), s.transitions);
      } else {
        current = new Set([initial.id]);
      }
      set({
        simStatus: 'stepping',
        simCurrentStates: current,
        simConsumed: '',
        simRemaining: s.simInput,
      });
    },

    simStep: () => {
      const s = get();
      if (s.simStatus !== 'stepping' || s.simRemaining.length === 0) {
        // Check acceptance
        const accepted = [...s.simCurrentStates].some(sid =>
          s.states.find(st => st.id === sid)?.isAccepting
        );
        set({ simStatus: accepted ? 'accepted' : 'rejected' });
        return;
      }
      const ch = s.simRemaining[0];
      const next = stepNFA(s.simCurrentStates, ch, s.transitions);
      if (next.size === 0) {
        set({ simStatus: 'rejected', simCurrentStates: new Set(), simConsumed: s.simConsumed + ch, simRemaining: s.simRemaining.slice(1) });
        return;
      }
      set({
        simCurrentStates: next,
        simConsumed: s.simConsumed + ch,
        simRemaining: s.simRemaining.slice(1),
      });
    },

    simFastRun: () => {
      const s = get();
      const accepted = runAutomaton(s.states, s.transitions, s.simInput, s.mode);
      set({
        simStatus: accepted ? 'accepted' : 'rejected',
        simConsumed: s.simInput,
        simRemaining: '',
        simCurrentStates: new Set(),
      });
    },

    simReset: () => {
      set({
        simStatus: 'idle',
        simCurrentStates: new Set(),
        simConsumed: '',
        simRemaining: '',
        multiRunResults: [],
      });
    },

    simMultiRun: (inputs) => {
      const s = get();
      const results = inputs.map(input => ({
        input,
        accepted: runAutomaton(s.states, s.transitions, input, s.mode),
      }));
      set({ multiRunResults: results });
    },

    toggleSidebar: () => set({ showSidebar: !get().showSidebar }),
    toggleSimPanel: () => set({ showSimPanel: !get().showSimPanel }),
  }))
);
