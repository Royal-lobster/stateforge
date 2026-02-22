'use client';

import { Screenshot } from '@/components/docs/Screenshot';
import { KbdTable } from '@/components/docs/KbdTable';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function ShortcutsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider mb-6 text-[var(--color-text-bright)]">Keyboard Shortcuts</h1>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
        Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">?</kbd> in the app to see the shortcuts overlay. Full list:
      </p>
      <Screenshot id="shortcuts" description="Keyboard shortcuts modal — press ? to toggle" src="/docs/shortcuts.png" />

      <h2 id="tools" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Tools</h2>
      <KbdTable rows={[
        ['V', 'Pointer tool'],
        ['S', 'Add State tool'],
        ['T', 'Add Transition tool'],
        ['Del / Backspace', 'Delete selected'],
        ['⌘A', 'Select all'],
        ['⌘Z', 'Undo'],
        ['⌘⇧Z', 'Redo'],
      ]} />

      <h2 id="modes" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Modes</h2>
      <KbdTable rows={[
        ['1', 'DFA'],
        ['2', 'NFA'],
        ['3', 'PDA'],
        ['4', 'Turing Machine'],
        ['5', 'Mealy Machine'],
        ['6', 'Moore Machine'],
        ['7', 'CFG (Grammar Editor)'],
        ['8', 'L-System'],
      ]} />

      <h2 id="panels" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Panels</h2>
      <KbdTable rows={[
        ['⌘.', 'Toggle Simulation panel'],
        ['⌘/', 'Toggle Properties sidebar'],
        ['⌘M', 'Toggle Conversions panel'],
      ]} />

      <h2 id="simulation" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Simulation</h2>
      <KbdTable rows={[
        ['⌘ Enter', 'Start simulation'],
        ['⌘ \'', 'Step simulation'],
        ['⇧⌘ Enter', 'Fast run'],
        ['⌘0', 'Reset simulation'],
      ]} />

      <h2 id="file" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">File</h2>
      <KbdTable rows={[
        ['⌘S', 'Share / Copy URL'],
        ['⌘E', 'Export JSON'],
        ['⌘O', 'Import file'],
      ]} />

      <h2 id="canvas" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Canvas</h2>
      <KbdTable rows={[
        ['Space + Drag', 'Pan'],
        ['Scroll', 'Zoom'],
        ['Shift + Click', 'Multi-select'],
        ['Double-click', 'Add state / Edit label'],
        ['Right-click', 'Context menu'],
        ['⌘1', 'Zoom to Fit'],
        ['⇧⌘L', 'Auto Layout'],
        ['⇧⌘X', 'Clear All'],
        ['⇧⌘Q', 'Add Trap State'],
        ['Esc', 'Deselect / Close'],
        ['?', 'Show shortcuts overlay'],
      ]} />

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] pt-8 mt-16">
        <p className="text-xs text-[var(--color-text-muted)]">
          StateForge — No install, no accounts, just a URL.
        </p>
      </div>

      <DocsPrevNext />
    </>
  );
}
