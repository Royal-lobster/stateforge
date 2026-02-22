'use client';

import { Screenshot } from '@/components/docs/Screenshot';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function CanvasPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider mb-6 text-[var(--color-text-bright)]">Canvas &amp; States</h1>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
        The canvas is an infinite SVG workspace rendered on a 20px dot grid. It uses a transform-based coordinate system where all state positions are stored in &quot;world&quot; coordinates, and the viewport is controlled by pan (translation) and zoom (scale) values.
      </p>

      <h2 id="viewport-controls" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Viewport Controls</h2>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ <strong className="text-[var(--color-text)]">Pan:</strong> Hold <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Space</kbd> + drag, or use middle mouse button. On mobile, drag on empty canvas area with one finger</li>
        <li>→ <strong className="text-[var(--color-text)]">Zoom:</strong> Scroll wheel (zooms toward cursor position). On mobile, pinch with two fingers. Zoom range: 25% to 300%</li>
        <li>→ <strong className="text-[var(--color-text)]">Zoom to Fit:</strong> Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘1</kbd> to frame all states with 80px padding, clamped between 50%–250% zoom</li>
        <li>→ The current zoom percentage is shown in the bottom-right corner of the canvas</li>
        <li>→ Two-finger gestures on mobile support simultaneous pan and zoom</li>
      </ul>

      <h2 id="adding-states" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Adding States</h2>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ <strong className="text-[var(--color-text)]">Double-click</strong> empty canvas in pointer mode — adds a state at that world coordinate</li>
        <li>→ Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">S</kbd> for Add State tool, then click anywhere to place (cursor changes to crosshair)</li>
        <li>→ Right-click empty canvas → &quot;Add State Here&quot; from context menu</li>
        <li>→ The first state added is automatically set as initial (shown with an incoming arrow)</li>
        <li>→ States are labeled q0, q1, q2… automatically with an incrementing counter</li>
        <li>→ States are rendered as 28px-radius squares (not circles) with a 1.5px border</li>
        <li>→ When only one state exists, the canvas auto-centers on it</li>
      </ul>

      <h2 id="editing-states" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Editing States</h2>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ <strong className="text-[var(--color-text)]">Double-click</strong> a state to rename it — an inline text input appears centered on the state</li>
        <li>→ <strong className="text-[var(--color-text)]">Right-click</strong> a state for context menu: Set Initial, Set Accepting, Rename, Delete</li>
        <li>→ On mobile, <strong className="text-[var(--color-text)]">long-press</strong> (500ms) opens a bottom sheet context menu with the same options</li>
        <li>→ Initial states show an incoming arrow (30px long) from the left; accepting states show an outer square border (4px larger than the state)</li>
        <li>→ State labels longer than 10 characters are truncated with an ellipsis; font size scales down for labels longer than 6 characters (minimum 9px)</li>
        <li>→ Setting a state as initial automatically unsets any other initial state (only one allowed)</li>
      </ul>

      <h2 id="selection" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Selection</h2>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ <strong className="text-[var(--color-text)]">Click</strong> a state to select it (shown with accent color border and glow filter)</li>
        <li>→ <strong className="text-[var(--color-text)]">Shift+Click</strong> to add to / toggle selection (multi-select)</li>
        <li>→ <strong className="text-[var(--color-text)]">Click+Drag</strong> on empty space for box select — a dashed rectangle appears and selects all states within</li>
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘A</kbd> to select all states</li>
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Esc</kbd> to deselect everything and close editors</li>
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Del</kbd> or <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">Backspace</kbd> to delete all selected states and their connected transitions</li>
        <li>→ Clicking a transition edge or label also selects it (shown in accent color); clicking empty space deselects</li>
      </ul>

      <h2 id="dragging-layout" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Dragging &amp; Layout</h2>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ Drag states to reposition them — multi-select drag moves all selected states together</li>
        <li>→ Dragging pushes an undo snapshot on first pixel moved (not on every frame), so undo restores original positions</li>
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⇧⌘L</kbd> — Auto Layout: arranges all states in a circle centered at (400, 300) with radius proportional to state count (minimum 120px, 40px per state). Automatically calls Zoom to Fit after 50ms</li>
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘1</kbd> — Zoom to Fit: calculates bounding box of all states, adds 80px padding, and sets zoom/pan to frame everything</li>
      </ul>

      <h2 id="undo-redo" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Undo / Redo</h2>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘Z</kbd> — Undo (up to 50 snapshots in the undo stack)</li>
        <li>→ <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘⇧Z</kbd> — Redo</li>
        <li>→ Snapshots capture states, transitions, and mode. Any mutating action (add state, delete, rename, toggle initial/accepting, change mode, etc.) pushes an undo snapshot and clears the redo stack</li>
        <li>→ Moving states only pushes a snapshot once per drag operation (not every frame)</li>
      </ul>

      <Screenshot id="canvas-states" description="Canvas with states, transitions, initial arrow, and context menu" src="/docs/context-menu.png" />

      <DocsPrevNext />
    </>
  );
}
