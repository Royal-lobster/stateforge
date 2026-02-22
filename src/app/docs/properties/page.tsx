'use client';

import { Screenshot } from '@/components/docs/Screenshot';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function PropertiesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider mb-6 text-[var(--color-text-bright)]">Properties Panel</h1>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
        The right sidebar (264px wide on desktop) shows properties and is toggled with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘/</kbd>. On desktop, it animates width with a 200ms ease-out transition for smooth canvas resize. On mobile, it slides in as a drawer overlay (max 85vw) with a close button.
      </p>

      <h2 id="formal-definition" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Formal Definition</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Shows the standard tuple definition of the current automaton, adapting to the current mode:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
        <li>→ <strong className="text-[var(--color-text)]">Q</strong> — Set of states: <code className="text-[var(--color-accent)]">{"{"}</code><code className="text-[var(--color-accent)]">q0, q1, q2</code><code className="text-[var(--color-accent)]">{"}"}</code> or ∅ if empty</li>
        <li>→ <strong className="text-[var(--color-text)]">Σ</strong> — Input alphabet: extracted from all transition symbols (excluding ε), sorted alphabetically</li>
        <li>→ <strong className="text-[var(--color-text)]">q₀</strong> — Initial state label, or &quot;—&quot; if none set</li>
        <li>→ <strong className="text-[var(--color-text)]">F</strong> — Set of accepting states, or ∅ if none</li>
        <li>→ Summary: &quot;N states · M transitions&quot;</li>
      </ul>

      <h2 id="transition-table" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Transition Table (δ)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        A compact table listing every transition. Each row shows:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
        <li>→ From state → To state, with symbols in accent color</li>
        <li>→ Click any row to select that transition on the canvas (highlights the edge)</li>
        <li>→ The currently selected transition is shown in accent color</li>
      </ul>

      <h2 id="selected-state" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Selected State/Transition</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        When a state is selected, the panel shows:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
        <li>→ State label in accent color</li>
        <li>→ Checkboxes for Initial and Accepting (clickable to toggle)</li>
        <li>→ &quot;Rename…&quot; link to open the inline editor</li>
      </ul>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mt-2 mb-2">
        When a transition is selected:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
        <li>→ From → To states shown with an arrow</li>
        <li>→ Current symbols in accent color</li>
        <li>→ &quot;Edit symbols…&quot; link to open the inline editor</li>
      </ul>

      <h2 id="trap-state" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Trap State</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        {"For DFA/NFA modes, a \"+ Add Trap State\" button appears when there are states. This automatically:"}
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
        <li>→ Collects the alphabet from all existing transitions</li>
        <li>→ Finds all (state, symbol) pairs that have no outgoing transition</li>
        <li>→ Creates a non-accepting state labeled &quot;trap&quot; positioned 150px to the right of the rightmost state</li>
        <li>→ Adds transitions from each state to the trap for all missing symbols</li>
        <li>→ Adds self-loops on the trap for every alphabet symbol</li>
        <li>→ If no transitions are missing (DFA is already complete), does nothing</li>
        <li>→ Also available via <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⇧⌘Q</kbd></li>
      </ul>

      <Screenshot id="sidebar" description="Properties panel — formal definition, transition table, state list" src="/docs/sidebar.png" />

      <h2 id="dfa-validation" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">DFA Validation Errors</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        {"In DFA mode, the panel shows an \"Errors\" section in red for any violations:"}
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
        <li>→ &quot;Multiple initial states&quot; — if more than one state has isInitial=true</li>
        <li>→ &quot;ε-transition from qN&quot; — for each state that has an epsilon transition</li>
        <li>→ &quot;qN: multiple on &apos;a&apos;&quot; — for each state that has multiple transitions on the same symbol (nondeterminism)</li>
      </ul>

      <h2 id="states-list" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">States List</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
        At the bottom, a scrollable list of all states. Each shows: a circle icon (filled if accepting), the label, a &quot;START&quot; badge for initial states, and an &quot;ACCEPT&quot; badge for accepting states. Click any state to select it on the canvas.
      </p>

      <h2 id="mobile-actions" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Mobile Actions</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
        On mobile, the sidebar includes action buttons not available in the compact toolbar: SHARE, LAYOUT, CLEAR, EXPORT, and IMPORT. These mirror the desktop toolbar functionality.
      </p>

      <DocsPrevNext />
    </>
  );
}
