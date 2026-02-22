# Automaton modes

Switch modes using the toolbar buttons or number keys <kbd>1</kbd>–<kbd>6</kbd> (7 and 8 switch to Grammar Editor and L-Systems).
Switching modes preserves your states and transitions — the mode only affects how transitions are parsed, how simulation works, and what the properties panel displays. An undo snapshot is pushed when switching modes.

## DFA — Deterministic Finite Automaton (Key: 1)

Standard DFA with strict validation. The properties panel shows errors for DFA violations:

→ **Multiple initial states** — DFA requires exactly one

→ **ε-transitions** — not allowed in a DFA (shown per offending state)

→ **Nondeterministic transitions** — multiple transitions on the same symbol from the same state are flagged (e.g., "q0: multiple on 'a'")

Simulation treats DFA the same as NFA internally (using the set-based engine), but a valid DFA will always have exactly one active state at each step.

## NFA — Nondeterministic Finite Automaton (Key: 2)

Supports ε-transitions and nondeterminism. During simulation, all reachable configurations are tracked simultaneously:

→ Multiple active states may be shown at once (all highlighted on canvas)

→ Epsilon closures are computed automatically at each step

→ If any branch reaches an accepting state after consuming all input, the string is accepted

→ Dead branches (no transitions available) are silently dropped

## PDA — Pushdown Automaton (Key: 3)

PDA mode enables a full nondeterministic pushdown automaton simulator with stack visualization.

→ **Transition format:** `input, pop → push` — parsed using regex matching for the arrow (→ or ->)

→ **Stack initialization:** The stack starts with a single symbol `Z` (the initial stack marker)

→ **Push convention:** When pushing `AZ`, the leftmost character (A) becomes the new top of stack. Characters are pushed in reverse order internally.

→ **ε handling:** Use ε for input (no symbol consumed), pop (no symbol popped), or push (nothing pushed)

→ **Nondeterminism:** All branches are explored simultaneously. Each configuration tracks its own state, input position, and stack independently.

→ **Acceptance modes:** Toggle between "Final State" (accepts when input consumed and in accepting state) and "Empty Stack" (accepts when input consumed and stack is empty) via buttons in the panel header

→ **Stack visualization:** A dedicated column on the right shows the stack of the first active configuration, with the top of stack highlighted in yellow

→ **Configuration display:** Each active config shows state label, input position, and stack contents (e.g., "q1 pos:2 [AZZ]")

→ **Safety limit:** Maximum 10,000 total configurations to prevent infinite loops from ε-cycles

→ **Fast Run:** Runs up to 500 steps automatically

## TM — Turing Machine (Key: 4)


![Turing Machine simulation — tape visualization with head position](/docs/tm-sim.png)

A single-tape, single-head Turing machine with configurable step limit.

→ **Transition format:** `read → write, direction` — direction is R (right), L (left), or S (stay). Also accepts `read/write,dir` format.

→ **Wildcard:** Use `*` as the read symbol to match any symbol; use `*` as the write symbol to keep the current symbol unchanged

→ **Tape model:** Infinite in both directions, implemented as a sparse Map from integer positions to symbols. The blank symbol is ⊔ (displayed in tape cells where no symbol has been written).

→ **Tape visualization:** Shows a window around the head position (±10 cells plus any written cells). The head position is marked with a ▼ indicator above the current cell, which is highlighted in accent color.

→ **Step limit:** Configurable in the header (default 1000). Prevents infinite loops. Editable via a number input.

→ **History log:** Every step is recorded with the action taken (e.g., "Read 'a', write 'b', move R → q2"). Shows step number, current state, head position, and step count.

→ **Three outcomes:** ACCEPTED (halts in accepting state), REJECTED (no applicable transition and not in accepting state), HALTED (step limit reached while still running)

## Mealy Machine (Key: 5)


![Mealy machine simulation — input/output transducer](/docs/mealy-sim.png)

A transducer where output is associated with transitions.

→ **Transition format:** `input/output` — e.g., `a/1` means "on input a, produce output 1"

→ **Simulation:** For each input symbol, the machine finds a matching transition, moves to the next state, and appends the transition's output to the output string

→ **Step table:** Shows columns: #, State, Input, Output, Next — each row is one input symbol consumed

→ **Output display:** The accumulated output string is shown prominently with the label "OUTPUT"

→ **Step-through:** Click Step repeatedly to see one transition at a time, or Fast Run to see all at once

→ **Error:** If no matching transition is found for the current input symbol, the machine reports ERROR

## Moore Machine (Key: 6)

A transducer where output is associated with states rather than transitions.

→ **State label format:** `name/output` — e.g., `q0/0` means state q0 outputs "0". The output is extracted by splitting on the last `/`.

→ **Transition format:** Plain input symbols (same as DFA/NFA) — e.g., `a, b`

→ **Initial output:** The output begins with the initial state's output (before consuming any input)

→ **Simulation:** For each input symbol, move to the next state and append that state's output. Output string = initial output + output from each destination state.

→ **Step table:** Shows columns: #, State, Input, Output (of destination state), Next

![PDA simulation — stack visualization, active configs, input tape stepping](/docs/pda-sim.png)
