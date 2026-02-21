// ============================================================
// SECTION 1: CANVAS & STATES
// ============================================================
export const canvasAndStatesSection = `
<h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Canvas & States</h2>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  The canvas is the infinite workspace where you build your automaton. States are rendered as <strong className="text-[var(--color-text)]">square nodes</strong> (not circles) with a radius constant of <strong className="text-[var(--color-text)]">STATE_RADIUS = 28</strong> pixels, giving each state a 56×56px bounding box. The background displays a <strong className="text-[var(--color-text)]">dot grid</strong> pattern (20px spacing) for spatial reference.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Adding States</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  There are three ways to add a state to the canvas:
</p>
<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ <strong className="text-[var(--color-text)]">Double-click</strong> on empty canvas space (when the Pointer tool is active)</li>
  <li>→ Select the <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">S</kbd> tool from the toolbar, then click anywhere on the canvas</li>
  <li>→ <strong className="text-[var(--color-text)]">Right-click</strong> on empty canvas → <strong className="text-[var(--color-text)]">Add State Here</strong> (places the state exactly at cursor position)</li>
</ul>
<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  New states are automatically labeled <strong className="text-[var(--color-text)]">q0</strong>, <strong className="text-[var(--color-text)]">q1</strong>, <strong className="text-[var(--color-text)]">q2</strong>, etc. The very first state added to an empty canvas is automatically marked as the <strong className="text-[var(--color-text)]">initial state</strong>.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Editing State Labels</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  <strong className="text-[var(--color-text)]">Double-click</strong> a state to open the inline label editor. Type a new name and press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Enter</kbd> to confirm, or <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Escape</kbd> to cancel. Labels longer than 10 characters are truncated with an ellipsis on the canvas. Font size automatically scales down for labels longer than 6 characters. You can also right-click a state → <strong className="text-[var(--color-text)]">Rename</strong>.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Initial & Accepting States</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  Right-click a state to access its context menu:
</p>
<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ <strong className="text-[var(--color-text)]">Set Initial</strong> — marks this state as the start state. An <strong className="text-[var(--color-text)]">incoming arrow</strong> (30px long) appears to its left. Only one state can be initial at a time; setting a new initial state clears the previous one.</li>
  <li>→ <strong className="text-[var(--color-text)]">Set Accepting</strong> — toggles the accepting (final) state. Accepting states display a <strong className="text-[var(--color-text)]">double border</strong> — an outer rectangle 4px larger than the state rectangle on each side. Multiple states can be accepting.</li>
  <li>→ <strong className="text-[var(--color-text)]">Rename</strong> — opens the inline label editor</li>
  <li>→ <strong className="text-[var(--color-text)]">Delete</strong> — removes the state and all connected transitions</li>
</ul>
<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  You can also toggle Initial and Accepting from the <strong className="text-[var(--color-text)]">sidebar Properties panel</strong> using checkboxes when a state is selected.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Moving States</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  <strong className="text-[var(--color-text)]">Click and drag</strong> any state to reposition it. If multiple states are selected, dragging one moves the entire selection together. An undo snapshot is pushed on the first drag movement, so you can always <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Ctrl+Z</kbd> to revert.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Selection</h3>

<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ <strong className="text-[var(--color-text)]">Click</strong> a state to select it (clears previous selection)</li>
  <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Shift</kbd>+click to toggle a state in/out of the selection</li>
  <li>→ <strong className="text-[var(--color-text)]">Box selection</strong> — click and drag on empty canvas to draw a selection rectangle. All states within the rectangle are selected on release. The box is rendered with a dashed accent-colored border and translucent fill.</li>
  <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Ctrl+A</kbd> — select all states</li>
  <li>→ Click empty canvas to <strong className="text-[var(--color-text)]">clear selection</strong></li>
</ul>
<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  Selected states are highlighted with an <strong className="text-[var(--color-text)]">accent-colored border</strong> (2px) and a subtle <strong className="text-[var(--color-text)]">glow filter</strong>.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Deleting States</h3>

<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ Select state(s) and press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Delete</kbd> or <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Backspace</kbd></li>
  <li>→ Right-click → <strong className="text-[var(--color-text)]">Delete</strong></li>
</ul>
<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  Deleting a state also removes all transitions connected to it (both incoming and outgoing).
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Touch & Mobile</h3>

<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ <strong className="text-[var(--color-text)]">Long-press</strong> (500ms) on a state to open the context menu as a bottom sheet</li>
  <li>→ <strong className="text-[var(--color-text)]">Touch drag</strong> to move states — a small movement threshold prevents accidental drags</li>
  <li>→ Tap empty canvas to pan with one finger</li>
  <li>→ <strong className="text-[var(--color-text)]">Pinch</strong> with two fingers to zoom</li>
  <li>→ Two-finger drag to pan and zoom simultaneously</li>
</ul>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Zoom & Pan</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  The canvas uses a <strong className="text-[var(--color-text)]">world coordinate system</strong> with pan and zoom transforms. Screen coordinates are converted to world coordinates via: <code>worldX = (screenX - panX) / zoom</code>. All state positions are stored in world coordinates.
</p>
<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ <strong className="text-[var(--color-text)]">Scroll wheel</strong> to zoom in/out (centered on cursor). Factor: 0.9× / 1.1× per scroll tick.</li>
  <li>→ <strong className="text-[var(--color-text)]">Pinch gesture</strong> on touch devices</li>
  <li>→ Hold <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Space</kbd> + drag to pan (cursor changes to grab/grabbing)</li>
  <li>→ <strong className="text-[var(--color-text)]">Middle-click</strong> drag to pan</li>
  <li>→ Zoom range: <strong className="text-[var(--color-text)]">0.25× to 3×</strong> (25%–300%)</li>
  <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Ctrl+1</kbd> — <strong className="text-[var(--color-text)]">Zoom to fit</strong> all states in view with 80px padding, capped at 2× max</li>
</ul>
<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  The current zoom percentage is displayed in the bottom-right corner of the canvas.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Auto-Layout</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  The <strong className="text-[var(--color-text)]">Auto Layout</strong> button (available in the toolbar and mobile sidebar) arranges all states in a <strong className="text-[var(--color-text)]">circular layout</strong> centered at (400, 300). The circle radius scales with the number of states: <code>max(120, stateCount × 40)</code> pixels. States are evenly distributed starting from the top (−π/2). This is undoable.
</p>
`;

