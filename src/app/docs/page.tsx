'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu, X as XIcon } from 'lucide-react';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'canvas-states', label: 'Canvas & States' },
  { id: 'transitions', label: 'Transitions' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'automaton-modes', label: 'Automaton Modes' },
  { id: 'conversions', label: 'Conversions' },
  { id: 'grammar-editor', label: 'Grammar Editor' },
  { id: 'l-systems', label: 'L-Systems' },
  { id: 'properties-panel', label: 'Properties Panel' },
  { id: 'import-export', label: 'Import/Export & Sharing' },
  { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts' },
];

function Screenshot({ id, description, src }: { id: string; description: string; src?: string }) {
  const [lightbox, setLightbox] = useState(false);

  if (!src) {
    return (
      <div
        id={`screenshot-${id}`}
        className="border border-[var(--color-border)] bg-[var(--bg-surface-sunken)] flex items-center justify-center py-16 my-6 font-mono text-xs text-[var(--color-text-muted)]"
      >
        Screenshot: {description}
      </div>
    );
  }

  return (
    <>
      <figure id={`screenshot-${id}`} className="my-6 group cursor-pointer" onClick={() => setLightbox(true)}>
        <div className="border border-[var(--color-border)] bg-[var(--bg-surface-sunken)] overflow-hidden relative">
          <img src={src} alt={description} className="w-full block" loading="lazy" />
          <div className="absolute inset-0 bg-[var(--color-accent)]/0 group-hover:bg-[var(--color-accent)]/5 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-accent)] font-mono text-xs tracking-wider bg-[var(--bg-primary)]/80 px-3 py-1.5 border border-[var(--color-accent)]/30">CLICK TO EXPAND</span>
          </div>
        </div>
        <figcaption className="font-mono text-[11px] text-[var(--color-text-muted)] mt-2">{description}</figcaption>
      </figure>
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 cursor-pointer animate-fade-in" onClick={() => setLightbox(false)}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img src={src} alt={description} className="max-w-full max-h-[90vh] object-contain border border-[var(--color-border)]" />
            <button className="absolute -top-3 -right-3 w-7 h-7 bg-[var(--bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors" onClick={() => setLightbox(false)}>
              <XIcon size={14} />
            </button>
            <div className="absolute -bottom-8 left-0 right-0 text-center font-mono text-xs text-[var(--color-text-muted)]">{description}</div>
          </div>
        </div>
      )}
    </>
  );
}

function KbdTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full font-mono text-xs border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Shortcut</th>
            <th className="text-left py-2 text-[var(--color-text-dim)] font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, desc], i) => (
            <tr key={i} className="border-b border-[var(--color-border)]/30">
              <td className="py-1.5 pr-4">
                <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1.5 py-0.5 text-[var(--color-accent)] text-[11px]">{key}</kbd>
              </td>
              <td className="py-1.5 text-[var(--color-text)]">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsPage() {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--color-text)] font-mono overflow-hidden">
      {/* Top bar */}
      <header className="h-11 shrink-0 bg-[var(--bg-surface)] border-b border-[var(--color-border)] flex items-center px-4 gap-3 z-50">
        <Link href="/" className="flex items-center gap-2 text-[var(--color-accent)] hover:opacity-80 transition-opacity text-xs tracking-wider font-bold shrink-0">
          <ArrowLeft size={14} />
          STATEFORGE
        </Link>
        <span className="text-[var(--color-text-dim)] text-xs tracking-widest uppercase">/ Docs</span>
        <div className="flex-1" />
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className="lg:hidden p-1 text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
          aria-label="Toggle table of contents"
        >
          {tocOpen ? <XIcon size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {tocOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setTocOpen(false)} />
        )}
        {/* Sidebar TOC */}
        <nav
          className={`
            fixed top-11 left-0 bottom-0 w-52 border-r border-[var(--color-border)] z-40
            overflow-y-auto py-6 pl-4 pr-3
            transition-transform duration-200
            lg:relative lg:top-0 lg:translate-x-0 lg:z-10 lg:shrink-0
            bg-[var(--bg-primary)] lg:bg-transparent
            ${tocOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase mb-4 font-medium">Contents</div>
          {sections.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setTocOpen(false)}
              className="block py-1.5 px-2 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent)]/5 border-l-2 border-transparent hover:border-[var(--color-accent)] transition-all"
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* Main content — this is the scrollable area */}
        <main className="flex-1 min-w-0 overflow-y-auto scroll-smooth">
          <div className="px-6 md:px-12 py-12 max-w-3xl">

          {/* ────────────────────── OVERVIEW ────────────────────── */}
          <section id="overview" className="mb-16">
            <h1 className="text-2xl md:text-3xl font-bold tracking-wider mb-2">
              <span className="text-[var(--color-accent)]">STATE</span><span className="text-[var(--color-text-bright)]">FORGE</span>
              <span className="text-sm text-[var(--color-text-dim)] ml-3 font-normal tracking-normal">Documentation</span>
            </h1>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mt-4">
              StateForge is a browser-based tool for building, simulating, and converting formal automata.
              It supports DFA, NFA, PDA, Turing machines, Mealy/Moore machines, context-free grammars, and L-systems — all in one interface with zero installation.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Why StateForge over JFLAP?</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ Runs in any browser — no Java, no downloads</li>
              <li>→ Shareable URLs encode your entire automaton</li>
              <li>→ Dark, modern UI with keyboard-first workflow</li>
              <li>→ JFLAP .jff file import supported</li>
              <li>→ Step-through conversions with visual explanations</li>
              <li>→ Built-in CYK, LL(1), and brute-force parsers for CFGs</li>
              <li>→ L-system rendering with presets</li>
            </ul>

            <Screenshot id="overview" description="Full app view — DFA with states, transitions, sidebar, and simulation panel" src="/docs/canvas-dfa.png" />
          </section>

          {/* ────────────────────── GETTING STARTED ────────────────────── */}
          <section id="getting-started" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Getting Started</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              When you first visit StateForge, you&apos;ll see the <strong className="text-[var(--color-text)]">Gallery</strong> — a collection of example automata organized by type (DFA, NFA, PDA, TM, Mealy, Moore). Click any example to load it onto the canvas, or click <strong className="text-[var(--color-text)]">Start from Scratch</strong> to begin with an empty canvas.
            </p>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              Your automaton is automatically saved to localStorage and encoded into the URL hash on every change. You can share your work by simply copying the URL — no account needed.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Creating your first automaton</h3>
            <ol className="text-sm text-[var(--color-text-dim)] space-y-2 list-decimal list-inside">
              <li><strong className="text-[var(--color-text)]">Double-click</strong> the canvas to add your first state (q0, automatically set as initial)</li>
              <li>Double-click again to add more states</li>
              <li>Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">T</kbd> to switch to the transition tool, then drag from one state to another</li>
              <li>Edit the transition label in the popup that appears</li>
              <li><strong className="text-[var(--color-text)]">Right-click</strong> a state to toggle Initial or Accepting</li>
              <li>Open the simulation panel (<kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘.</kbd>) and test your automaton</li>
            </ol>

            <Screenshot id="getting-started" description="Gallery — pick a pre-built example or start from scratch" src="/docs/gallery.png" />
          </section>

          {/* ────────────────────── CANVAS & STATES ────────────────────── */}
          <section id="canvas-states" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Canvas & States</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              The canvas is an infinite SVG workspace with a dot grid. Pan with <strong className="text-[var(--color-text)]">Space+Drag</strong> (or middle mouse), zoom with the scroll wheel or pinch on mobile.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Adding States</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Double-click</strong> empty canvas in pointer mode</li>
              <li>→ Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">S</kbd> for Add State tool, then click to place</li>
              <li>→ Right-click empty canvas → &quot;Add State Here&quot;</li>
              <li>→ The first state is automatically set as initial</li>
              <li>→ States are labeled q0, q1, q2… automatically</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Editing States</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Double-click</strong> a state to rename it</li>
              <li>→ <strong className="text-[var(--color-text)]">Right-click</strong> a state for context menu: Set Initial, Set Accepting, Rename, Delete</li>
              <li>→ On mobile, <strong className="text-[var(--color-text)]">long-press</strong> opens a bottom sheet context menu</li>
              <li>→ Initial states show an incoming arrow; accepting states show a double border (outer square)</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Selection</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Click</strong> a state to select it</li>
              <li>→ <strong className="text-[var(--color-text)]">Shift+Click</strong> to add to / toggle selection</li>
              <li>→ <strong className="text-[var(--color-text)]">Click+Drag</strong> on empty space for box select</li>
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘A</kbd> to select all states</li>
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Esc</kbd> to deselect</li>
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Del</kbd> or <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Backspace</kbd> to delete selected</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Dragging & Layout</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ Drag states to reposition them (multi-select drag supported)</li>
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⇧⌘L</kbd> — Auto Layout (arranges states in a circle)</li>
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘1</kbd> — Zoom to Fit (frames all states)</li>
            </ul>

            <Screenshot id="canvas-states" description="Canvas with states, transitions, initial arrow, and context menu" src="/docs/context-menu.png" />
          </section>

          {/* ────────────────────── TRANSITIONS ────────────────────── */}
          <section id="transitions" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Transitions</h2>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Adding Transitions</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">T</kbd> for the transition tool</li>
              <li>→ Click and drag from one state to another</li>
              <li>→ A label editor opens automatically — type your transition symbol(s)</li>
              <li>→ Drag from a state back to itself for a <strong className="text-[var(--color-text)]">self-loop</strong></li>
              <li>→ If a transition between two states already exists (DFA/NFA), clicking opens the existing one for editing</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Editing Transitions</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Click</strong> a transition edge or label to select it</li>
              <li>→ <strong className="text-[var(--color-text)]">Double-click</strong> to edit the label inline</li>
              <li>→ Separate multiple symbols with commas: <code className="text-[var(--color-accent)]">a, b, c</code></li>
              <li>→ Right-click a transition for Edit Label / Delete</li>
              <li>→ Bidirectional transitions automatically curve to avoid overlap</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Format by Mode</h3>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Mode</th>
                    <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Format</th>
                    <th className="text-left py-2 text-[var(--color-text-dim)] font-medium">Example</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--color-text)]">
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">DFA / NFA</td>
                    <td className="py-1.5 pr-4">symbol</td>
                    <td className="py-1.5 text-[var(--color-accent)]">a, b, ε</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">PDA</td>
                    <td className="py-1.5 pr-4">input, pop → push</td>
                    <td className="py-1.5 text-[var(--color-accent)]">a, Z → AZ</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">TM</td>
                    <td className="py-1.5 pr-4">read → write, direction</td>
                    <td className="py-1.5 text-[var(--color-accent)]">a → b, R</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">Mealy</td>
                    <td className="py-1.5 pr-4">input/output</td>
                    <td className="py-1.5 text-[var(--color-accent)]">a/0</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">Moore</td>
                    <td className="py-1.5 pr-4">input (output is in state label)</td>
                    <td className="py-1.5 text-[var(--color-accent)]">a</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ────────────────────── SIMULATION ────────────────────── */}
          <section id="simulation" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Simulation</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              The simulation panel sits at the bottom of the screen. Toggle it with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘.</kbd>. It has two modes: <strong className="text-[var(--color-text)]">Single</strong> and <strong className="text-[var(--color-text)]">Multi</strong>.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Single Mode</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
              Type an input string and use the controls:
            </p>
            <KbdTable rows={[
              ['⌘ Enter', 'Start simulation'],
              ['⌘ \'', 'Step (consume one symbol)'],
              ['⇧⌘ Enter', 'Fast Run (instant result)'],
              ['⌘ 0', 'Reset simulation'],
            ]} />
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ The <strong className="text-[var(--color-text)]">input tape</strong> visualization shows consumed (dimmed) and remaining symbols, with the current symbol highlighted</li>
              <li>→ <strong className="text-[var(--color-text)]">Active states</strong> are highlighted on the canvas in yellow during stepping</li>
              <li>→ Final result shows green (ACCEPTED) or red (REJECTED) with a banner</li>
              <li>→ For NFA, epsilon closures are computed automatically — multiple active states may be shown</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Multi-Run (Batch Testing)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
              Switch to the &quot;Multi&quot; tab to test multiple strings at once. Enter one string per line (empty line = ε), then click <strong className="text-[var(--color-text)]">RUN ALL</strong>. Results show ✓ ACCEPT or ✗ REJECT for each string with a pass count summary.
            </p>

            <Screenshot id="simulation" description="Simulation — single run with input tape and result banner" src="/docs/simulation.png" />
            <Screenshot id="multi-run" description="Multi-run — batch test multiple strings at once" src="/docs/multi-run.png" />
          </section>

          {/* ────────────────────── AUTOMATON MODES ────────────────────── */}
          <section id="automaton-modes" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Automaton Modes</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              Switch modes using the toolbar buttons or number keys <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">1</kbd>–<kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">6</kbd>.
              Switching modes preserves your states and transitions.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">DFA — Deterministic Finite Automaton</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Standard DFA with validation. The properties panel warns about DFA violations: multiple initial states, ε-transitions, and nondeterministic transitions on the same symbol.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">NFA — Nondeterministic Finite Automaton</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Supports ε-transitions and nondeterminism. During simulation, all reachable configurations are tracked simultaneously using epsilon closure.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">PDA — Pushdown Automaton</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-2">
              <li>→ Transition format: <code className="text-[var(--color-accent)]">input, pop → push</code></li>
              <li>→ The simulation panel shows a <strong className="text-[var(--color-text)]">stack visualization</strong> (top of stack highlighted)</li>
              <li>→ All nondeterministic branches are tracked as separate configurations</li>
              <li>→ Two acceptance modes: <strong className="text-[var(--color-text)]">Final State</strong> or <strong className="text-[var(--color-text)]">Empty Stack</strong> (toggle in the panel header)</li>
              <li>→ Active configurations show state, input position, and stack contents</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">TM — Turing Machine</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-2">
              <li>→ Transition format: <code className="text-[var(--color-accent)]">read → write, direction</code> (R/L/S)</li>
              <li>→ The simulation panel shows a <strong className="text-[var(--color-text)]">tape visualization</strong> with head position marked (▼)</li>
              <li>→ Configurable <strong className="text-[var(--color-text)]">step limit</strong> (default 1000) to prevent infinite loops</li>
              <li>→ History log shows each step&apos;s action</li>
              <li>→ Three outcomes: ACCEPTED (halts in accepting state), REJECTED (no transition), HALTED (step limit reached)</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Mealy / Moore Machines</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-2">
              <li>→ <strong className="text-[var(--color-text)]">Mealy:</strong> Output on transitions — format <code className="text-[var(--color-accent)]">input/output</code> (e.g., <code className="text-[var(--color-accent)]">a/1</code>)</li>
              <li>→ <strong className="text-[var(--color-text)]">Moore:</strong> Output on states — state label format <code className="text-[var(--color-accent)]">name/output</code> (e.g., <code className="text-[var(--color-accent)]">q0/0</code>)</li>
              <li>→ Simulation shows a step-by-step table with state, input, output, and next state columns</li>
              <li>→ The accumulated output string is displayed prominently</li>
              <li>→ Step-through or fast-run both supported</li>
            </ul>

            <Screenshot id="automaton-modes" description="PDA simulation showing stack visualization and active configurations" />
          </section>

          {/* ────────────────────── CONVERSIONS ────────────────────── */}
          <section id="conversions" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Conversions</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              Open the conversions panel with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘M</kbd> or the CONVERT button in the toolbar. Each conversion can be stepped through one operation at a time, fast-forwarded, or reset.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">NFA → DFA (Subset Construction)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Converts the current NFA to an equivalent DFA using the subset construction algorithm. Each step shows which new DFA state (subset) is created via δ(subset, symbol). Click <strong className="text-[var(--color-text)]">APPLY</strong> to replace the canvas automaton with the result.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">DFA Minimization (Table-Filling)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Minimizes the current DFA using the table-filling (Myhill-Nerode) algorithm. Steps show which state pairs are marked as distinguishable and why. Reports how many states were removed.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">RE → NFA (Thompson&apos;s Construction)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Enter a regular expression and convert it to an NFA. Supported syntax: literals (a-z, 0-9), <code className="text-[var(--color-accent)]">|</code> (union), <code className="text-[var(--color-accent)]">*</code> <code className="text-[var(--color-accent)]">+</code> <code className="text-[var(--color-accent)]">?</code> (quantifiers), <code className="text-[var(--color-accent)]">()</code> groups, and <code className="text-[var(--color-accent)]">ε</code>.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">FA → RE (State Elimination)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Converts the current finite automaton to a regular expression using state elimination. Each step shows which state is eliminated and how many edges are updated. The resulting RE can be copied to clipboard.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">FA → Grammar</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Generates a right-linear grammar from the current finite automaton. Productions are displayed with the start symbol indicated. Copy to clipboard supported.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Combine (DFA Operations)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Combine the canvas DFA (automaton A) with a second automaton B (specified as a regular expression). Supported operations:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
              <li>→ <strong className="text-[var(--color-text)]">∪ Union</strong> — accepts strings in A or B</li>
              <li>→ <strong className="text-[var(--color-text)]">∩ Intersection</strong> — accepts strings in both A and B</li>
              <li>→ <strong className="text-[var(--color-text)]">− Difference</strong> — accepts strings in A but not B</li>
              <li>→ <strong className="text-[var(--color-text)]">¬ Complement</strong> — flips accepting states (only needs A)</li>
            </ul>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
              Uses product construction for binary ops (B is converted RE → NFA → DFA internally). Step through to see each product state created.
            </p>

            <Screenshot id="conversions" description="Conversions panel — NFA→DFA, Minimize, RE, Grammar tools" src="/docs/conversions.png" />
          </section>

          {/* ────────────────────── GRAMMAR EDITOR ────────────────────── */}
          <section id="grammar-editor" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Grammar Editor</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">7</kbd> or click <strong className="text-[var(--color-text)]">CFG</strong> in the toolbar to open the grammar editor. It replaces the canvas with a split-pane view: grammar text on the left, tools on the right.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Editing</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ Write productions using <code className="text-[var(--color-accent)]">→</code> or <code className="text-[var(--color-accent)]">-&gt;</code> as the arrow</li>
              <li>→ Use <code className="text-[var(--color-accent)]">|</code> for alternatives on the same line</li>
              <li>→ Example: <code className="text-[var(--color-accent)]">S → aSb | ε</code></li>
              <li>→ Load built-in examples from the dropdown (Simple CFG, Arithmetic, Balanced Parens, Palindrome)</li>
              <li>→ Grammar is automatically classified: <span className="text-[var(--color-accept)]">Regular</span>, <span className="text-[var(--color-accent)]">Context-Free</span>, or Unrestricted</li>
              <li>→ Stats bar shows terminals (Σ), non-terminals (V), and production count</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Transforms</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Apply standard grammar transformations with step-by-step explanations:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Remove ε-productions</strong></li>
              <li>→ <strong className="text-[var(--color-text)]">Remove unit productions</strong></li>
              <li>→ <strong className="text-[var(--color-text)]">Remove useless symbols</strong></li>
              <li>→ <strong className="text-[var(--color-text)]">Convert to CNF</strong> (Chomsky Normal Form)</li>
              <li>→ <strong className="text-[var(--color-text)]">Convert to GNF</strong> (Greibach Normal Form)</li>
            </ul>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mt-2">
              Each transform shows the intermediate steps and resulting productions. Click <strong className="text-[var(--color-text)]">APPLY TO EDITOR</strong> to replace the grammar text with the result.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Parsing</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Three parsing algorithms are available:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-2 list-none">
              <li>
                → <strong className="text-[var(--color-text)]">CYK</strong> — Cocke-Younger-Kasami algorithm. Auto-converts to CNF. Shows the triangular CYK table and a parse tree if the string is accepted.
              </li>
              <li>
                → <strong className="text-[var(--color-text)]">LL(1)</strong> — Predictive top-down parser. Computes FIRST/FOLLOW sets, generates the LL(1) parse table, reports conflicts, and shows the step-by-step parse with stack/input/action columns. Parse tree displayed if successful.
              </li>
              <li>
                → <strong className="text-[var(--color-text)]">Brute Force</strong> — BFS exhaustive search. Works with any grammar type. Shows the leftmost derivation if found.
              </li>
            </ul>

            <Screenshot id="grammar-editor" description="Grammar editor with CYK parse table and parse tree" />
          </section>

          {/* ────────────────────── L-SYSTEMS ────────────────────── */}
          <section id="l-systems" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">L-Systems</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">8</kbd> or click <strong className="text-[var(--color-text)]">L-SYS</strong> in the toolbar. The L-system view shows controls on the left and a real-time turtle graphics canvas on the right.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Presets</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Built-in presets include:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ Koch Curve, Sierpinski Triangle, Dragon Curve</li>
              <li>→ Plant (branching fractal), Hilbert Curve</li>
              <li>→ Penrose Tiling (P3)</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Custom Rules</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ Set the <strong className="text-[var(--color-text)]">axiom</strong> (starting string)</li>
              <li>→ Set the <strong className="text-[var(--color-text)]">angle</strong> in degrees</li>
              <li>→ Define <strong className="text-[var(--color-text)]">rules</strong> one per line in <code className="text-[var(--color-accent)]">X=replacement</code> format</li>
              <li>→ Adjust <strong className="text-[var(--color-text)]">iterations</strong> with the slider (0–10)</li>
              <li>→ Drawing commands: <code className="text-[var(--color-accent)]">F</code>/<code className="text-[var(--color-accent)]">G</code> (draw forward), <code className="text-[var(--color-accent)]">f</code> (move without drawing), <code className="text-[var(--color-accent)]">+</code>/<code className="text-[var(--color-accent)]">-</code> (turn), <code className="text-[var(--color-accent)]">[</code>/<code className="text-[var(--color-accent)]">]</code> (push/pop position)</li>
            </ul>

            <Screenshot id="l-systems" description="L-system view showing Plant fractal rendering" />
          </section>

          {/* ────────────────────── PROPERTIES PANEL ────────────────────── */}
          <section id="properties-panel" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Properties Panel</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              The right sidebar shows properties and is toggled with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘/</kbd>. On mobile, it slides in as a drawer.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Formal Definition</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Shows the standard 5-tuple definition of the current automaton:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Q</strong> — Set of states</li>
              <li>→ <strong className="text-[var(--color-text)]">Σ</strong> — Input alphabet (extracted from transitions)</li>
              <li>→ <strong className="text-[var(--color-text)]">q₀</strong> — Initial state</li>
              <li>→ <strong className="text-[var(--color-text)]">F</strong> — Set of accepting states</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Transition Table (δ)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              A compact table listing every transition: from → to with symbols. Click any row to select that transition on the canvas.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Trap State</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              For DFA/NFA modes, a &quot;+ Add Trap State&quot; button appears. This automatically creates a non-accepting trap state with self-loops for all alphabet symbols, and adds missing transitions from existing states to the trap. Also available via <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⇧⌘Q</kbd>.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">DFA Validation</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
              In DFA mode, the panel shows errors for violations: multiple initial states, ε-transitions, or nondeterministic transitions (same symbol from same state).
            </p>
          </section>

          {/* ────────────────────── IMPORT/EXPORT ────────────────────── */}
          <section id="import-export" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Import/Export & Sharing</h2>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">URL Sharing</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Your automaton is automatically encoded in the URL hash on every change. Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘S</kbd> or click <strong className="text-[var(--color-text)]">SHARE</strong> to copy the URL to clipboard. Anyone opening the URL will see your exact automaton.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">JSON Export</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘E</kbd> to download your automaton as a JSON file (<code className="text-[var(--color-accent)]">stateforge-v1</code> format) containing states, transitions, and mode.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Import</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘O</kbd> to import a file. Supported formats:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ <strong className="text-[var(--color-text)]">.json</strong> — StateForge native format</li>
              <li>→ <strong className="text-[var(--color-text)]">.jff</strong> — JFLAP XML format (states, transitions, and type are parsed; works for FA, PDA, and TM)</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Auto-Save</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
              Your work is automatically saved to localStorage every 500ms. On reload, it restores your last automaton. The URL hash takes priority over localStorage if present.
            </p>
          </section>

          {/* ────────────────────── KEYBOARD SHORTCUTS ────────────────────── */}
          <section id="keyboard-shortcuts" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Keyboard Shortcuts</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">?</kbd> in the app to see the shortcuts overlay. Full list:
            </p>
            <Screenshot id="shortcuts" description="Keyboard shortcuts modal — press ? to toggle" src="/docs/shortcuts.png" />

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Tools</h3>
            <KbdTable rows={[
              ['V', 'Pointer tool'],
              ['S', 'Add State tool'],
              ['T', 'Add Transition tool'],
              ['Del / Backspace', 'Delete selected'],
              ['⌘A', 'Select all'],
              ['⌘Z', 'Undo'],
              ['⌘⇧Z', 'Redo'],
            ]} />

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Modes</h3>
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

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Panels</h3>
            <KbdTable rows={[
              ['⌘.', 'Toggle Simulation panel'],
              ['⌘/', 'Toggle Properties sidebar'],
              ['⌘M', 'Toggle Conversions panel'],
            ]} />

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Simulation</h3>
            <KbdTable rows={[
              ['⌘ Enter', 'Start simulation'],
              ['⌘ \'', 'Step simulation'],
              ['⇧⌘ Enter', 'Fast run'],
              ['⌘0', 'Reset simulation'],
            ]} />

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">File</h3>
            <KbdTable rows={[
              ['⌘S', 'Share / Copy URL'],
              ['⌘E', 'Export JSON'],
              ['⌘O', 'Import file'],
            ]} />

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Canvas</h3>
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
          </section>

          {/* Footer */}
          <div className="border-t border-[var(--color-border)] pt-8 mt-16">
            <p className="text-xs text-[var(--color-text-muted)]">
              StateForge — No install, no accounts, just a URL.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              <Link href="/" className="text-[var(--color-accent)] hover:opacity-80 transition-opacity">← Back to app</Link>
            </p>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
