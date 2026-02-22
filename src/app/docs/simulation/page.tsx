'use client';

import { Screenshot } from '@/components/docs/Screenshot';
import { KbdTable } from '@/components/docs/KbdTable';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function SimulationPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider mb-6 text-[var(--color-text-bright)]">Simulation</h1>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
        The simulation panel sits at the bottom of the screen. Toggle it with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘.</kbd>. It has two tabs: <strong className="text-[var(--color-text)]">Single</strong> (step-through one string) and <strong className="text-[var(--color-text)]">Multi</strong> (batch test multiple strings).
        The panel is 192px tall on desktop and adapts to a compact mobile layout.
      </p>

      <h2 id="single-controls" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Single Mode — Controls</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Type an input string in the input field and use these controls:
      </p>
      <KbdTable rows={[
        ['⌘ Enter', 'Start simulation — compute epsilon closure of initial state and enter stepping mode'],
        ['⌘ \'', 'Step — consume one input symbol, compute next states via transition function + epsilon closure'],
        ['⇧⌘ Enter', 'Fast Run — instantly compute final accept/reject result without stepping'],
        ['⌘ 0', 'Reset — clear simulation state, return to idle'],
      ]} />

      <h2 id="visual-feedback" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Single Mode — Visual Feedback</h2>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ The <strong className="text-[var(--color-text)]">input tape</strong> visualization shows each character in a cell: consumed symbols are dimmed (sunken background), the current symbol is highlighted in yellow, and remaining symbols have a normal background</li>
        <li>→ An empty input string shows &quot;ε (empty string)&quot; as a hint</li>
        <li>→ <strong className="text-[var(--color-text)]">Active states</strong> on the canvas are highlighted with a yellow border and a semi-transparent yellow fill during stepping</li>
        <li>→ The active state labels are shown as pills in the right panel (e.g., &quot;q0, q1, q3&quot; for NFA)</li>
        <li>→ The <strong className="text-[var(--color-text)]">status indicator</strong> shows: IDLE (gray), STEPPING (yellow), ACCEPTED (green), or REJECTED (red)</li>
        <li>→ Final result shows a colored banner: &quot;✓ String accepted by the DFA&quot; (green) or &quot;✗ String rejected&quot; (red)</li>
        <li>→ If no initial state is set, simulation immediately rejects with a &quot;NO INITIAL STATE&quot; warning</li>
        <li>→ The idle state shows useful info: mode, state count, alphabet set, and warnings for missing initial or accepting states</li>
      </ul>

      <h2 id="nfa-algorithm" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">NFA Simulation Algorithm</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        For NFA mode (and generally for DFA too, since the same engine handles both), simulation uses a set-based approach:
      </p>
      <ol className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-decimal list-inside mb-3">
        <li><strong className="text-[var(--color-text)]">Start:</strong> Compute the epsilon closure of the initial state. This is the initial set of active states.</li>
        <li><strong className="text-[var(--color-text)]">Step:</strong> For the current input symbol, compute the set of states reachable from any active state via that symbol, then take the epsilon closure of the result.</li>
        <li><strong className="text-[var(--color-text)]">Accept:</strong> After all input is consumed, if any active state is accepting, the string is accepted.</li>
        <li><strong className="text-[var(--color-text)]">Reject:</strong> If the active state set ever becomes empty (no valid transitions), the string is immediately rejected.</li>
      </ol>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
        The epsilon closure is computed using a stack-based DFS: start with the given states, and for each state, follow all ε-transitions and add newly discovered states to the closure.
      </p>

      <h2 id="multi-run" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Multi-Run (Batch Testing)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        Switch to the &quot;Multi&quot; tab to test multiple strings at once. Enter one string per line in the textarea (an empty line represents ε), then click <strong className="text-[var(--color-text)]">RUN ALL</strong>. Each string is run through the full automaton simulation independently.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ Results show ✓ ACCEPT (green) or ✗ REJECT (red) for each string</li>
        <li>→ A summary shows pass count: e.g., &quot;3/5 pass&quot;</li>
        <li>→ The textarea placeholder suggests the format: one string per line</li>
        <li>→ On mobile, the multi-run view has a max height of 45vh to prevent it from covering the canvas</li>
      </ul>

      <Screenshot id="sim-accepted" description="Simulation — string accepted with input tape consumed" src="/docs/sim-accepted.png" />
      <Screenshot id="sim-rejected" description="Simulation — string rejected" src="/docs/sim-rejected.png" />
      <Screenshot id="multi-run" description="Multi-run — batch test multiple strings at once" src="/docs/multi-run.png" />

      <DocsPrevNext />
    </>
  );
}
