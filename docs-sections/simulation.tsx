export default function SimulationSection() {
  return (
    <>
      <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">
        Simulation
      </h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        StateForge includes a built-in simulation engine that executes your automaton against input strings. It supports both <strong className="text-[var(--color-text)]">DFA</strong> and <strong className="text-[var(--color-text)]">NFA</strong> simulation with full nondeterminism, epsilon-closure computation, and visual feedback on the canvas. You can step through inputs one symbol at a time or batch-test dozens of strings instantly.
      </p>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Opening the Simulation Panel
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Toggle the simulation panel with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Ctrl</kbd> + <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">.</kbd> or click the simulation button in the toolbar. The panel appears at the bottom of the screen with two modes: <strong className="text-[var(--color-text)]">Single</strong> and <strong className="text-[var(--color-text)]">Multi</strong>, selectable via tabs in the panel header.
      </p>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Single Mode
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Single mode lets you simulate one input string with full step-by-step control. The panel is split into two regions: the left side holds the input field, control buttons, and tape visualization; the right side displays active states, consumed/remaining symbols, and the result verdict.
      </p>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Input Field
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Type the string you want to test into the <strong className="text-[var(--color-text)]">INPUT</strong> field. Each character becomes a symbol on the input tape. Leave it empty to test the empty string (ε). The input field is <strong className="text-[var(--color-text)]">disabled during stepping</strong> — you cannot change the input mid-simulation. Reset first if you need to modify it.
      </p>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Control Buttons
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Four buttons control the simulation, grouped in a compact button bar:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">Start ▶</strong> — Initializes the simulation. Finds the initial state, computes epsilon closure (for NFA), and enters the <strong className="text-[var(--color-text)]">STEPPING</strong> status. Pressing <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Enter</kbd> in the input field does the same thing when idle. If no initial state exists, the simulation immediately moves to REJECTED. Shortcut: <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘↵</kbd></li>
        <li>→ <strong className="text-[var(--color-text)]">Step ⏭</strong> — Consumes the next symbol from the input tape and advances the automaton. For DFA, this follows the single matching transition. For NFA, it computes the set of all reachable states (including epsilon closure) simultaneously. When no input remains, Step finalizes the simulation — checking if any active state is accepting. Shortcut: <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘&apos;</kbd>. Pressing <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Enter</kbd> during stepping also triggers Step.</li>
        <li>→ <strong className="text-[var(--color-text)]">Fast Run ⏩</strong> — Runs the entire simulation to completion instantly without stepping. The result (ACCEPTED or REJECTED) appears immediately. Useful when you just want the verdict. Shortcut: <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⇧⌘↵</kbd></li>
        <li>→ <strong className="text-[var(--color-text)]">Reset ↻</strong> — Clears all simulation state: status returns to IDLE, active states are cleared, the tape is removed. The input field becomes editable again. Shortcut: <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘0</kbd></li>
      </ul>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Input Tape Visualization
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Once simulation starts, the input string is rendered as a horizontal tape of cells. Each cell holds one symbol. <strong className="text-[var(--color-text)]">Consumed symbols</strong> appear dimmed with a sunken background — these have already been processed. <strong className="text-[var(--color-text)]">Remaining symbols</strong> appear with a normal background. The <strong className="text-[var(--color-text)]">current symbol</strong> (next to be consumed) is highlighted with the simulation accent color and bold text. If the input is empty, the tape shows <strong className="text-[var(--color-text)]">ε (empty string)</strong>.
      </p>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Active States &amp; Canvas Highlighting
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        During stepping, the right side of the panel displays <strong className="text-[var(--color-text)]">active state chips</strong> — small labeled badges showing which states the automaton is currently in. For DFA this is always one state; for NFA there can be multiple. On the canvas itself, active states are highlighted with a glow effect, making it easy to visually follow the simulation.
      </p>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        The store tracks active states via <strong className="text-[var(--color-text)]">simCurrentStates</strong> (a Set of state IDs) and the overall phase via <strong className="text-[var(--color-text)]">simStatus</strong>. The canvas renderer reads these values to apply highlighting — any state whose ID is in simCurrentStates receives the simulation glow while simStatus is &quot;stepping&quot;.
      </p>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Simulation Status Lifecycle
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        The simulation moves through a simple state machine:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">IDLE</strong> — No simulation running. Input is editable. The panel shows automaton metadata (mode, state count, alphabet) and any warnings.</li>
        <li>→ <strong className="text-[var(--color-text)]">STEPPING</strong> — Simulation is in progress. The tape is visible, active states are highlighted. Each Step press consumes one symbol.</li>
        <li>→ <strong className="text-[var(--color-text)]">ACCEPTED</strong> — All input consumed and at least one active state is an accepting state. A green result banner appears with ✓.</li>
        <li>→ <strong className="text-[var(--color-text)]">REJECTED</strong> — Either no transitions were available (dead state), no initial state exists, or all input was consumed but no active state is accepting. A red result banner appears with ✗.</li>
      </ul>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Result Banner
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        When simulation completes, a verdict banner appears at the bottom of the state info panel. It reads either <strong className="text-[var(--color-text)]">✓ String &quot;abc&quot; is accepted by the DFA</strong> (green) or <strong className="text-[var(--color-text)]">✗ String &quot;abc&quot; is rejected by the NFA</strong> (red), including the automaton mode. For empty input, the string is displayed as ε.
      </p>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Idle State Warnings
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        When idle, the panel inspects your automaton and surfaces problems that would cause simulation to fail:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">⚠ No initial state</strong> — Shown in red when no state is marked as initial. Right-click a state to set one. Without an initial state, simulation immediately rejects.</li>
        <li>→ <strong className="text-[var(--color-text)]">⚠ No accepting states defined</strong> — Shown in amber when the automaton has an initial state but no accepting states. Every string will be rejected since there&apos;s nothing to accept.</li>
      </ul>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        DFA vs NFA Simulation
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        The simulation engine uses the same core algorithm for both DFA and NFA, but behavior differs:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">DFA</strong> — At any point, the active state set contains exactly one state (determinism). Epsilon transitions are not expected. Each symbol follows a single transition.</li>
        <li>→ <strong className="text-[var(--color-text)]">NFA</strong> — Multiple states can be active simultaneously. On start, the engine computes the <strong className="text-[var(--color-text)]">epsilon closure</strong> of the initial state to find all states reachable via ε-transitions. On each step, it computes the union of all reachable states from every active state for the current symbol, then applies epsilon closure again. The string is accepted if <strong className="text-[var(--color-text)]">any</strong> state in the final active set is accepting.</li>
        <li>→ If the active state set ever becomes empty (no valid transitions), the simulation immediately rejects — the automaton is &quot;stuck&quot; in a dead configuration.</li>
      </ul>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        How the Algorithm Works
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        The simulation is powered by three core functions:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">epsilonClosure(stateIds, transitions)</strong> — Given a set of state IDs, expands it by following all ε-transitions reachable via a stack-based traversal. Returns the full closure set. This is called on simulation start (NFA mode) and after every step.</li>
        <li>→ <strong className="text-[var(--color-text)]">stepNFA(currentStates, symbol, transitions)</strong> — For each active state, finds all transitions matching the given symbol and collects the target states. Then applies epsilonClosure to the result. Returns the new active state set.</li>
        <li>→ <strong className="text-[var(--color-text)]">runAutomaton(states, transitions, input, mode)</strong> — Runs the full simulation in one pass. Initializes from the initial state (with epsilon closure for NFA), iterates through each character calling stepNFA, and checks if any final state is accepting. Used by Fast Run and Multi-run.</li>
      </ul>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Multi-Run Mode
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Switch to Multi-run by clicking the <strong className="text-[var(--color-text)]">Multi</strong> tab in the panel header. This mode lets you batch-test multiple strings against your automaton at once.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">Test Strings textarea</strong> — Enter one string per line. An empty line tests the empty string (ε). The placeholder shows example inputs for guidance.</li>
        <li>→ <strong className="text-[var(--color-text)]">RUN ALL button</strong> — Executes the full simulation for every line using runAutomaton. Results appear instantly.</li>
        <li>→ <strong className="text-[var(--color-text)]">Results list</strong> — Each string is displayed with a <strong className="text-[var(--color-text)]">✓</strong> (green, ACCEPT) or <strong className="text-[var(--color-text)]">✗</strong> (red, REJECT) verdict. A summary line at the top shows the pass count, e.g. &quot;3/5 pass&quot;.</li>
      </ul>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Practical Uses
      </h3>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Multi-run is ideal for <strong className="text-[var(--color-text)]">verification and testing</strong>. After constructing an automaton, prepare a list of strings that should be accepted and rejected, then run them all at once. This serves as a quick regression test — if you modify the automaton, re-run the batch to verify nothing broke. Single-mode stepping is best for <strong className="text-[var(--color-text)]">learning and debugging</strong> — watching the automaton process each symbol helps build intuition about state transitions and nondeterminism.
      </p>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">
        Keyboard Shortcuts Summary
      </h3>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Ctrl+.</kbd> — Toggle simulation panel</li>
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘↵</kbd> — Start simulation</li>
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘&apos;</kbd> — Step forward</li>
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⇧⌘↵</kbd> — Fast run to completion</li>
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘0</kbd> — Reset simulation</li>
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Enter</kbd> — Start (when idle) or Step (when stepping)</li>
      </ul>
    </>
  );
}
