'use client';

import { Screenshot } from '@/components/docs/Screenshot';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function LSystemsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider mb-6 text-[var(--color-text-bright)]">L-Systems</h1>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
        Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">8</kbd> or click <strong className="text-[var(--color-text)]">L-SYS</strong> in the toolbar. The L-system view shows controls on the left (264px on desktop, 35% on mobile) and a real-time turtle graphics canvas on the right, rendered using HTML Canvas 2D with device pixel ratio scaling.
      </p>

      <h2 id="how-l-systems-work" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">How L-Systems Work</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        An L-system (Lindenmayer system) defines a string rewriting system:
      </p>
      <ol className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-decimal list-inside mb-3">
        <li>Start with an <strong className="text-[var(--color-text)]">axiom</strong> (initial string)</li>
        <li>Apply <strong className="text-[var(--color-text)]">production rules</strong> simultaneously to every character in the string</li>
        <li>Repeat for the specified number of <strong className="text-[var(--color-text)]">iterations</strong></li>
        <li>Interpret the final string as <strong className="text-[var(--color-text)]">turtle graphics</strong> drawing commands</li>
      </ol>

      <h2 id="turtle-commands" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Turtle Graphics Commands</h2>
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

      <h2 id="presets" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Built-in Presets</h2>
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
              <td className="py-1.5 text-[var(--color-text-dim)]">{"X=F+[[X]-X]-F[-FX]+X, F=FF"}</td>
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
              <td className="py-1.5 pr-4 text-[var(--color-accent)]">{"[7]++[7]++[7]++[7]++[7]"}</td>
              <td className="py-1.5 pr-4">36°</td>
              <td className="py-1.5 pr-4">4</td>
              <td className="py-1.5 text-[var(--color-text-dim)]">4 rules for digits 6-9</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="custom-rules" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Custom Rules</h2>
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

      <DocsPrevNext />
    </>
  );
}
