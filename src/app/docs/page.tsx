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

      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full">
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
          <div className="px-6 md:px-12 py-12 max-w-3xl mx-auto">

          {/* ────────────────────── OVERVIEW ────────────────────── */}
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

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Why StateForge over JFLAP?</h3>
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

          {/* ────────────────────── GETTING STARTED ────────────────────── */}
          <section id="getting-started" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Getting Started</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              When you first visit StateForge, you&apos;ll see the <strong className="text-[var(--color-text)]">Gallery</strong> — a collection of example automata organized by type (DFA, NFA, PDA, TM, Mealy, Moore). Click any example to load it onto the canvas, or click <strong className="text-[var(--color-text)]">Start from Scratch</strong> to begin with an empty canvas.
            </p>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              Your automaton is automatically saved to localStorage and encoded into the URL hash on every change. You can share your work by simply copying the URL — no account needed.
              If a URL with a hash is opened, it takes priority over localStorage and loads the encoded automaton.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Creating your first automaton</h3>
            <ol className="text-sm text-[var(--color-text-dim)] space-y-2 list-decimal list-inside">
              <li><strong className="text-[var(--color-text)]">Double-click</strong> the canvas to add your first state (q0, automatically set as initial)</li>
              <li>Double-click again to add more states (q1, q2, ... auto-numbered)</li>
              <li>Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">T</kbd> to switch to the transition tool, then drag from one state to another</li>
              <li>Edit the transition label in the inline popup that appears (type symbols separated by commas)</li>
              <li><strong className="text-[var(--color-text)]">Right-click</strong> a state to toggle Initial or Accepting (on mobile, long-press)</li>
              <li>Open the simulation panel (<kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘.</kbd>) and test your automaton with input strings</li>
            </ol>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Interface layout</h3>
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

          {/* ────────────────────── CANVAS & STATES ────────────────────── */}
          <section id="canvas-states" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Canvas &amp; States</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              The canvas is an infinite SVG workspace rendered on a 20px dot grid. It uses a transform-based coordinate system where all state positions are stored in &quot;world&quot; coordinates, and the viewport is controlled by pan (translation) and zoom (scale) values.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Viewport Controls</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Pan:</strong> Hold <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Space</kbd> + drag, or use middle mouse button. On mobile, drag on empty canvas area with one finger</li>
              <li>→ <strong className="text-[var(--color-text)]">Zoom:</strong> Scroll wheel (zooms toward cursor position). On mobile, pinch with two fingers. Zoom range: 25% to 300%</li>
              <li>→ <strong className="text-[var(--color-text)]">Zoom to Fit:</strong> Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘1</kbd> to frame all states with 80px padding, clamped between 50%–250% zoom</li>
              <li>→ The current zoom percentage is shown in the bottom-right corner of the canvas</li>
              <li>→ Two-finger gestures on mobile support simultaneous pan and zoom</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Adding States</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Double-click</strong> empty canvas in pointer mode — adds a state at that world coordinate</li>
              <li>→ Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">S</kbd> for Add State tool, then click anywhere to place (cursor changes to crosshair)</li>
              <li>→ Right-click empty canvas → &quot;Add State Here&quot; from context menu</li>
              <li>→ The first state added is automatically set as initial (shown with an incoming arrow)</li>
              <li>→ States are labeled q0, q1, q2… automatically with an incrementing counter</li>
              <li>→ States are rendered as 28px-radius squares (not circles) with a 1.5px border</li>
              <li>→ When only one state exists, the canvas auto-centers on it</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Editing States</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Double-click</strong> a state to rename it — an inline text input appears centered on the state</li>
              <li>→ <strong className="text-[var(--color-text)]">Right-click</strong> a state for context menu: Set Initial, Set Accepting, Rename, Delete</li>
              <li>→ On mobile, <strong className="text-[var(--color-text)]">long-press</strong> (500ms) opens a bottom sheet context menu with the same options</li>
              <li>→ Initial states show an incoming arrow (30px long) from the left; accepting states show an outer square border (4px larger than the state)</li>
              <li>→ State labels longer than 10 characters are truncated with an ellipsis; font size scales down for labels longer than 6 characters (minimum 9px)</li>
              <li>→ Setting a state as initial automatically unsets any other initial state (only one allowed)</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Selection</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Click</strong> a state to select it (shown with accent color border and glow filter)</li>
              <li>→ <strong className="text-[var(--color-text)]">Shift+Click</strong> to add to / toggle selection (multi-select)</li>
              <li>→ <strong className="text-[var(--color-text)]">Click+Drag</strong> on empty space for box select — a dashed rectangle appears and selects all states within</li>
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘A</kbd> to select all states</li>
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Esc</kbd> to deselect everything and close editors</li>
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Del</kbd> or <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Backspace</kbd> to delete all selected states and their connected transitions</li>
              <li>→ Clicking a transition edge or label also selects it (shown in accent color); clicking empty space deselects</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Dragging &amp; Layout</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ Drag states to reposition them — multi-select drag moves all selected states together</li>
              <li>→ Dragging pushes an undo snapshot on first pixel moved (not on every frame), so undo restores original positions</li>
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⇧⌘L</kbd> — Auto Layout: arranges all states in a circle centered at (400, 300) with radius proportional to state count (minimum 120px, 40px per state). Automatically calls Zoom to Fit after 50ms</li>
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘1</kbd> — Zoom to Fit: calculates bounding box of all states, adds 80px padding, and sets zoom/pan to frame everything</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Undo / Redo</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘Z</kbd> — Undo (up to 50 snapshots in the undo stack)</li>
              <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘⇧Z</kbd> — Redo</li>
              <li>→ Snapshots capture states, transitions, and mode. Any mutating action (add state, delete, rename, toggle initial/accepting, change mode, etc.) pushes an undo snapshot and clears the redo stack</li>
              <li>→ Moving states only pushes a snapshot once per drag operation (not every frame)</li>
            </ul>

            <Screenshot id="canvas-states" description="Canvas with states, transitions, initial arrow, and context menu" src="/docs/context-menu.png" />
          </section>

          {/* ────────────────────── TRANSITIONS ────────────────────── */}
          <section id="transitions" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Transitions</h2>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Adding Transitions</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">T</kbd> for the transition tool (cursor becomes crosshair)</li>
              <li>→ Click and drag from one state to another — a dashed preview line follows your cursor</li>
              <li>→ Release over the target state to create the transition; release over empty space to cancel</li>
              <li>→ A label editor opens automatically on creation — type your symbol(s) and press Enter to confirm, or Escape to cancel</li>
              <li>→ Drag from a state back to itself for a <strong className="text-[var(--color-text)]">self-loop</strong> (rendered as a curved path above the state)</li>
              <li>→ On touch devices, the same drag gesture works: tap a state and drag to the target</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Duplicate Handling</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ For <strong className="text-[var(--color-text)]">DFA, NFA, Mealy, and Moore</strong> modes: if a transition between two states already exists, dragging between them opens the existing transition for editing instead of creating a duplicate. This lets you add more symbols to the same edge.</li>
              <li>→ For <strong className="text-[var(--color-text)]">PDA and TM</strong> modes: multiple transitions between the same pair of states are allowed (since each has different read/pop/push or read/write/move specifications). Each creates a separate edge.</li>
              <li>→ Multiple self-loops on the same state stack vertically — each loop is offset 18px higher than the previous, with spread increasing by 4px per loop</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Editing Transitions</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Click</strong> a transition edge or label to select it (highlighted in accent color with a brighter arrowhead)</li>
              <li>→ <strong className="text-[var(--color-text)]">Double-click</strong> a transition to edit the label inline</li>
              <li>→ Separate multiple symbols with commas: <code className="text-[var(--color-accent)]">a, b, c</code></li>
              <li>→ Right-click a transition for Edit Label / Delete options</li>
              <li>→ Bidirectional transitions (A→B and B→A both exist) automatically curve with a 20px offset to avoid overlap</li>
              <li>→ The label editor shows a placeholder hint based on the current mode (e.g., <code className="text-[var(--color-accent)]">a, Z → AZ</code> for PDA, <code className="text-[var(--color-accent)]">a → b, R</code> for TM)</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Default Symbols by Mode</h3>
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

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Transition Format Reference</h3>
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
                    <td className="py-1.5 text-[var(--color-text-dim)]">Use ε for no-read, no-pop, or no-push; → or -&gt; accepted</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">TM</td>
                    <td className="py-1.5 pr-4">read → write, dir</td>
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">a → b, R</td>
                    <td className="py-1.5 text-[var(--color-text-dim)]">Direction: R (right), L (left), S (stay); * for any symbol</td>
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
          </section>

          {/* ────────────────────── SIMULATION ────────────────────── */}
          <section id="simulation" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Simulation</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              The simulation panel sits at the bottom of the screen. Toggle it with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘.</kbd>. It has two tabs: <strong className="text-[var(--color-text)]">Single</strong> (step-through one string) and <strong className="text-[var(--color-text)]">Multi</strong> (batch test multiple strings).
              The panel is 192px tall on desktop and adapts to a compact mobile layout.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Single Mode — Controls</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-3">
              Type an input string in the input field and use these controls:
            </p>
            <KbdTable rows={[
              ['⌘ Enter', 'Start simulation — compute epsilon closure of initial state and enter stepping mode'],
              ['⌘ \'', 'Step — consume one input symbol, compute next states via transition function + epsilon closure'],
              ['⇧⌘ Enter', 'Fast Run — instantly compute final accept/reject result without stepping'],
              ['⌘ 0', 'Reset — clear simulation state, return to idle'],
            ]} />

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Single Mode — Visual Feedback</h3>
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

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">NFA Simulation Algorithm</h3>
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

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Multi-Run (Batch Testing)</h3>
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
          </section>

          {/* ────────────────────── AUTOMATON MODES ────────────────────── */}
          <section id="automaton-modes" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Automaton Modes</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              Switch modes using the toolbar buttons or number keys <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">1</kbd>–<kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">6</kbd> (7 and 8 switch to Grammar Editor and L-Systems).
              Switching modes preserves your states and transitions — the mode only affects how transitions are parsed, how simulation works, and what the properties panel displays. An undo snapshot is pushed when switching modes.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">DFA — Deterministic Finite Automaton (Key: 1)</h3>
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

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">NFA — Nondeterministic Finite Automaton (Key: 2)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Supports ε-transitions and nondeterminism. During simulation, all reachable configurations are tracked simultaneously:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ Multiple active states may be shown at once (all highlighted on canvas)</li>
              <li>→ Epsilon closures are computed automatically at each step</li>
              <li>→ If any branch reaches an accepting state after consuming all input, the string is accepted</li>
              <li>→ Dead branches (no transitions available) are silently dropped</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">PDA — Pushdown Automaton (Key: 3)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              PDA mode enables a full nondeterministic pushdown automaton simulator with stack visualization.
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-2">
              <li>→ <strong className="text-[var(--color-text)]">Transition format:</strong> <code className="text-[var(--color-accent)]">input, pop → push</code> — parsed using regex matching for the arrow (→ or -&gt;)</li>
              <li>→ <strong className="text-[var(--color-text)]">Stack initialization:</strong> The stack starts with a single symbol <code className="text-[var(--color-accent)]">Z</code> (the initial stack marker)</li>
              <li>→ <strong className="text-[var(--color-text)]">Push convention:</strong> When pushing <code className="text-[var(--color-accent)]">AZ</code>, the leftmost character (A) becomes the new top of stack. Characters are pushed in reverse order internally.</li>
              <li>→ <strong className="text-[var(--color-text)]">ε handling:</strong> Use ε for input (no symbol consumed), pop (no symbol popped), or push (nothing pushed)</li>
              <li>→ <strong className="text-[var(--color-text)]">Nondeterminism:</strong> All branches are explored simultaneously. Each configuration tracks its own state, input position, and stack independently.</li>
              <li>→ <strong className="text-[var(--color-text)]">Acceptance modes:</strong> Toggle between &quot;Final State&quot; (accepts when input consumed and in accepting state) and &quot;Empty Stack&quot; (accepts when input consumed and stack is empty) via buttons in the panel header</li>
              <li>→ <strong className="text-[var(--color-text)]">Stack visualization:</strong> A dedicated column on the right shows the stack of the first active configuration, with the top of stack highlighted in yellow</li>
              <li>→ <strong className="text-[var(--color-text)]">Configuration display:</strong> Each active config shows state label, input position, and stack contents (e.g., &quot;q1 pos:2 [AZZ]&quot;)</li>
              <li>→ <strong className="text-[var(--color-text)]">Safety limit:</strong> Maximum 10,000 total configurations to prevent infinite loops from ε-cycles</li>
              <li>→ <strong className="text-[var(--color-text)]">Fast Run:</strong> Runs up to 500 steps automatically</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">TM — Turing Machine (Key: 4)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              A single-tape, single-head Turing machine with configurable step limit.
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-2">
              <li>→ <strong className="text-[var(--color-text)]">Transition format:</strong> <code className="text-[var(--color-accent)]">read → write, direction</code> — direction is R (right), L (left), or S (stay). Also accepts <code className="text-[var(--color-accent)]">read/write,dir</code> format.</li>
              <li>→ <strong className="text-[var(--color-text)]">Wildcard:</strong> Use <code className="text-[var(--color-accent)]">*</code> as the read symbol to match any symbol; use <code className="text-[var(--color-accent)]">*</code> as the write symbol to keep the current symbol unchanged</li>
              <li>→ <strong className="text-[var(--color-text)]">Tape model:</strong> Infinite in both directions, implemented as a sparse Map from integer positions to symbols. The blank symbol is ⊔ (displayed in tape cells where no symbol has been written).</li>
              <li>→ <strong className="text-[var(--color-text)]">Tape visualization:</strong> Shows a window around the head position (±10 cells plus any written cells). The head position is marked with a ▼ indicator above the current cell, which is highlighted in accent color.</li>
              <li>→ <strong className="text-[var(--color-text)]">Step limit:</strong> Configurable in the header (default 1000). Prevents infinite loops. Editable via a number input.</li>
              <li>→ <strong className="text-[var(--color-text)]">History log:</strong> Every step is recorded with the action taken (e.g., &quot;Read &apos;a&apos;, write &apos;b&apos;, move R → q2&quot;). Shows step number, current state, head position, and step count.</li>
              <li>→ <strong className="text-[var(--color-text)]">Three outcomes:</strong> ACCEPTED (halts in accepting state), REJECTED (no applicable transition and not in accepting state), HALTED (step limit reached while still running)</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Mealy Machine (Key: 5)</h3>
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

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">Moore Machine (Key: 6)</h3>
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
          </section>

          {/* ────────────────────── CONVERSIONS ────────────────────── */}
          <section id="conversions" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Conversions</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              Open the conversions panel with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘M</kbd> or the CONVERT button in the toolbar. The panel has 6 tabs, each with its own step-through interface. All conversions support: ▶ Run (compute full result), ⏩ Step (advance one step), ⏭ Fast Forward (show all steps), and ↺ Reset.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">NFA → DFA (Subset Construction)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Converts the current NFA to an equivalent DFA using the standard subset construction algorithm. Requires the automaton to be in NFA mode.
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
              <li>→ <strong className="text-[var(--color-text)]">Algorithm:</strong> BFS starting from the ε-closure of the initial state. For each unprocessed subset and each alphabet symbol, compute the move set (states reachable on that symbol from any state in the subset) and take its ε-closure to get the resulting DFA state.</li>
              <li>→ <strong className="text-[var(--color-text)]">Step display:</strong> Each step shows δ(subset, symbol) = result, with &quot;NEW&quot; flagged for newly discovered subsets</li>
              <li>→ <strong className="text-[var(--color-text)]">State labels:</strong> DFA states are labeled with the set notation of their constituent NFA states, e.g., <code className="text-[var(--color-accent)]">{"{"}</code><code className="text-[var(--color-accent)]">q0,q1</code><code className="text-[var(--color-accent)]">{"}"}</code></li>
              <li>→ <strong className="text-[var(--color-text)]">Accepting:</strong> A DFA state is accepting if any of its constituent NFA states is accepting</li>
              <li>→ <strong className="text-[var(--color-text)]">Dead states:</strong> Empty move sets (no reachable states) are skipped rather than creating a trap state</li>
              <li>→ <strong className="text-[var(--color-text)]">Apply:</strong> Click APPLY to replace the canvas automaton with the resulting DFA (switches mode to DFA)</li>
              <li>→ <strong className="text-[var(--color-text)]">Layout:</strong> Result states are arranged in a circle with radius proportional to count</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">DFA Minimization (Table-Filling)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Minimizes the current DFA using the table-filling (Myhill-Nerode) algorithm. Requires DFA mode.
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
              <li>→ <strong className="text-[var(--color-text)]">Step 1 — Reachability:</strong> First removes unreachable states via BFS from the initial state</li>
              <li>→ <strong className="text-[var(--color-text)]">Step 2 — Base case:</strong> All (accepting, non-accepting) pairs are marked as distinguishable (round 0)</li>
              <li>→ <strong className="text-[var(--color-text)]">Step 3 — Refinement:</strong> Iteratively: for each unmarked pair (p, q), if δ(p, a) and δ(q, a) are distinguishable for any symbol a, mark (p, q) as distinguishable. Repeat until no changes.</li>
              <li>→ <strong className="text-[var(--color-text)]">Step 4 — Merge:</strong> Unmarked pairs are equivalent. Uses Union-Find to merge equivalent states (prefers initial state as representative).</li>
              <li>→ <strong className="text-[var(--color-text)]">Step display:</strong> Each step shows: ✗ (stateA, stateB) with the reason (e.g., &quot;On &apos;a&apos;: q0→q1, q2→q3 (distinguishable)&quot;)</li>
              <li>→ <strong className="text-[var(--color-text)]">Result:</strong> Reports how many states were removed. If already minimal, shows &quot;DFA is already minimal!&quot;</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">RE → NFA (Thompson&apos;s Construction)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Enter a regular expression and convert it to an NFA using Thompson&apos;s construction.
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
              <li>→ <strong className="text-[var(--color-text)]">Supported syntax:</strong> Literals (a-z, 0-9, any non-special character), <code className="text-[var(--color-accent)]">|</code> (union), <code className="text-[var(--color-accent)]">*</code> (Kleene star), <code className="text-[var(--color-accent)]">+</code> (one or more), <code className="text-[var(--color-accent)]">?</code> (optional), <code className="text-[var(--color-accent)]">()</code> groups, <code className="text-[var(--color-accent)]">ε</code> or <code className="text-[var(--color-accent)]">ϵ</code> (epsilon), and <code className="text-[var(--color-accent)]">\</code> for escaping special characters</li>
              <li>→ <strong className="text-[var(--color-text)]">Parser:</strong> Recursive descent with precedence: union &lt; concatenation &lt; Kleene/quantifiers &lt; atoms</li>
              <li>→ <strong className="text-[var(--color-text)]">Construction:</strong> Each operation creates a fragment (start state, end state, internal transitions). Concatenation merges end/start states; union adds new start/end with ε-transitions to both branches; star adds ε-loops.</li>
              <li>→ <strong className="text-[var(--color-text)]">Step display:</strong> Each step describes the fragment built: &quot;Symbol &apos;a&apos;: q0 → q1&quot;, &quot;Union: q4 → (q0|q2) → q5&quot;, &quot;Star(*): q6 → q0...q3 → q7&quot;</li>
              <li>→ <strong className="text-[var(--color-text)]">Error handling:</strong> Parse errors are displayed in red (e.g., &quot;Unexpected character at position 5&quot;)</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">FA → RE (State Elimination)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Converts the current finite automaton to a regular expression using the GNFA state elimination method.
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
              <li>→ <strong className="text-[var(--color-text)]">GNFA setup:</strong> Adds a new start state (with ε to original initial) and a new accept state (ε from all original accepting states). Transitions are stored as regex edge labels.</li>
              <li>→ <strong className="text-[var(--color-text)]">Elimination:</strong> Each original state is eliminated one by one. For every pair (p, q) where p→eliminated and eliminated→q exist, a new edge p→q is created with label: R_in · R_self* · R_out (where R_self is the self-loop if it exists).</li>
              <li>→ <strong className="text-[var(--color-text)]">Step display:</strong> Each step shows which state was eliminated and how many edges were updated</li>
              <li>→ <strong className="text-[var(--color-text)]">Result:</strong> The final regex is the label on the edge from GNFA start to GNFA accept. A COPY RE button copies it to clipboard. Basic simplification removes redundant ε concatenations.</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">FA → Grammar</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Generates a right-linear grammar from the current finite automaton.
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
              <li>→ <strong className="text-[var(--color-text)]">Non-terminal mapping:</strong> The initial state maps to S; other states map to A, B, C, ... (or their label uppercased if single-char)</li>
              <li>→ <strong className="text-[var(--color-text)]">Production rules:</strong> For each transition from→to on symbol: Head → symbol Body. For ε-transitions: Head → Body.</li>
              <li>→ <strong className="text-[var(--color-text)]">Accepting states:</strong> For each accepting state, add Head → ε</li>
              <li>→ <strong className="text-[var(--color-text)]">Output:</strong> Productions displayed with start symbol indicated. COPY GRAMMAR button copies in standard notation.</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Combine (DFA Operations)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Combine the canvas DFA (automaton A) with a second automaton B (specified as a regular expression). Requires DFA mode.
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
              <li>→ <strong className="text-[var(--color-text)]">∪ Union</strong> — accepts strings in A or B. Accepting condition: accept_A OR accept_B.</li>
              <li>→ <strong className="text-[var(--color-text)]">∩ Intersection</strong> — accepts strings in both A and B. Accepting condition: accept_A AND accept_B.</li>
              <li>→ <strong className="text-[var(--color-text)]">− Difference</strong> — accepts strings in A but not B. Accepting condition: accept_A AND NOT accept_B.</li>
              <li>→ <strong className="text-[var(--color-text)]">¬ Complement</strong> — flips accepting states of A (only A needed, ignores B). Both DFAs are first completed with a trap state for missing transitions.</li>
              <li>→ <strong className="text-[var(--color-text)]">Product construction:</strong> For binary ops, B is built from the RE input via RE→NFA→DFA pipeline. Then BFS explores product states (stateA, stateB), computing transitions for each alphabet symbol.</li>
              <li>→ <strong className="text-[var(--color-text)]">DFA completion:</strong> Before product construction, both DFAs are automatically completed by adding a trap state (labeled ∅) with self-loops for all missing (state, symbol) pairs.</li>
              <li>→ <strong className="text-[var(--color-text)]">Step display:</strong> Each step shows δ(pair, symbol) = result, with NEW flags for newly discovered product states</li>
            </ul>

            <Screenshot id="conversions" description="Conversions panel — NFA→DFA, Minimize, RE, Grammar tools" src="/docs/conversions.png" />
          </section>

          {/* ────────────────────── GRAMMAR EDITOR ────────────────────── */}
          <section id="grammar-editor" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Grammar Editor</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">7</kbd> or click <strong className="text-[var(--color-text)]">CFG</strong> in the toolbar to open the grammar editor. It replaces the canvas with a split-pane view: grammar text editor on the left (320px wide on desktop, 40% height on mobile), tools panel on the right.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Grammar Syntax</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ Write productions with <code className="text-[var(--color-accent)]">→</code>, <code className="text-[var(--color-accent)]">-&gt;</code>, or <code className="text-[var(--color-accent)]">::=</code> as the arrow</li>
              <li>→ Use <code className="text-[var(--color-accent)]">|</code> for alternatives on the same line: <code className="text-[var(--color-accent)]">S → aSb | ε</code></li>
              <li>→ Use <code className="text-[var(--color-accent)]">ε</code>, <code className="text-[var(--color-accent)]">eps</code>, <code className="text-[var(--color-accent)]">epsilon</code>, or <code className="text-[var(--color-accent)]">ϵ</code> for the empty string</li>
              <li>→ Lines starting with <code className="text-[var(--color-accent)]">#</code> or <code className="text-[var(--color-accent)]">//</code> are treated as comments and ignored</li>
              <li>→ Multi-character non-terminals can be written in angle brackets: <code className="text-[var(--color-accent)]">&lt;Expr&gt;</code></li>
              <li>→ Uppercase single letters are non-terminals; everything else (lowercase, digits, symbols) are terminals</li>
              <li>→ The first production&apos;s head becomes the start symbol</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Built-in Examples</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Load from the dropdown:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Simple CFG (aⁿbⁿ):</strong> <code className="text-[var(--color-accent)]">S → aSb | ε</code></li>
              <li>→ <strong className="text-[var(--color-text)]">Arithmetic:</strong> <code className="text-[var(--color-accent)]">E → E+T | T; T → T*F | F; F → (E) | a</code></li>
              <li>→ <strong className="text-[var(--color-text)]">Balanced Parens:</strong> <code className="text-[var(--color-accent)]">S → (S)S | ε</code></li>
              <li>→ <strong className="text-[var(--color-text)]">Palindrome:</strong> <code className="text-[var(--color-accent)]">S → aSa | bSb | a | b | ε</code></li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Grammar Classification</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              The grammar is automatically classified and shown in the header:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ <span className="text-[var(--color-accept)]">Regular</span> — right-linear: each body is a single terminal, a terminal followed by a non-terminal, or ε</li>
              <li>→ <span className="text-[var(--color-accent)]">Context-Free</span> — head is a single non-terminal, body is unrestricted</li>
              <li>→ <span className="text-[var(--color-sim-active)]">Context-Sensitive</span> — |head| ≤ |body| for all productions (except S → ε)</li>
              <li>→ <span className="text-[var(--color-reject)]">Unrestricted</span> — none of the above constraints hold</li>
            </ul>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mt-2">
              The stats bar shows: Σ (terminals), V (non-terminals), and production count.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Transforms</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Five standard grammar transformations, each with step-by-step explanations:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-2 list-none">
              <li>
                → <strong className="text-[var(--color-text)]">Remove ε-productions:</strong> Finds all nullable non-terminals (those that can derive ε). For each production containing nullable symbols, generates all combinations with those symbols optionally removed. If the start symbol was nullable, re-adds S → ε.
              </li>
              <li>
                → <strong className="text-[var(--color-text)]">Remove unit productions:</strong> Finds all unit pairs (A, B) where A ⇒* B through unit productions. Replaces each unit chain with direct productions. E.g., if A → B and B → ab, creates A → ab.
              </li>
              <li>
                → <strong className="text-[var(--color-text)]">Remove useless symbols:</strong> Two phases: (1) Remove non-generating symbols (those that can never derive a terminal string), (2) Remove unreachable symbols (those not reachable from the start symbol).
              </li>
              <li>
                → <strong className="text-[var(--color-text)]">Convert to CNF</strong> (Chomsky Normal Form): First applies ε-removal, unit-removal, and useless-removal. Then: (TERM) replaces terminals in bodies of length &gt; 1 with fresh non-terminals, (BIN) breaks productions with &gt; 2 body symbols into chains of binary productions.
              </li>
              <li>
                → <strong className="text-[var(--color-text)]">Convert to GNF</strong> (Greibach Normal Form): First converts to CNF, then applies a forward pass (substitute lower-ordered non-terminals, remove left recursion by introducing primed non-terminals) and a backward pass (back-substitute so all productions start with a terminal).
              </li>
            </ul>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mt-2">
              Each transform shows intermediate productions at each step. Click <strong className="text-[var(--color-text)]">APPLY TO EDITOR</strong> to replace the grammar text with the result.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">CYK Parser</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              The Cocke-Younger-Kasami algorithm for parsing context-free grammars.
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Auto-CNF:</strong> If the grammar is not in CNF, it is automatically converted first</li>
              <li>→ <strong className="text-[var(--color-text)]">Empty string:</strong> Handled specially — checks if S → ε exists in the grammar</li>
              <li>→ <strong className="text-[var(--color-text)]">Table display:</strong> Shows the triangular CYK table where cell [l][i] contains the set of non-terminals that derive the substring from position i with length l+1. Populated cells show non-terminals in accent color; empty cells show ∅.</li>
              <li>→ <strong className="text-[var(--color-text)]">Parse tree:</strong> If accepted, a parse tree is reconstructed via backtracking and displayed as an interactive collapsible tree (click non-terminal nodes to expand/collapse)</li>
              <li>→ <strong className="text-[var(--color-text)]">Steps:</strong> Each step shows which substring was analyzed and what non-terminals were found</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">LL(1) Parser</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              A predictive top-down parser using FIRST and FOLLOW sets.
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ <strong className="text-[var(--color-text)]">FIRST sets:</strong> Computed iteratively until fixpoint. For each non-terminal, determines which terminals can appear as the first symbol of strings derived from it.</li>
              <li>→ <strong className="text-[var(--color-text)]">FOLLOW sets:</strong> Computed iteratively. For each non-terminal, determines which terminals can appear immediately after it in some derivation. Start symbol always has $ in its FOLLOW set.</li>
              <li>→ <strong className="text-[var(--color-text)]">Parse table:</strong> Displayed as a grid with non-terminals as rows and terminals (plus $) as columns. Each cell shows the production to apply, or &quot;-&quot; for empty.</li>
              <li>→ <strong className="text-[var(--color-text)]">Conflicts:</strong> If multiple productions map to the same (non-terminal, terminal) cell, conflicts are listed in red. The grammar is not LL(1) if conflicts exist.</li>
              <li>→ <strong className="text-[var(--color-text)]">Parse steps:</strong> A table shows each parsing step with: Stack, Input (remaining), and Action (match terminal or apply production). Limited to 500 steps.</li>
              <li>→ <strong className="text-[var(--color-text)]">Parse tree:</strong> If successful, an interactive collapsible parse tree is displayed</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Brute Force Parser</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              A BFS exhaustive search parser that works with any grammar type.
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ <strong className="text-[var(--color-text)]">Algorithm:</strong> Starting from the start symbol, applies leftmost derivation: finds the leftmost non-terminal and tries all applicable productions. BFS ensures the shortest derivation is found first.</li>
              <li>→ <strong className="text-[var(--color-text)]">Pruning:</strong> Derivations exceeding the max depth (15) are pruned. Sentential forms with more than input.length + 5 terminals are also pruned. Visited forms are tracked to avoid cycles.</li>
              <li>→ <strong className="text-[var(--color-text)]">Output:</strong> If accepted, shows the leftmost derivation as a sequence: S ⇒ aSb ⇒ aabb</li>
              <li>→ <strong className="text-[var(--color-text)]">Limitations:</strong> Slow for large grammars or long strings due to exponential search space. Best for small examples.</li>
            </ul>

            <Screenshot id="grammar-editor" description="Grammar editor — CFG transforms panel with grammar loaded" src="/docs/grammar-editor.png" />
          </section>

          {/* ────────────────────── L-SYSTEMS ────────────────────── */}
          <section id="l-systems" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">L-Systems</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">8</kbd> or click <strong className="text-[var(--color-text)]">L-SYS</strong> in the toolbar. The L-system view shows controls on the left (264px on desktop, 35% on mobile) and a real-time turtle graphics canvas on the right, rendered using HTML Canvas 2D with device pixel ratio scaling.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">How L-Systems Work</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              An L-system (Lindenmayer system) defines a string rewriting system:
            </p>
            <ol className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-decimal list-inside mb-3">
              <li>Start with an <strong className="text-[var(--color-text)]">axiom</strong> (initial string)</li>
              <li>Apply <strong className="text-[var(--color-text)]">production rules</strong> simultaneously to every character in the string</li>
              <li>Repeat for the specified number of <strong className="text-[var(--color-text)]">iterations</strong></li>
              <li>Interpret the final string as <strong className="text-[var(--color-text)]">turtle graphics</strong> drawing commands</li>
            </ol>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Turtle Graphics Commands</h3>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Command</th>
                    <th className="text-left py-2 text-[var(--color-text-dim)] font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--color-text)]">
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">F, G</td>
                    <td className="py-1.5">Draw forward one unit (also 1, 6, 7, 8, 9 for Penrose tiling)</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">f</td>
                    <td className="py-1.5">Move forward without drawing (pen up)</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">+</td>
                    <td className="py-1.5">Turn right by the specified angle</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">-</td>
                    <td className="py-1.5">Turn left by the specified angle</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">[</td>
                    <td className="py-1.5">Push current position and direction onto stack (save state)</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">]</td>
                    <td className="py-1.5">Pop position and direction from stack (restore state)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
              The turtle starts at (0, 0) pointing upward (−π/2 radians). The drawing is automatically scaled and centered to fit the canvas with 20px padding.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Built-in Presets</h3>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Preset</th>
                    <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Axiom</th>
                    <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Angle</th>
                    <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Iterations</th>
                    <th className="text-left py-2 text-[var(--color-text-dim)] font-medium">Rules</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--color-text)]">
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">Koch Curve</td>
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">F</td>
                    <td className="py-1.5 pr-4">90°</td>
                    <td className="py-1.5 pr-4">3</td>
                    <td className="py-1.5 text-[var(--color-text-dim)]">F=F+F-F-F+F</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">Sierpinski Triangle</td>
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">F-G-G</td>
                    <td className="py-1.5 pr-4">120°</td>
                    <td className="py-1.5 pr-4">4</td>
                    <td className="py-1.5 text-[var(--color-text-dim)]">F=F-G+F+G-F, G=GG</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">Dragon Curve</td>
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">FX</td>
                    <td className="py-1.5 pr-4">90°</td>
                    <td className="py-1.5 pr-4">10</td>
                    <td className="py-1.5 text-[var(--color-text-dim)]">X=X+YF+, Y=-FX-Y</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">Plant</td>
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">X</td>
                    <td className="py-1.5 pr-4">25°</td>
                    <td className="py-1.5 pr-4">5</td>
                    <td className="py-1.5 text-[var(--color-text-dim)]">X=F+[[X]-X]-F[-FX]+X, F=FF</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">Hilbert Curve</td>
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">A</td>
                    <td className="py-1.5 pr-4">90°</td>
                    <td className="py-1.5 pr-4">4</td>
                    <td className="py-1.5 text-[var(--color-text-dim)]">A=-BF+AFA+FB-, B=+AF-BFB-FA+</td>
                  </tr>
                  <tr className="border-b border-[var(--color-border)]/30">
                    <td className="py-1.5 pr-4">Penrose Tiling (P3)</td>
                    <td className="py-1.5 pr-4 text-[var(--color-accent)]">[7]++[7]++[7]++[7]++[7]</td>
                    <td className="py-1.5 pr-4">36°</td>
                    <td className="py-1.5 pr-4">4</td>
                    <td className="py-1.5 text-[var(--color-text-dim)]">4 rules for digits 6-9</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Custom Rules</h3>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
              <li>→ Set the <strong className="text-[var(--color-text)]">axiom</strong> (starting string) in the Axiom field</li>
              <li>→ Set the <strong className="text-[var(--color-text)]">angle</strong> in degrees (used by + and - commands)</li>
              <li>→ Define <strong className="text-[var(--color-text)]">rules</strong> one per line in <code className="text-[var(--color-accent)]">X=replacement</code> format (e.g., <code className="text-[var(--color-accent)]">F=F+F-F-F+F</code>)</li>
              <li>→ Adjust <strong className="text-[var(--color-text)]">iterations</strong> with the slider (0–10) or ◀/▶ buttons</li>
              <li>→ <strong className="text-[var(--color-text)]">Safety limit:</strong> String generation is capped at 500,000 characters to prevent browser freeze</li>
              <li>→ The rendering updates in real-time as you change any parameter</li>
              <li>→ Characters without rules are passed through unchanged (useful for structural symbols like X, Y)</li>
            </ul>

            <Screenshot id="l-systems" description="L-Systems — Koch Curve fractal rendered at 3 iterations" src="/docs/l-system.png" />
          </section>

          {/* ────────────────────── PROPERTIES PANEL ────────────────────── */}
          <section id="properties-panel" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Properties Panel</h2>

            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
              The right sidebar (264px wide on desktop) shows properties and is toggled with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘/</kbd>. On desktop, it animates width with a 200ms ease-out transition for smooth canvas resize. On mobile, it slides in as a drawer overlay (max 85vw) with a close button.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Formal Definition</h3>
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

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Transition Table (δ)</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              A compact table listing every transition. Each row shows:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ From state → To state, with symbols in accent color</li>
              <li>→ Click any row to select that transition on the canvas (highlights the edge)</li>
              <li>→ The currently selected transition is shown in accent color</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Selected State/Transition</h3>
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

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Trap State</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              For DFA/NFA modes, a &quot;+ Add Trap State&quot; button appears when there are states. This automatically:
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

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">DFA Validation Errors</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              In DFA mode, the panel shows an &quot;Errors&quot; section in red for any violations:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ &quot;Multiple initial states&quot; — if more than one state has isInitial=true</li>
              <li>→ &quot;ε-transition from qN&quot; — for each state that has an epsilon transition</li>
              <li>→ &quot;qN: multiple on &apos;a&apos;&quot; — for each state that has multiple transitions on the same symbol (nondeterminism)</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">States List</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
              At the bottom, a scrollable list of all states. Each shows: a circle icon (filled if accepting), the label, a &quot;START&quot; badge for initial states, and an &quot;ACCEPT&quot; badge for accepting states. Click any state to select it on the canvas.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Mobile Actions</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
              On mobile, the sidebar includes action buttons not available in the compact toolbar: SHARE, LAYOUT, CLEAR, EXPORT, and IMPORT. These mirror the desktop toolbar functionality.
            </p>
          </section>

          {/* ────────────────────── IMPORT/EXPORT ────────────────────── */}
          <section id="import-export" className="mb-16">
            <h2 className="text-lg font-bold tracking-wider mb-4 text-[var(--color-text-bright)]">Import/Export &amp; Sharing</h2>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">URL Sharing</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Your automaton is automatically encoded in the URL hash on every change. The encoding includes all state positions, labels, flags (initial/accepting), transitions with symbols, and the current mode. Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘S</kbd> or click <strong className="text-[var(--color-text)]">SHARE</strong> to copy the full URL to clipboard. Anyone opening the URL will see your exact automaton with identical layout.
            </p>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">JSON Export</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
              Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘E</kbd> to download your automaton as a JSON file. The format is:
            </p>
            <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
              <li>→ <code className="text-[var(--color-accent)]">_format: &quot;stateforge-v1&quot;</code> — format identifier</li>
              <li>→ <code className="text-[var(--color-accent)]">mode</code> — automaton type (dfa, nfa, pda, tm, mealy, moore)</li>
              <li>→ <code className="text-[var(--color-accent)]">states</code> — array of state objects with id, label, x, y, isInitial, isAccepting</li>
              <li>→ <code className="text-[var(--color-accent)]">transitions</code> — array of transition objects with id, from, to, symbols array</li>
              <li>→ File is named <code className="text-[var(--color-accent)]">stateforge-MODE.json</code> (e.g., stateforge-dfa.json)</li>
            </ul>

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Import</h3>
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

            <h3 className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Auto-Save</h3>
            <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
              Your work is automatically saved to localStorage via Zustand&apos;s subscription mechanism. On reload, it restores your last automaton (states, transitions, mode, viewport). The URL hash takes priority over localStorage if present — this means opening a shared link always loads that specific automaton regardless of what was saved locally.
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
