# StateForge — PRD

> JFLAP for the modern web. Build, simulate, and share automata in the browser. No install, no accounts, just a URL.

## What Is This

A browser-based formal languages and automata toolkit. Visual editor for building state machines, grammars, and Turing machines. Everything encodes into a shareable URL — no backend, no database.

Think: JFLAP (the Java app every CS student downloads in college) rebuilt as a modern web app.

## Design

- **Dark mode default**, boxy everything, no gradients, no roundness
- Edge-to-edge full-screen layout, professional/DAW aesthetic
- Icons from `lucide-react`, never emojis
- Canvas-based editor with infinite pan/zoom
- Sidebar for properties, bottom panel for simulation output
- Command palette (Cmd+K) for power users

## Tech Stack

- **Next.js** (static export, no server)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** for state management (good undo/redo pattern)
- **HTML Canvas** (via React, for the graph editor) or a library like `reactflow` if it fits
- **lucide-react** for icons
- **lz-string** for URL compression
- Deploy to **Vercel**

## URL Sharing

This is a core feature, not an afterthought. The entire automaton state (states, transitions, positions, input alphabet, etc.) must encode into a URL using compression (lz-string → base64 → URL hash). Opening a link reconstructs the exact automaton. This is the file format — there are no files.

Also support:
- Local storage auto-save (recover work on refresh)
- Export as JSON, PNG, SVG
- Import JFLAP `.jff` files (XML format)

---

## Features

Build these in order. Each section is a milestone.

### Milestone 1: Canvas Editor + DFA/NFA

The foundation. Get this right and everything else layers on top.

**Canvas Editor:**
- Click to add states (circles with labels q0, q1, q2...)
- Drag between states to create transitions
- Click transition labels to edit (type symbols, comma-separated for multiple)
- Right-click context menu on states: set as initial, set as accepting, delete, rename
- Drag states to reposition
- Multi-select (box select + shift-click), group move/delete
- Undo/redo (Ctrl+Z / Ctrl+Shift+Z) with full history
- Zoom (scroll wheel) and pan (middle-click drag or space+drag)
- Auto-layout button (force-directed graph layout)
- Snap-to-grid toggle
- Minimap for large automata
- Keyboard shortcuts: Delete, Escape to deselect, Enter to confirm edits

**DFA Mode:**
- Exactly one initial state (arrow indicator)
- Accepting states shown with double circle
- One transition per symbol per state (enforce determinism)
- Alphabet auto-detected from transitions or manually specified
- Trap state auto-insert button (add missing transitions to a trap state)

**NFA Mode:**
- Same visual editor
- Multiple transitions per symbol allowed
- ε (epsilon) transitions supported
- Visual distinction from DFA mode (mode toggle in toolbar)

**Simulation:**
- Input field for test string
- **Step mode:** advance one symbol at a time, highlight current state(s), show consumed/remaining input
- For NFAs: highlight ALL active states simultaneously (subset)
- **Fast run:** instant accept/reject result
- **Multi-run:** paste or type multiple strings, show results in a table (string → accept/reject)
- Visual feedback: green highlight for accept, red for reject, yellow for current state during stepping
- Tape-style input display showing head position

**URL Sharing:**
- Encode full automaton (states, positions, transitions, properties) into URL hash
- Share button → copy URL to clipboard
- Opening URL reconstructs automaton exactly

### Milestone 2: Conversions & Operations

**NFA → DFA Conversion:**
- Subset construction algorithm
- Show the conversion animated step-by-step OR show resulting DFA side-by-side
- New states labeled with subset notation {q0, q1}

**DFA Minimization:**
- Table-filling (distinguishability) algorithm
- Show equivalent state groups, then merged result
- Before/after view

**FA → Regular Expression:**
- State elimination method
- Step-by-step: user sees states being eliminated and RE building up

**Regular Expression → NFA:**
- Thompson's construction
- Input RE string, output NFA on canvas
- Animated construction optional

**FA → Regular Grammar:**
- Convert and display right-linear grammar in a panel
- Each transition becomes a production

**Combine Automata:**
- Select two automata (tabs or split view)
- Product construction for: union, intersection, difference, complement
- Result appears as new automaton

### Milestone 3: Grammars & Parsing

