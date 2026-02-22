'use client';

import { Screenshot } from '@/components/docs/Screenshot';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function ModesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider mb-6 text-[var(--color-text-bright)]">Automaton Modes</h1>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
        Switch modes using the toolbar buttons or number keys <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">1</kbd>–<kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">6</kbd> (7 and 8 switch to Grammar Editor and L-Systems).
        Switching modes preserves your states and transitions — the mode only affects how transitions are parsed, how simulation works, and what the properties panel displays. An undo snapshot is pushed when switching modes.
      </p>

      <h2 id="dfa" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">DFA — Deterministic Finite Automaton (Key: 1)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Standard DFA with strict validation. The properties panel shows errors for DFA violations:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
        <li>→ <strong className="text-[var(--color-text)]">Multiple initial states</strong> — DFA requires exactly one</li>
        <li>→ <strong className="text-[var(--color-text)]">ε-transitions</strong> — not allowed in a DFA (shown per offending state)</li>
        <li>→ <strong className="text-[var(--color-text)]">Nondeterministic transitions</strong> — multiple transitions on the same symbol from the same state are flagged (e.g., &quot;q0: multiple on &apos;a&apos;&quot;)</li>
      </ul>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
        Simulation treats DFA the same as NFA internally (using the set-based engine), but a valid DFA will always have exactly one active state at each step.
      </p>

      <h2 id="nfa" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">NFA — Nondeterministic Finite Automaton (Key: 2)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Supports ε-transitions and nondeterminism. During simulation, all reachable configurations are tracked simultaneously:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
        <li>→ Multiple active states may be shown at once (all highlighted on canvas)</li>
        <li>→ Epsilon closures are computed automatically at each step</li>
        <li>→ If any branch reaches an accepting state after consuming all input, the string is accepted</li>
        <li>→ Dead branches (no transitions available) are silently dropped</li>
      </ul>

      <h2 id="pda" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">PDA — Pushdown Automaton (Key: 3)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        PDA mode enables a full nondeterministic pushdown automaton simulator with stack visualization.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-2">
        <li>→ <strong className="text-[var(--color-text)]">Transition format:</strong> <code className="text-[var(--color-accent)]">input, pop → push</code> — parsed using regex matching for the arrow (→ or -&gt;)</li>
        <li>→ <strong className="text-[var(--color-text)]">Stack initialization:</strong> The stack starts with a single symbol <code className="text-[var(--color-accent)]">Z</code> (the initial stack marker)</li>
        <li>→ <strong className="text-[var(--color-text)]">Push convention:</strong> When pushing <code className="text-[var(--color-accent)]">AZ</code>, the leftmost character (A) becomes the new top of stack. Characters are pushed in reverse order internally.</li>
        <li>→ <strong className="text-[var(--color-text)]">ε handling:</strong> Use ε for input (no symbol consumed), pop (no symbol popped), or push (nothing pushed)</li>
        <li>→ <strong className="text-[var(--color-text)]">Nondeterminism:</strong> All branches are explored simultaneously. Each configuration tracks its own state, input position, and stack independently.</li>
        <li>→ <strong className="text-[var(--color-text)]">Acceptance modes:</strong> {"Toggle between \"Final State\" (accepts when input consumed and in accepting state) and \"Empty Stack\" (accepts when input consumed and stack is empty) via buttons in the panel header"}</li>
        <li>→ <strong className="text-[var(--color-text)]">Stack visualization:</strong> A dedicated column on the right shows the stack of the first active configuration, with the top of stack highlighted in yellow</li>
        <li>→ <strong className="text-[var(--color-text)]">Configuration display:</strong> {"Each active config shows state label, input position, and stack contents (e.g., \"q1 pos:2 [AZZ]\")"}</li>
        <li>→ <strong className="text-[var(--color-text)]">Safety limit:</strong> Maximum 10,000 total configurations to prevent infinite loops from ε-cycles</li>
        <li>→ <strong className="text-[var(--color-text)]">Fast Run:</strong> Runs up to 500 steps automatically</li>
      </ul>

      <h2 id="tm" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">TM — Turing Machine (Key: 4)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        A single-tape, single-head Turing machine with configurable step limit.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-2">
        <li>→ <strong className="text-[var(--color-text)]">Transition format:</strong> <code className="text-[var(--color-accent)]">read → write, direction</code> — direction is R (right), L (left), or S (stay). Also accepts <code className="text-[var(--color-accent)]">read/write,dir</code> format.</li>
        <li>→ <strong className="text-[var(--color-text)]">Wildcard:</strong> Use <code className="text-[var(--color-accent)]">*</code> as the read symbol to match any symbol; use <code className="text-[var(--color-accent)]">*</code> as the write symbol to keep the current symbol unchanged</li>
        <li>→ <strong className="text-[var(--color-text)]">Tape model:</strong> Infinite in both directions, implemented as a sparse Map from integer positions to symbols. The blank symbol is ⊔ (displayed in tape cells where no symbol has been written).</li>
        <li>→ <strong className="text-[var(--color-text)]">Tape visualization:</strong> Shows a window around the head position (±10 cells plus any written cells). The head position is marked with a ▼ indicator above the current cell, which is highlighted in accent color.</li>
        <li>→ <strong className="text-[var(--color-text)]">Step limit:</strong> Configurable in the header (default 1000). Prevents infinite loops. Editable via a number input.</li>
        <li>→ <strong className="text-[var(--color-text)]">History log:</strong> {"Every step is recorded with the action taken (e.g., \"Read 'a', write 'b', move R → q2\"). Shows step number, current state, head position, and step count."}</li>
        <li>→ <strong className="text-[var(--color-text)]">Three outcomes:</strong> ACCEPTED (halts in accepting state), REJECTED (no applicable transition and not in accepting state), HALTED (step limit reached while still running)</li>
      </ul>

      <h2 id="mealy" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Mealy Machine (Key: 5)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        A transducer where output is associated with transitions.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-2">
        <li>→ <strong className="text-[var(--color-text)]">Transition format:</strong> <code className="text-[var(--color-accent)]">input/output</code> — e.g., <code className="text-[var(--color-accent)]">a/1</code> means &quot;on input a, produce output 1&quot;</li>
        <li>→ <strong className="text-[var(--color-text)]">Simulation:</strong> For each input symbol, the machine finds a matching transition, moves to the next state, and appends the transition&apos;s output to the output string</li>
        <li>→ <strong className="text-[var(--color-text)]">Step table:</strong> Shows columns: #, State, Input, Output, Next — each row is one input symbol consumed</li>
        <li>→ <strong className="text-[var(--color-text)]">Output display:</strong> The accumulated output string is shown prominently with the label &quot;OUTPUT&quot;</li>
        <li>→ <strong className="text-[var(--color-text)]">Step-through:</strong> Click Step repeatedly to see one transition at a time, or Fast Run to see all at once</li>
        <li>→ <strong className="text-[var(--color-text)]">Error:</strong> If no matching transition is found for the current input symbol, the machine reports ERROR</li>
      </ul>

      <h2 id="moore" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Moore Machine (Key: 6)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        A transducer where output is associated with states rather than transitions.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-2">
        <li>→ <strong className="text-[var(--color-text)]">State label format:</strong> <code className="text-[var(--color-accent)]">name/output</code> — e.g., <code className="text-[var(--color-accent)]">q0/0</code> means state q0 outputs &quot;0&quot;. The output is extracted by splitting on the last <code className="text-[var(--color-accent)]">/</code>.</li>
        <li>→ <strong className="text-[var(--color-text)]">Transition format:</strong> Plain input symbols (same as DFA/NFA) — e.g., <code className="text-[var(--color-accent)]">a, b</code></li>
        <li>→ <strong className="text-[var(--color-text)]">Initial output:</strong> The output begins with the initial state&apos;s output (before consuming any input)</li>
        <li>→ <strong className="text-[var(--color-text)]">Simulation:</strong> For each input symbol, move to the next state and append that state&apos;s output. Output string = initial output + output from each destination state.</li>
        <li>→ <strong className="text-[var(--color-text)]">Step table:</strong> Shows columns: #, State, Input, Output (of destination state), Next</li>
      </ul>

      <Screenshot id="automaton-modes" description="PDA simulation — stack visualization, active configs, input tape stepping" src="/docs/pda-sim.png" />

      <DocsPrevNext />
    </>
  );
}
