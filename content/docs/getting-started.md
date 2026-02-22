# Getting started

## The gallery

When you first visit StateForge, you'll see the **Gallery**, a collection of example automata organized by type. Click any example to load it onto the canvas, or click **Start from Scratch** to begin with an empty canvas.

![Gallery — pick a pre-built example or start from scratch](/docs/gallery.png)

Your automaton is automatically saved to localStorage and encoded into the URL hash on every change. You can share your work by simply copying the URL, no account needed.

## Creating your first automaton

1. **Double-click** the canvas to add your first state (it's automatically labeled q0 and set as the initial state)
2. Double-click again to add more states (q1, q2, ... auto-numbered)
3. Press <kbd>T</kbd> to switch to the transition tool, then **drag from one state to another**
4. Edit the transition label in the popup that appears, typing symbols separated by commas
5. **Right-click** a state to toggle Initial or Accepting (on mobile, long-press)
6. Open the simulation panel with <kbd>Ctrl</kbd>+<kbd>.</kbd> and test your automaton with input strings

> **Tip:** You can also press <kbd>S</kbd> to switch to the state tool and click anywhere to place states, or press <kbd>V</kbd> to go back to the pointer tool.

## Interface layout

The interface has four main areas:

### Toolbar (top)

Mode tabs (DFA, NFA, PDA, TM, Mealy, Moore, CFG, L-SYS), canvas tools (pointer, add state, add transition, delete), and action buttons (share, export, import, layout, convert, clear).

Switch modes with number keys: <kbd>1</kbd> DFA, <kbd>2</kbd> NFA, <kbd>3</kbd> PDA, <kbd>4</kbd> TM, <kbd>5</kbd> Mealy, <kbd>6</kbd> Moore, <kbd>7</kbd> CFG, <kbd>8</kbd> L-SYS.

![Toolbar](/docs/toolbar.png)

### Canvas (center)

The infinite SVG workspace where you build your automaton. Features:

→ **Dot grid** background (20px spacing) for visual alignment

→ **Pan** by holding <kbd>Space</kbd> and dragging, or middle-click drag

→ **Zoom** with scroll wheel or pinch gesture (0.25×–3× range)

→ **Zoom to fit** with <kbd>⌘</kbd>+<kbd>1</kbd> or the maximize button, auto-frames all states

→ **Select** states by clicking, shift-clicking for multi-select, or box-selecting by dragging on empty canvas

### Properties sidebar (right)

Toggle with <kbd>/</kbd>. Shows:

→ Formal definition (Q, Σ, δ, q₀, F)

→ Transition table (δ)

→ State list with initial/accepting badges

→ DFA validation errors (if applicable)

→ Trap state generation button

![Properties panel](/docs/sidebar.png)

### Simulation panel (bottom)

Toggle with <kbd>Ctrl</kbd>+<kbd>.</kbd>. Two modes:

→ **Single mode** — Enter a string, step through or fast-run, see accept/reject result with input tape visualization

→ **Multi mode** — Batch test multiple strings at once, see pass/fail results for each

![Simulation panel](/docs/sim-accepted.png)

## Saving and sharing

**Auto-save:** Your work is saved to localStorage every 500ms. When you return, it loads automatically.

**URL sharing:** The URL hash encodes your entire automaton. Copy the URL to share; anyone who opens it gets your exact automaton with all states, transitions, and positions.

**Priority:** URL hash > localStorage. If a shared URL is opened, it overrides any local save.

**Export:** Download as JSON (StateForge format) or import JFLAP .jff files.

## Keyboard shortcuts

Press <kbd>?</kbd> to see all keyboard shortcuts. Key ones:

| Shortcut | Action |
|----------|--------|
| <kbd>V</kbd> | Pointer tool |
| <kbd>S</kbd> | Add State tool |
| <kbd>T</kbd> | Add Transition tool |
| <kbd>D</kbd> | Delete tool |
| <kbd>⌘Z</kbd> | Undo |
| <kbd>⌘⇧Z</kbd> | Redo |
| <kbd>Del</kbd> | Delete selected |
| <kbd>⌘A</kbd> | Select all |
| <kbd>⌘1</kbd> | Zoom to fit |
| <kbd>/</kbd> | Toggle sidebar |
| <kbd>⌘.</kbd> | Toggle simulation |
| <kbd>?</kbd> | Show all shortcuts |