**Grammar Editor:**
- Text editor panel for entering productions (e.g., `S → aSb | ε`)
- Syntax highlighting for terminals vs non-terminals
- Auto-detect grammar type: regular, context-free, context-sensitive, unrestricted
- Show classification badge

**Grammar Transformations:**
- Remove ε-productions
- Remove unit productions
- Remove useless symbols (unreachable + non-generating)
- Convert to Chomsky Normal Form (CNF)
- Convert to Greibach Normal Form (GNF)
- Show step-by-step transformation

**Parsers:**
- **Brute force parser:** test if string is in language (any grammar type)
- **CYK parser:** dynamic programming table visualization (triangular table), highlight cells as they fill
- **LL(1) parse table:** compute FIRST/FOLLOW sets, build parse table, highlight conflicts
- **SLR(1) parse table:** compute items, build action/goto table
- **User-controlled parsing:** step through derivation manually, choose which production to apply

**Parse Tree Visualization:**
- Render parse tree as a visual tree structure for successful parses
- Animate derivation (leftmost/rightmost)

**Grammar ↔ Automata Conversions:**
- Right-linear grammar → FA
- CFG → PDA (LL conversion)
- CFG → PDA (LR conversion)
- PDA → CFG

### Milestone 4: Pushdown Automata

**PDA Editor:**
- Same canvas editor as FA but transitions show: input symbol, stack pop, stack push
- Transition label format: `a, Z → AZ` (read a, pop Z, push AZ)
- Stack alphabet configuration

**Stack Visualization:**
- Real-time stack display panel during simulation
- Stack grows/shrinks visually with each step
- Show full stack contents at each step

**Simulation:**
- Step-by-step with stack state visible
- For nondeterministic PDAs: computation tree view showing all branches
- Accept by final state or by empty stack (configurable)

### Milestone 5: Turing Machines

**TM Editor:**
- Canvas editor for states
- Transitions show: read symbol, write symbol, move direction (L/R/S)
- Transition label format: `a → b, R`

**Tape Visualization:**
- Horizontal tape with cells, head pointer
- Scrolling tape that follows the head
- Shows blank symbols extending in both directions
- Animation speed control (slow step-through to fast-forward)

**Multi-tape TM:**
- Support k tapes (user configurable)
- Each tape shown as separate row
- Synchronized stepping across all tapes

**Building Blocks:**
- Save a TM as a named "block"
- Use blocks as states in a higher-level TM
- Expand/collapse blocks

**TM → Unrestricted Grammar:**
- Conversion with output grammar display

**Safety:**
- Configurable step limit to prevent infinite loops
- Pause/stop buttons during simulation

### Milestone 6: Advanced Features

**Mealy & Moore Machines:**
- Mealy: output on transitions (add output label to transitions)
- Moore: output on states (add output label to states)
- Simulation shows output string building up

**Regular Pumping Lemma:**
- Interactive adversarial game
- System picks string, user picks decomposition (or vice versa)
- Visual feedback on whether pumped string is in/out of language

**Context-Free Pumping Lemma:**
- Same game structure but for CFLs
- Choose decomposition into uvxyz

**L-Systems:**
- Define: alphabet, axiom, production rules
- Turtle graphics rendering on canvas
- Iteration depth slider
- Presets: Koch curve, Sierpinski triangle, dragon curve, plant fractals

**Teaching Features:**
- **Assignment mode:** professor defines spec ("build a DFA that accepts strings with even number of 0s"), shares URL. Student builds solution, their URL encodes the answer
- **Embed mode:** `<iframe>` embeddable for course websites
- **Presentation mode:** fullscreen, large text/states, clean animations for lectures
- **Canvas annotations:** add text labels/notes

**Gallery:**
- Home screen with curated example automata
- Categories: DFA, NFA, PDA, TM, Grammars, L-Systems
- Click to open and explore

---

## File Import/Export

- **Import JFLAP `.jff`** — parse XML, reconstruct automaton on canvas. Critical for migration.
- **Export JSON** — full state dump, can re-import
- **Export PNG/SVG** — screenshot of canvas for reports/papers
- **Copy as LaTeX** — generate TikZ automata code (stretch goal, very useful for CS students)
