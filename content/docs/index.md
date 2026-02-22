# <span class="text-[var(--color-accent)]">STATE</span><span class="text-[var(--color-text-bright)]">FORGE</span> <span class="text-sm text-[var(--color-text-dim)] ml-3 font-normal tracking-normal">Documentation</span>

StateForge is a browser-based tool for building, simulating, and converting formal automata.
It supports DFA, NFA, PDA, Turing machines, Mealy/Moore machines, context-free grammars, and L-systems — all in one interface with zero installation.
Everything runs client-side: your automaton is encoded into the URL hash on every change, so sharing is as simple as copying the link.

### Why StateForge over JFLAP?

→ Runs in any browser — no Java, no downloads, no installation

→ Shareable URLs encode your entire automaton (states, transitions, positions, mode)

→ Dark, modern UI with keyboard-first workflow and full mobile support

→ JFLAP .jff file import supported (FA, PDA, and TM types)

→ Step-through conversions with visual explanations at each stage

→ Built-in CYK, LL(1), and brute-force parsers for context-free grammars

→ L-system rendering with turtle graphics and 6 built-in presets

→ Undo/redo with up to 50 history snapshots

→ Auto-save to localStorage with 500ms debounce

→ Full touch support: pinch-to-zoom, drag states, long-press for context menus

![Full app view — DFA with states, transitions, sidebar, and simulation panel](/docs/canvas-dfa.png)

## Getting Started

When you first visit StateForge, you'll see the **Gallery** — a collection of example automata organized by type (DFA, NFA, PDA, TM, Mealy, Moore). Click any example to load it onto the canvas, or click **Start from Scratch** to begin with an empty canvas.

Your automaton is automatically saved to localStorage and encoded into the URL hash on every change. You can share your work by simply copying the URL — no account needed.
If a URL with a hash is opened, it takes priority over localStorage and loads the encoded automaton.

### Creating your first automaton

1. **Double-click** the canvas to add your first state (q0, automatically set as initial)
2. Double-click again to add more states (q1, q2, ... auto-numbered)
3. Press <kbd>T</kbd> to switch to the transition tool, then drag from one state to another
4. Edit the transition label in the inline popup that appears (type symbols separated by commas)
5. **Right-click** a state to toggle Initial or Accepting (on mobile, long-press)
6. Open the simulation panel (<kbd>⌘.</kbd>) and test your automaton with input strings

### Interface layout

The interface has four main areas:

→ **Toolbar** (top) — Mode selector (1–8), tool buttons (pointer/state/transition), and action buttons (share, export, import, layout, convert, clear)

→ **Canvas** (center) — Infinite SVG workspace with dot grid where you build your automaton

→ **Properties sidebar** (right, toggle with <kbd>⌘/</kbd>) — Formal definition, transition table, state list, DFA validation

→ **Simulation panel** (bottom, toggle with <kbd>⌘.</kbd>) — Input tape, step controls, batch testing

![Gallery — pick a pre-built example or start from scratch](/docs/gallery.png)
