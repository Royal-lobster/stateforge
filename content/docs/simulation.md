# Simulation

The simulation panel sits at the bottom of the screen. Toggle it with <kbd>⌘.</kbd>. It has two tabs: **Single** (step-through one string) and **Multi** (batch test multiple strings).
The panel is 192px tall on desktop and adapts to a compact mobile layout.

## Single mode: controls

Type an input string in the input field and use these controls:

| Shortcut | Action |
|----------|--------|
| <kbd>⌘ Enter</kbd> | Start simulation: compute epsilon closure of initial state and enter stepping mode |
| <kbd>⌘ '</kbd> | Step: consume one input symbol, compute next states via transition function + epsilon closure |
| <kbd>⇧⌘ Enter</kbd> | Fast Run: instantly compute final accept/reject result without stepping |
| <kbd>⌘0</kbd> | Reset: clear simulation state, return to idle |

## Single mode: visual feedback

→ The **input tape** visualization shows each character in a cell: consumed symbols are dimmed (sunken background), the current symbol is highlighted in yellow, and remaining symbols have a normal background

→ An empty input string shows "ε (empty string)" as a hint

→ **Active states** on the canvas are highlighted with a yellow border and a semi-transparent yellow fill during stepping

→ The active state labels are shown as pills in the right panel (e.g., "q0, q1, q3" for NFA)

→ The **status indicator** shows: IDLE (gray), STEPPING (yellow), ACCEPTED (green), or REJECTED (red)

→ Final result shows a colored banner: "✓ String accepted by the DFA" (green) or "✗ String rejected" (red)

→ If no initial state is set, simulation immediately rejects with a "NO INITIAL STATE" warning

→ The idle state shows useful info: mode, state count, alphabet set, and warnings for missing initial or accepting states

## NFA simulation algorithm

For NFA mode (and generally for DFA too, since the same engine handles both), simulation uses a set-based approach:

1. **Start:** Compute the epsilon closure of the initial state. This is the initial set of active states.
2. **Step:** For the current input symbol, compute the set of states reachable from any active state via that symbol, then take the epsilon closure of the result.
3. **Accept:** After all input is consumed, if any active state is accepting, the string is accepted.
4. **Reject:** If the active state set ever becomes empty (no valid transitions), the string is immediately rejected.

The epsilon closure is computed using a stack-based DFS: start with the given states, and for each state, follow all ε-transitions and add newly discovered states to the closure.

## Multi-run (batch testing)

Switch to the "Multi" tab to test multiple strings at once. Enter one string per line in the textarea (an empty line represents ε), then click **RUN ALL**. Each string is run through the full automaton simulation independently.

→ Results show ✓ ACCEPT (green) or ✗ REJECT (red) for each string

→ A summary shows pass count: e.g., "3/5 pass"

→ The textarea placeholder suggests the format: one string per line

→ On mobile, the multi-run view has a max height of 45vh to prevent it from covering the canvas

![Simulation — string accepted with input tape consumed](/docs/sim-accepted.png)

![Simulation — string rejected](/docs/sim-rejected.png)

![Multi-run — batch test multiple strings at once](/docs/multi-run.png)
