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

  // Conversion highlighting
  conversionHighlight: {
    highlightedStates: Set<string>;   // state IDs to highlight on canvas
    highlightedTransitions: Set<string>; // transition IDs to highlight
    label?: string;                   // tooltip/label for current step
  } | null;

  // Panels
  showSidebar: boolean;
  showSimPanel: boolean;

  // Actions - automaton
  addState: (x: number, y: number) => void;
  deleteState: (id: string) => void;
  renameState: (id: string, label: string) => void;
  moveState: (id: string, x: number, y: number) => void;
  moveStates: (ids: string[], dx: number, dy: number) => void;
  setStatePositions: (positions: Map<string, {x: number; y: number}>) => void;
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
  zoomToFit: () => void;

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

  // Actions - conversion highlight
  setConversionHighlight: (h: StoreState['conversionHighlight']) => void;

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
    zoom: 1.5,

    undoStack: [],
    redoStack: [],

    simInput: '',
    simStatus: 'idle',
    simCurrentStates: new Set(),
    simConsumed: '',
    simRemaining: '',
    multiRunResults: [],


    conversionHighlight: null,

    showSidebar: true,
    showSimPanel: true,

    addState: (x, y) => {
      const s = get();
      s.pushUndo();
      const num = s.nextStateNum;
      const isFirst = s.states.length === 0;
      set({
        states: [...s.states, { id: genId(), label: `q${num}`, x, y, isInitial: isFirst, isAccepting: false }],
        nextStateNum: num + 1,
        redoStack: [],
      });
      // Auto-fit when we have a few states to keep things nicely framed
      if (isFirst) {
        // Center on first state using actual canvas dimensions
        const canvasEl = typeof document !== 'undefined' ? document.querySelector('[data-canvas]') as HTMLElement | null : null;
        const cw = canvasEl ? canvasEl.clientWidth : 800;
        const ch = canvasEl ? canvasEl.clientHeight : 600;
        const zoom = get().zoom;
        set({ pan: { x: cw / 2 - x * zoom, y: ch / 2 - y * zoom } });
      }
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
        states: get().states.map(st => {
          if (!ids.includes(st.id)) return st;
          return { ...st, x: st.x + dx, y: st.y + dy };
        }),
      });
    },

    setStatePositions: (positions) => {
      set({
        states: get().states.map(st => {
          const pos = positions.get(st.id);
          if (!pos) return st;
          return { ...st, x: pos.x, y: pos.y };
        }),
      });
    },

    toggleInitial: (id) => {
      const s = get();
      s.pushUndo();
      const target = s.states.find(st => st.id === id);
      if (target?.isInitial) {
        // Already initial — just toggle it off, don't touch others
        set({
          states: s.states.map(st => st.id === id ? { ...st, isInitial: false } : st),
          redoStack: [],
        });
      } else {
        // Make this state initial, clear others (exactly one initial)
        set({
          states: s.states.map(st => ({ ...st, isInitial: st.id === id })),
          redoStack: [],
        });
      }
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
      // If a transition between these states already exists, open it for editing
      // (users can add more symbols there). This applies to all modes except PDA/TM
      // which allow genuinely separate transitions (different pop/push/read/write).
      // Self-loops always allow creating new transitions so users can have
      // separate labeled edges for clarity.
      if (s.mode !== 'pda' && s.mode !== 'tm' && from !== to) {
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

      if (s.states.length === 1) {
        set({ states: [{ ...s.states[0], x: 400, y: 300 }], redoStack: [] });
        setTimeout(() => get().zoomToFit(), 50);
        return;
      }

      // Force-directed layout
      const n = s.states.length;
      const pos: { x: number; y: number }[] = s.states.map((st, i) => {
        // Initialize in a circle to avoid overlap
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const r = Math.max(120, n * 40);
        return { x: 400 + r * Math.cos(angle), y: 300 + r * Math.sin(angle) };
      });

      const idToIdx = new Map(s.states.map((st, i) => [st.id, i]));
      const edges = s.transitions
        .map(t => ({ a: idToIdx.get(t.from)!, b: idToIdx.get(t.to)! }))
        .filter(e => e.a !== undefined && e.b !== undefined && e.a !== e.b);

      const REPULSION = 8000;
      const SPRING_K = 0.02;
      const IDEAL_LEN = 150;
      const DAMPING = 0.9;
      const ITERATIONS = 100;

      const vel = pos.map(() => ({ x: 0, y: 0 }));

      for (let iter = 0; iter < ITERATIONS; iter++) {
        const force = pos.map(() => ({ x: 0, y: 0 }));

        // Repulsion between all pairs
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            let dx = pos[i].x - pos[j].x;
            let dy = pos[i].y - pos[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const f = REPULSION / (dist * dist);
            const fx = (dx / dist) * f;
            const fy = (dy / dist) * f;
            force[i].x += fx; force[i].y += fy;
            force[j].x -= fx; force[j].y -= fy;
          }
        }

        // Attraction along edges
        for (const { a, b } of edges) {
          const dx = pos[b].x - pos[a].x;
          const dy = pos[b].y - pos[a].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = SPRING_K * (dist - IDEAL_LEN);
          const fx = (dx / dist) * f;
          const fy = (dy / dist) * f;
          force[a].x += fx; force[a].y += fy;
          force[b].x -= fx; force[b].y -= fy;
        }

        // Update positions
        for (let i = 0; i < n; i++) {
          vel[i].x = (vel[i].x + force[i].x) * DAMPING;
          vel[i].y = (vel[i].y + force[i].y) * DAMPING;
          pos[i].x += vel[i].x;
          pos[i].y += vel[i].y;
        }
      }

      const newStates = s.states.map((st, i) => ({
        ...st, x: Math.round(pos[i].x), y: Math.round(pos[i].y),
      }));
      set({ states: newStates, redoStack: [] });
      setTimeout(() => get().zoomToFit(), 50);
    },

    loadAutomaton: (states, transitions, mode) => {
      let maxNum = 0;
      for (const s of states) {
        const match = s.label.match(/^q(\d+)$/);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1]) + 1);
      }
      set({ states, transitions, mode, nextStateNum: maxNum, undoStack: [], redoStack: [] });
      // Auto-fit after loading
      setTimeout(() => get().zoomToFit(), 50);
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
    setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(3, zoom)) }),
    zoomToFit: () => {
      const { states } = get();
      if (states.length === 0) { set({ pan: { x: 0, y: 0 }, zoom: 1 }); return; }
      const xs = states.map(s => s.x);
      const ys = states.map(s => s.y);
      const minX = Math.min(...xs) - 80;
      const maxX = Math.max(...xs) + 80;
      const minY = Math.min(...ys) - 80;
      const maxY = Math.max(...ys) + 80;
      const w = maxX - minX;
      const h = maxY - minY;
      // Measure actual visible canvas area
      const canvasEl = document.querySelector('[data-canvas]') as HTMLElement | null;
      const cw = canvasEl ? canvasEl.clientWidth : window.innerWidth - 300;
      const ch = canvasEl ? canvasEl.clientHeight : window.innerHeight - 200;
      const zoom = Math.max(0.5, Math.min(2.5, Math.min(cw / w, ch / h) * 0.8));
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      set({ zoom, pan: { x: cw / 2 - cx * zoom, y: ch / 2 - cy * zoom } });
    },

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
      // Intentionally uses NFA step logic for DFA too — DFA states are a subset of NFA,
      // so the same algorithm works. Determinism is enforced via validation errors in Properties.
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

    setConversionHighlight: (h) => set({ conversionHighlight: h }),
    toggleSidebar: () => set({ showSidebar: !get().showSidebar }),
    toggleSimPanel: () => set({ showSimPanel: !get().showSimPanel }),
  }))
);
