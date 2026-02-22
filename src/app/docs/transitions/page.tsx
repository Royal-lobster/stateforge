'use client';

import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function TransitionsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider mb-6 text-[var(--color-text-bright)]">Transitions</h1>

      <h2 id="adding-transitions" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Adding Transitions</h2>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">T</kbd> for the transition tool (cursor becomes crosshair)</li>
        <li>→ Click and drag from one state to another — a dashed preview line follows your cursor</li>
        <li>→ Release over the target state to create the transition; release over empty space to cancel</li>
        <li>→ A label editor opens automatically on creation — type your symbol(s) and press Enter to confirm, or Escape to cancel</li>
        <li>→ Drag from a state back to itself for a <strong className="text-[var(--color-text)]">self-loop</strong> (rendered as a curved path above the state)</li>
        <li>→ On touch devices, the same drag gesture works: tap a state and drag to the target</li>
      </ul>

      <h2 id="duplicate-handling" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Duplicate Handling</h2>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ For <strong className="text-[var(--color-text)]">DFA, NFA, Mealy, and Moore</strong> modes: if a transition between two states already exists, dragging between them opens the existing transition for editing instead of creating a duplicate. This lets you add more symbols to the same edge.</li>
        <li>→ For <strong className="text-[var(--color-text)]">PDA and TM</strong> modes: multiple transitions between the same pair of states are allowed (since each has different read/pop/push or read/write/move specifications). Each creates a separate edge.</li>
        <li>→ Multiple self-loops on the same state stack vertically — each loop is offset 18px higher than the previous, with spread increasing by 4px per loop</li>
      </ul>

      <h2 id="editing-transitions" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Editing Transitions</h2>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ <strong className="text-[var(--color-text)]">Click</strong> a transition edge or label to select it (highlighted in accent color with a brighter arrowhead)</li>
        <li>→ <strong className="text-[var(--color-text)]">Double-click</strong> a transition to edit the label inline</li>
        <li>→ Separate multiple symbols with commas: <code className="text-[var(--color-accent)]">a, b, c</code></li>
        <li>→ Right-click a transition for Edit Label / Delete options</li>
        <li>→ Bidirectional transitions (A→B and B→A both exist) automatically curve with a 20px offset to avoid overlap</li>
        <li>→ The label editor shows a placeholder hint based on the current mode (e.g., <code className="text-[var(--color-accent)]">a, Z → AZ</code> for PDA, <code className="text-[var(--color-accent)]">a → b, R</code> for TM)</li>
      </ul>

      <h2 id="default-symbols" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Default Symbols by Mode</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
        When a new transition is created, it gets a default symbol based on the current mode:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-4">
        <li>→ <strong className="text-[var(--color-text)]">DFA:</strong> <code className="text-[var(--color-accent)]">a</code></li>
        <li>→ <strong className="text-[var(--color-text)]">NFA:</strong> <code className="text-[var(--color-accent)]">ε</code> (epsilon transition)</li>
        <li>→ <strong className="text-[var(--color-text)]">PDA:</strong> <code className="text-[var(--color-accent)]">a, Z → Z</code></li>
        <li>→ <strong className="text-[var(--color-text)]">TM:</strong> <code className="text-[var(--color-accent)]">a → a, R</code></li>
        <li>→ <strong className="text-[var(--color-text)]">Mealy:</strong> <code className="text-[var(--color-accent)]">a/0</code></li>
        <li>→ <strong className="text-[var(--color-text)]">Moore:</strong> <code className="text-[var(--color-accent)]">a</code> (output is in the state label)</li>
      </ul>

      <h2 id="format-reference" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Transition Format Reference</h2>
      <div className="overflow-x-auto my-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Mode</th>
              <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Format</th>
              <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Example</th>
              <th className="text-left py-2 text-[var(--color-text-dim)] font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="text-[var(--color-text)]">
            <tr className="border-b border-[var(--color-border)]/30">
              <td className="py-1.5 pr-4">DFA / NFA</td>
              <td className="py-1.5 pr-4">symbol</td>
              <td className="py-1.5 pr-4 text-[var(--color-accent)]">a, b, ε</td>
              <td className="py-1.5 text-[var(--color-text-dim)]">Comma-separated; ε for epsilon</td>
            </tr>
            <tr className="border-b border-[var(--color-border)]/30">
              <td className="py-1.5 pr-4">PDA</td>
              <td className="py-1.5 pr-4">input, pop → push</td>
              <td className="py-1.5 pr-4 text-[var(--color-accent)]">a, Z → AZ</td>
              <td className="py-1.5 text-[var(--color-text-dim)]">{"Use ε for no-read, no-pop, or no-push; → or -> accepted"}</td>
            </tr>
            <tr className="border-b border-[var(--color-border)]/30">
              <td className="py-1.5 pr-4">TM</td>
              <td className="py-1.5 pr-4">read → write, dir</td>
              <td className="py-1.5 pr-4 text-[var(--color-accent)]">a → b, R</td>
              <td className="py-1.5 text-[var(--color-text-dim)]">{"Direction: R (right), L (left), S (stay); * for any symbol"}</td>
            </tr>
            <tr className="border-b border-[var(--color-border)]/30">
              <td className="py-1.5 pr-4">Mealy</td>
              <td className="py-1.5 pr-4">input/output</td>
              <td className="py-1.5 pr-4 text-[var(--color-accent)]">a/0, b/1</td>
              <td className="py-1.5 text-[var(--color-text-dim)]">Output produced on each transition</td>
            </tr>
            <tr className="border-b border-[var(--color-border)]/30">
              <td className="py-1.5 pr-4">Moore</td>
              <td className="py-1.5 pr-4">input</td>
              <td className="py-1.5 pr-4 text-[var(--color-accent)]">a, b</td>
              <td className="py-1.5 text-[var(--color-text-dim)]">Output is in state label: q0/0 means state q0 outputs 0</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocsPrevNext />
    </>
  );
}
