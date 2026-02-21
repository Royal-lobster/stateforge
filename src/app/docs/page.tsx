'use client';

import { Screenshot } from '@/components/docs/Screenshot';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function DocsOverview() {
  return (
    <>
      {/* OVERVIEW */}
      <section id="overview" className="mb-16">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider mb-2">
          <span className="text-[var(--color-accent)]">STATE</span><span className="text-[var(--color-text-bright)]">FORGE</span>
          <span className="text-sm text-[var(--color-text-dim)] ml-3 font-normal tracking-normal">Documentation</span>
        </h1>
        <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mt-4">
          StateForge is a browser-based tool for building, simulating, and converting formal automata.
          It supports DFA, NFA, PDA, Turing machines, Mealy/Moore machines, context-free grammars, and L-systems — all in one interface with zero installation.
          Everything runs client-side: your automaton is encoded into the URL hash on every change, so sharing is as simple as copying the link.
        </p>

        <h3 id="why-stateforge" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Why StateForge over JFLAP?</h3>
        <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
          <li>→ Runs in any browser — no Java, no downloads, no installation</li>
          <li>→ Shareable URLs encode your entire automaton (states, transitions, positions, mode)</li>
          <li>→ Dark, modern UI with keyboard-first workflow and full mobile support</li>
          <li>→ JFLAP .jff file import supported (FA, PDA, and TM types)</li>
          <li>→ Step-through conversions with visual explanations at each stage</li>
          <li>→ Built-in CYK, LL(1), and brute-force parsers for context-free grammars</li>
          <li>→ L-system rendering with turtle graphics and 6 built-in presets</li>
          <li>→ Undo/redo with up to 50 history snapshots</li>
          <li>→ Auto-save to localStorage with 500ms debounce</li>
          <li>→ Full touch support: pinch-to-zoom, drag states, long-press for context menus</li>
        </ul>

        <Screenshot id="overview" description="Full app view — DFA with states, transitions, sidebar, and simulation panel" src="/docs/canvas-dfa.png" />
      </section>

      {/* GETTING STARTED */}
      <section id="getting-started" className="mb-16">
        <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)] pb-2 border-b border-[var(--color-border)]">Getting Started</h2>

        <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
          When you first visit StateForge, you&apos;ll see the <strong className="text-[var(--color-text)]">Gallery</strong> — a collection of example automata organized by type (DFA, NFA, PDA, TM, Mealy, Moore). Click any example to load it onto the canvas, or click <strong className="text-[var(--color-text)]">Start from Scratch</strong> to begin with an empty canvas.
        </p>

        <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
          Your automaton is automatically saved to localStorage and encoded into the URL hash on every change. You can share your work by simply copying the URL — no account needed.
          If a URL with a hash is opened, it takes priority over localStorage and loads the encoded automaton.
        </p>

        <h3 id="first-automaton" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Creating your first automaton</h3>
        <ol className="text-sm text-[var(--color-text-dim)] space-y-2 list-decimal list-inside">
          <li><strong className="text-[var(--color-text)]">Double-click</strong> the canvas to add your first state (q0, automatically set as initial)</li>
          <li>Double-click again to add more states (q1, q2, ... auto-numbered)</li>
          <li>Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">T</kbd> to switch to the transition tool, then drag from one state to another</li>
          <li>Edit the transition label in the inline popup that appears (type symbols separated by commas)</li>
          <li><strong className="text-[var(--color-text)]">Right-click</strong> a state to toggle Initial or Accepting (on mobile, long-press)</li>
          <li>Open the simulation panel (<kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘.</kbd>) and test your automaton with input strings</li>
        </ol>

        <h3 id="interface-layout" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Interface layout</h3>
        <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
          The interface has four main areas:
        </p>
        <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
          <li>→ <strong className="text-[var(--color-text)]">Toolbar</strong> (top) — Mode selector (1–8), tool buttons (pointer/state/transition), and action buttons (share, export, import, layout, convert, clear)</li>
          <li>→ <strong className="text-[var(--color-text)]">Canvas</strong> (center) — Infinite SVG workspace with dot grid where you build your automaton</li>
          <li>→ <strong className="text-[var(--color-text)]">Properties sidebar</strong> (right, toggle with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘/</kbd>) — Formal definition, transition table, state list, DFA validation</li>
          <li>→ <strong className="text-[var(--color-text)]">Simulation panel</strong> (bottom, toggle with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘.</kbd>) — Input tape, step controls, batch testing</li>
        </ul>

        <Screenshot id="getting-started" description="Gallery — pick a pre-built example or start from scratch" src="/docs/gallery.png" />
      </section>

      <DocsPrevNext />
    </>
  );
}
