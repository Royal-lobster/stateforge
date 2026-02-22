'use client';

import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function ImportExportPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider mb-6 text-[var(--color-text-bright)]">Import/Export &amp; Sharing</h1>

      <h2 id="url-sharing" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">URL Sharing</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Your automaton is automatically encoded in the URL hash on every change. The encoding includes all state positions, labels, flags (initial/accepting), transitions with symbols, and the current mode. Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘S</kbd> or click <strong className="text-[var(--color-text)]">SHARE</strong> to copy the full URL to clipboard. Anyone opening the URL will see your exact automaton with identical layout.
      </p>

      <h2 id="json-export" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">JSON Export</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘E</kbd> to download your automaton as a JSON file. The format is:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
        <li>→ <code className="text-[var(--color-accent)]">{"_format: \"stateforge-v1\""}</code> — format identifier</li>
        <li>→ <code className="text-[var(--color-accent)]">mode</code> — automaton type (dfa, nfa, pda, tm, mealy, moore)</li>
        <li>→ <code className="text-[var(--color-accent)]">states</code> — array of state objects with id, label, x, y, isInitial, isAccepting</li>
        <li>→ <code className="text-[var(--color-accent)]">transitions</code> — array of transition objects with id, from, to, symbols array</li>
        <li>→ File is named <code className="text-[var(--color-accent)]">stateforge-MODE.json</code> (e.g., stateforge-dfa.json)</li>
      </ul>

      <h2 id="import" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Import</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘O</kbd> to import a file. Supported formats:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ <strong className="text-[var(--color-text)]">.json</strong> — StateForge native format. Must have a <code className="text-[var(--color-accent)]">states</code> array. Mode defaults to &quot;dfa&quot; if not specified.</li>
        <li>→ <strong className="text-[var(--color-text)]">.jff</strong> — JFLAP XML format. The importer parses the XML structure to extract states (with coordinates), transitions (with read/write/pop/push/move attributes), and automaton type (fa→dfa, pda→pda, turing→tm). State positions are preserved from the JFLAP file.</li>
      </ul>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mt-2">
        After import, Zoom to Fit is automatically called to frame the loaded automaton. The next state number counter is set to one past the highest existing qN label.
      </p>

      <h2 id="auto-save" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Auto-Save</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
        Your work is automatically saved to localStorage via Zustand&apos;s subscription mechanism. On reload, it restores your last automaton (states, transitions, mode, viewport). The URL hash takes priority over localStorage if present — this means opening a shared link always loads that specific automaton regardless of what was saved locally.
      </p>

      <DocsPrevNext />
    </>
  );
}
