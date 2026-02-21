export default function AutomatonModesSection() {
  return (
    <section id="automaton-modes" className="mb-16">
      <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Automaton Modes</h2>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        StateForge supports six automaton types, each with its own simulation engine, transition
        format, and visualization. Your states and transitions are preserved when switching between
        modes — only the interpretation changes.
      </p>

      {/* ── Mode Switching ── */}
      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Switching Modes</h3>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        There are three ways to change the active automaton type:
      </p>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">Number keys</strong>{' '}
          <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">1</kbd>–<kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">6</kbd>{' '}
          — the fastest way. <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">1</kbd> = DFA,{' '}
          <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">2</kbd> = NFA,{' '}
          <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">3</kbd> = PDA,{' '}
          <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">4</kbd> = TM,{' '}
          <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">5</kbd> = Mealy,{' '}
          <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">6</kbd> = Moore
        </li>
        <li>→ <strong className="text-[var(--color-text)]">Toolbar tabs</strong> — click the mode name in the top toolbar (desktop)</li>
        <li>→ <strong className="text-[var(--color-text)]">Mode dropdown</strong> — on mobile, tap the current mode label to open a dropdown selector</li>
      </ul>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Mode switches are undoable with{' '}
        <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘Z</kbd>.
        The default transition symbol changes per mode — for example, new transitions in DFA mode
        default to <code className="text-[var(--color-accent)]">a</code>, while PDA defaults to{' '}
        <code className="text-[var(--color-accent)]">a, Z → Z</code>.
      </p>

      {/* ── DFA ── */}
      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">DFA — Deterministic Finite Automaton</h3>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        The most constrained mode. A DFA has exactly one active state at any time, and for each
        state–symbol pair there must be at most one outgoing transition. The properties panel
        validates these constraints and warns about violations: multiple initial states,
        ε-transitions, or nondeterministic transitions (two edges from the same state on the
        same symbol).
      </p>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">One active state</strong> — simulation highlights exactly one state at each step</li>
        <li>→ <strong className="text-[var(--color-text)]">Unique symbols per state</strong> — each outgoing transition from a state must use a different input symbol</li>
        <li>→ <strong className="text-[var(--color-text)]">Trap state auto-generation</strong> — use the{' '}
          <strong className="text-[var(--color-text)]">Add Trap State</strong> action (context menu or properties panel)
          to automatically create a non-accepting trap state. StateForge scans the alphabet (all symbols
          used in existing transitions), finds every state–symbol pair that lacks a transition, and wires
          them to the trap state. The trap state gets a self-loop on every symbol, making the DFA complete.
        </li>
      </ul>

      {/* ── NFA ── */}
      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">NFA — Nondeterministic Finite Automaton</h3>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Relaxes the DFA constraints. Multiple states can be active simultaneously, and
        ε-transitions (spontaneous moves that consume no input) are allowed.
      </p>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">Multiple active states</strong> — the simulator tracks every reachable state in parallel, highlighting all of them on the canvas</li>
        <li>→ <strong className="text-[var(--color-text)]">ε-transitions</strong> — add a transition with the symbol{' '}
          <code className="text-[var(--color-accent)]">ε</code> to allow spontaneous state changes without consuming input
        </li>
        <li>→ <strong className="text-[var(--color-text)]">Epsilon closure</strong> — before reading the first symbol and after every step, the simulator computes the full epsilon closure (all states reachable by following ε-transitions)</li>
        <li>→ <strong className="text-[var(--color-text)]">Subset tracking</strong> — internally, the set of active states is the &quot;subset&quot; familiar from the subset construction algorithm. The string is accepted if <em>any</em> state in the final subset is an accepting state</li>
      </ul>

      {/* ── PDA ── */}
      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">PDA — Pushdown Automaton</h3>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Extends the NFA with a stack, enabling recognition of context-free languages. The PDA
        simulator is fully nondeterministic — it tracks every possible configuration (state +
        input position + stack contents) in parallel.
      </p>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">PDA — Transition Format</h3>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Each PDA transition label has the format{' '}
        <code className="text-[var(--color-accent)]">input, pop → push</code>:
      </p>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <code className="text-[var(--color-accent)]">a, Z → AZ</code> — read{' '}
          <code className="text-[var(--color-accent)]">a</code> from input, pop{' '}
          <code className="text-[var(--color-accent)]">Z</code> from the stack, push{' '}
          <code className="text-[var(--color-accent)]">AZ</code> (leftmost character = new top of stack, so{' '}
          <code className="text-[var(--color-accent)]">A</code> ends up on top)
        </li>
        <li>→ <code className="text-[var(--color-accent)]">ε, ε → S</code> — spontaneous transition: consume no input, pop nothing, push{' '}
          <code className="text-[var(--color-accent)]">S</code>
        </li>
        <li>→ <code className="text-[var(--color-accent)]">a, A → ε</code> — read{' '}
          <code className="text-[var(--color-accent)]">a</code>, pop{' '}
          <code className="text-[var(--color-accent)]">A</code>, push nothing (net pop)
        </li>
        <li>→ Use <code className="text-[var(--color-accent)]">ε</code> as the input symbol for spontaneous (non-consuming) transitions</li>
        <li>→ Use <code className="text-[var(--color-accent)]">ε</code> as pop or push to skip that operation</li>
      </ul>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        The initial stack contains a single symbol{' '}
        <code className="text-[var(--color-accent)]">Z</code> (the bottom-of-stack marker).
      </p>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">PDA — Acceptance Modes</h3>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        The simulation header provides a toggle between two acceptance criteria:
      </p>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">Final State</strong> — the string is accepted if any configuration has consumed all input and reached an accepting state (double-circle)</li>
        <li>→ <strong className="text-[var(--color-text)]">Empty Stack</strong> — the string is accepted if any configuration has consumed all input and the stack is empty (regardless of whether the state is accepting)</li>
      </ul>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">PDA — Simulation & Visualization</h3>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">Active configurations</strong> — each configuration is a tuple of (state, input position, stack contents). The panel lists all active configs with the state name, position counter, and stack displayed as a symbol string (e.g., <code className="text-[var(--color-accent)]">[AZZ]</code>)</li>
        <li>→ <strong className="text-[var(--color-text)]">Stack visualization</strong> — a dedicated column on the right side of the panel renders the stack of the first active configuration as a vertical cell display. The top of stack is highlighted with an accent background</li>
        <li>→ <strong className="text-[var(--color-text)]">Nondeterministic branching</strong> — when multiple transitions apply, the simulator forks into separate configurations and tracks them all. Each config shows its independent stack</li>
        <li>→ <strong className="text-[var(--color-text)]">Config explosion limit</strong> — to prevent runaway computation (e.g., infinite ε-loops), the simulator caps the total number of configurations at <strong className="text-[var(--color-text)]">10,000</strong>. If this limit is reached, simulation halts automatically</li>
        <li>→ <strong className="text-[var(--color-text)]">Fast run</strong> — runs up to 500 steps in one click, or until all configs are dead/accepted</li>
      </ul>

      {/* ── TM ── */}
      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">TM — Turing Machine</h3>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        A single-tape Turing machine with an infinite tape extending in both directions. The tape
        is initialized with the input string starting at position 0, and all other cells contain
        the blank symbol <code className="text-[var(--color-accent)]">⊔</code>.
      </p>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">TM — Transition Format</h3>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Each TM transition label has the format{' '}
        <code className="text-[var(--color-accent)]">read → write, direction</code>:
      </p>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <code className="text-[var(--color-accent)]">a → b, R</code> — if the head reads{' '}
          <code className="text-[var(--color-accent)]">a</code>, write{' '}
          <code className="text-[var(--color-accent)]">b</code> and move the head right
        </li>
        <li>→ Direction must be <code className="text-[var(--color-accent)]">R</code> (right),{' '}
          <code className="text-[var(--color-accent)]">L</code> (left), or{' '}
          <code className="text-[var(--color-accent)]">S</code> (stay)
        </li>
        <li>→ Use <code className="text-[var(--color-accent)]">*</code> as a wildcard — as the read symbol it matches any character, as the write symbol it preserves the current cell</li>
      </ul>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">TM — Tape Visualization</h3>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ The tape is rendered as a horizontal row of cells, padded with blank symbols around the active region</li>
        <li>→ The <strong className="text-[var(--color-text)]">head position</strong> is marked with a{' '}
          <code className="text-[var(--color-accent)]">▼</code> indicator above the current cell, and the cell itself is highlighted with the accent color
        </li>
        <li>→ As the head moves, the visible window scrolls to keep it centered</li>
      </ul>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">TM — Execution & Status</h3>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">Step limit</strong> — configurable in the panel header (default: <strong className="text-[var(--color-text)]">1000</strong>). Prevents infinite loops by halting after the limit is reached</li>
        <li>→ <strong className="text-[var(--color-text)]">RUNNING</strong> — the machine is still executing</li>
        <li>→ <strong className="text-[var(--color-text)]">ACCEPTED</strong> — the machine has entered an accepting state (double-circle)</li>
        <li>→ <strong className="text-[var(--color-text)]">REJECTED</strong> — no applicable transition exists from the current state for the symbol under the head</li>
        <li>→ <strong className="text-[var(--color-text)]">HALTED</strong> — the step limit was reached while the machine was still running</li>
        <li>→ <strong className="text-[var(--color-text)]">History log</strong> — every step is recorded with a description like{' '}
          <code className="text-[var(--color-accent)]">Read &apos;a&apos;, write &apos;b&apos;, move R → q2</code>. The most recent entry is highlighted in the accent color
        </li>
        <li>→ The info panel shows the current <strong className="text-[var(--color-text)]">STATE</strong>,{' '}
          <strong className="text-[var(--color-text)]">HEAD</strong> position (integer), and{' '}
          <strong className="text-[var(--color-text)]">STEP</strong> count at a glance
        </li>
      </ul>

      {/* ── Mealy ── */}
      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Mealy Machine — Output on Transitions</h3>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        A Mealy machine is a <strong className="text-[var(--color-text)]">transducer</strong> — it doesn&apos;t
        accept or reject, but produces an output string. In a Mealy machine, output is associated
        with <em>transitions</em>, not states.
      </p>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">Transition format:</strong>{' '}
          <code className="text-[var(--color-accent)]">input/output</code> — e.g.,{' '}
          <code className="text-[var(--color-accent)]">a/1</code> means &quot;on input{' '}
          <code className="text-[var(--color-accent)]">a</code>, produce output{' '}
          <code className="text-[var(--color-accent)]">1</code>&quot;
        </li>
        <li>→ <strong className="text-[var(--color-text)]">Output string</strong> — built by concatenating the output from each transition taken. Displayed prominently in the simulation panel</li>
        <li>→ <strong className="text-[var(--color-text)]">Step-through</strong> — use the Step button to advance one input symbol at a time and watch the output accumulate character by character</li>
        <li>→ <strong className="text-[var(--color-text)]">Step table</strong> — the right side of the panel shows a table with columns for step number, current state, input symbol, output produced, and next state</li>
        <li>→ The simulation completes with status <strong className="text-[var(--color-text)]">COMPLETE</strong> when all input is consumed, or <strong className="text-[var(--color-text)]">ERROR</strong> if no matching transition is found</li>
      </ul>

      {/* ── Moore ── */}
      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Moore Machine — Output on States</h3>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Like a Mealy machine, a Moore machine is a transducer — but it associates output with
        <em> states</em> rather than transitions. Each state produces a fixed output character
        whenever it is the current state.
      </p>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">State label format:</strong>{' '}
          <code className="text-[var(--color-accent)]">name/output</code> — e.g.,{' '}
          <code className="text-[var(--color-accent)]">q0/0</code> means state{' '}
          <code className="text-[var(--color-accent)]">q0</code> outputs{' '}
          <code className="text-[var(--color-accent)]">0</code>
        </li>
        <li>→ <strong className="text-[var(--color-text)]">Transition labels</strong> — just the input symbol (no output on edges), e.g.,{' '}
          <code className="text-[var(--color-accent)]">a</code>
        </li>
        <li>→ <strong className="text-[var(--color-text)]">Output string</strong> — starts with the initial state&apos;s output, then appends the output of each state entered. For input of length <em>n</em>, the output has length <em>n + 1</em> (one for the start state, one per transition)</li>
        <li>→ <strong className="text-[var(--color-text)]">Step table</strong> — same layout as Mealy, but the &quot;Output&quot; column shows the <em>destination state&apos;s</em> output rather than a transition output</li>
      </ul>

      <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Mealy vs Moore — Comparison</h3>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Mealy and Moore machines are equivalent in computational power — any Mealy machine can be
        converted to a Moore machine and vice versa — but they differ in where output is generated:
      </p>

      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">Mealy</strong> — output depends on both the current state <em>and</em> the input symbol (output on transitions). Typically produces output of the same length as input</li>
        <li>→ <strong className="text-[var(--color-text)]">Moore</strong> — output depends only on the current state (output on states). Produces output one character longer than input (includes initial state output)</li>
        <li>→ Mealy machines often need <strong className="text-[var(--color-text)]">fewer states</strong> than equivalent Moore machines, since a single Mealy state with different output per edge may require multiple Moore states</li>
        <li>→ Both share the same simulation UI: input field, step/fast-run/reset controls, output display, and step table</li>
      </ul>
    </section>
  );
}