// ============================================================
// SECTION 2: TRANSITIONS
// ============================================================
export const transitionsSection = `
<h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Transitions</h2>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  Transitions are directed edges between states, representing the automaton's transition function. They are rendered as lines or curves with <strong className="text-[var(--color-text)]">arrowhead markers</strong> pointing toward the target state.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Adding Transitions</h3>

<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ Select the <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">T</kbd> tool (transition mode), then <strong className="text-[var(--color-text)]">click and drag</strong> from a source state to a target state</li>
  <li>→ A dashed preview line follows your cursor while dragging</li>
  <li>→ Release on a state to create the transition; release on empty canvas to cancel</li>
  <li>→ Drag from a state <strong className="text-[var(--color-text)]">back to itself</strong> to create a <strong className="text-[var(--color-text)]">self-loop</strong></li>
</ul>
<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  After creating a transition, the tool automatically switches back to the Pointer tool and the <strong className="text-[var(--color-text)]">transition editor</strong> opens for immediate symbol entry.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Self-Loops</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  Self-loops are rendered as <strong className="text-[var(--color-text)]">cubic Bézier arcs</strong> above the state. When multiple self-loops exist on the same state (possible in PDA/TM modes), they <strong className="text-[var(--color-text)]">stack vertically</strong> — each subsequent loop is 18px taller than the previous, with a wider spread. The label sits at the apex of each arc.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Curved Edges</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  When <strong className="text-[var(--color-text)]">bidirectional transitions</strong> exist between two states (A→B and B→A), the edges automatically curve with a <strong className="text-[var(--color-text)]">20px perpendicular offset</strong> to avoid overlapping. The curve is drawn as a quadratic Bézier with the control point offset from the midpoint. Single-direction transitions render as straight lines.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Editing Symbols</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  Open the transition editor by:
</p>
<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ <strong className="text-[var(--color-text)]">Click</strong> on a transition (line or label area) to select it and open the editor</li>
  <li>→ <strong className="text-[var(--color-text)]">Double-click</strong> a transition to open the editor directly</li>
  <li>→ Right-click a transition → <strong className="text-[var(--color-text)]">Edit Label</strong></li>
</ul>
<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  The editor is a small inline input that appears near the transition's label. Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Enter</kbd> to confirm or <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Escape</kbd> to cancel. Clicking away (blur) also commits the edit.
</p>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Symbol Formats by Mode</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  The symbol format depends on the automaton mode. Symbols are entered as <strong className="text-[var(--color-text)]">comma-separated values</strong> in the editor:
</p>

<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ <strong className="text-[var(--color-text)]">DFA / NFA</strong> — simple symbols: <code>a, b</code>. NFA also supports <code>ε</code> (epsilon) for epsilon-transitions. Each symbol is a single input character the automaton reads.</li>
  <li>→ <strong className="text-[var(--color-text)]">PDA</strong> — format: <code>input, pop → push</code>. The <strong className="text-[var(--color-text)]">input</strong> is the symbol read from the tape, <strong className="text-[var(--color-text)]">pop</strong> is the symbol removed from the top of the stack, and <strong className="text-[var(--color-text)]">push</strong> is the symbol(s) pushed onto the stack. Example: <code>a, Z → AZ</code> reads 'a', pops 'Z', pushes 'AZ'.</li>
  <li>→ <strong className="text-[var(--color-text)]">Turing Machine</strong> — format: <code>read → write, direction</code>. The <strong className="text-[var(--color-text)]">read</strong> symbol is matched on the tape, <strong className="text-[var(--color-text)]">write</strong> replaces it, and <strong className="text-[var(--color-text)]">direction</strong> is <code>L</code> (left), <code>R</code> (right), or <code>S</code> (stay). Example: <code>a → b, R</code> reads 'a', writes 'b', moves right.</li>
  <li>→ <strong className="text-[var(--color-text)]">Mealy Machine</strong> — format: <code>input/output</code>. The transition reads the input symbol and produces the output. Example: <code>a/0</code> reads 'a' and outputs '0'.</li>
  <li>→ <strong className="text-[var(--color-text)]">Moore Machine</strong> — transitions use simple input symbols (like DFA). The output is defined in the <strong className="text-[var(--color-text)]">state label</strong> as <code>name/output</code> (e.g., <code>q0/1</code>). Each state produces its output regardless of which transition was taken.</li>
</ul>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Duplicate Transition Handling</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  Behavior when you draw a transition between two states that already have one:
</p>
<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ <strong className="text-[var(--color-text)]">DFA / NFA / Mealy / Moore</strong> — the existing transition's <strong className="text-[var(--color-text)]">editor opens</strong> so you can add more symbols to it. No duplicate edge is created.</li>
  <li>→ <strong className="text-[var(--color-text)]">PDA / Turing Machine</strong> — a <strong className="text-[var(--color-text)]">new separate edge</strong> is created, since these modes naturally support multiple transitions between the same pair of states with different stack/tape operations.</li>
</ul>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Deleting Transitions</h3>

<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ Select a transition and press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Delete</kbd> or <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Backspace</kbd></li>
  <li>→ Right-click a transition → <strong className="text-[var(--color-text)]">Delete</strong></li>
</ul>

<h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Hit Detection & Rendering</h3>

<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  Transitions are selectable by clicking near them. The hit detection works differently for each type:
</p>
<ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
  <li>→ <strong className="text-[var(--color-text)]">Straight/curved edges</strong> — clicks within <strong className="text-[var(--color-text)]">12px</strong> of the nearest point on the line segment select the transition (using perpendicular distance projection)</li>
  <li>→ <strong className="text-[var(--color-text)]">Self-loops</strong> — clicks within a radius of ~35px from the label center (above the state) select the transition</li>
</ul>
<p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
  <strong className="text-[var(--color-text)]">Arrowheads</strong> are rendered as SVG markers (8×6px polygons). Unselected transitions use a dim border color; selected transitions use the accent color with a thicker 2px stroke. The arrow terminates 10px before the target state's edge to leave room for the arrowhead marker.
</p>
`;
