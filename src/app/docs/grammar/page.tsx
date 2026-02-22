'use client';

import { Screenshot } from '@/components/docs/Screenshot';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function GrammarPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider mb-6 text-[var(--color-text-bright)]">Grammar Editor</h1>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
        Press <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">7</kbd> or click <strong className="text-[var(--color-text)]">CFG</strong> in the toolbar to open the grammar editor. It replaces the canvas with a split-pane view: grammar text editor on the left (320px wide on desktop, 40% height on mobile), tools panel on the right.
      </p>

      <h2 id="grammar-syntax" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Grammar Syntax</h2>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none">
        <li>→ Write productions with <code className="text-[var(--color-accent)]">→</code>, <code className="text-[var(--color-accent)]">-&gt;</code>, or <code className="text-[var(--color-accent)]">::=</code> as the arrow</li>
        <li>→ Use <code className="text-[var(--color-accent)]">|</code> for alternatives on the same line: <code className="text-[var(--color-accent)]">S → aSb | ε</code></li>
        <li>→ Use <code className="text-[var(--color-accent)]">ε</code>, <code className="text-[var(--color-accent)]">eps</code>, <code className="text-[var(--color-accent)]">epsilon</code>, or <code className="text-[var(--color-accent)]">ϵ</code> for the empty string</li>
        <li>→ Lines starting with <code className="text-[var(--color-accent)]">#</code> or <code className="text-[var(--color-accent)]">//</code> are treated as comments and ignored</li>
        <li>→ {"Multi-character non-terminals can be written in angle brackets: "}<code className="text-[var(--color-accent)]">{"<Expr>"}</code></li>
        <li>→ Uppercase single letters are non-terminals; everything else (lowercase, digits, symbols) are terminals</li>
        <li>→ The first production&apos;s head becomes the start symbol</li>
      </ul>

      <h2 id="built-in-examples" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Built-in Examples</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Load from the dropdown:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
        <li>→ <strong className="text-[var(--color-text)]">Simple CFG (aⁿbⁿ):</strong> <code className="text-[var(--color-accent)]">S → aSb | ε</code></li>
        <li>→ <strong className="text-[var(--color-text)]">Arithmetic:</strong> <code className="text-[var(--color-accent)]">{"E → E+T | T; T → T*F | F; F → (E) | a"}</code></li>
        <li>→ <strong className="text-[var(--color-text)]">Balanced Parens:</strong> <code className="text-[var(--color-accent)]">S → (S)S | ε</code></li>
        <li>→ <strong className="text-[var(--color-text)]">Palindrome:</strong> <code className="text-[var(--color-accent)]">S → aSa | bSb | a | b | ε</code></li>
      </ul>

      <h2 id="grammar-classification" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Grammar Classification</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        The grammar is automatically classified and shown in the header:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
        <li>→ <span className="text-[var(--color-accept)]">Regular</span> — right-linear: each body is a single terminal, a terminal followed by a non-terminal, or ε</li>
        <li>→ <span className="text-[var(--color-accent)]">Context-Free</span> — head is a single non-terminal, body is unrestricted</li>
        <li>→ Context-Sensitive — |head| ≤ |body| for all productions (except S → ε)</li>
        <li>→ <span className="text-[var(--color-reject)]">Unrestricted</span> — none of the above constraints hold</li>
      </ul>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mt-2">
        The stats bar shows: Σ (terminals), V (non-terminals), and production count.
      </p>

      <h2 id="transforms" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Transforms</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Five standard grammar transformations, each with step-by-step explanations:
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-2 list-none">
        <li>
          → <strong className="text-[var(--color-text)]">Remove ε-productions:</strong> Finds all nullable non-terminals (those that can derive ε). For each production containing nullable symbols, generates all combinations with those symbols optionally removed. If the start symbol was nullable, re-adds S → ε.
        </li>
        <li>
          → <strong className="text-[var(--color-text)]">Remove unit productions:</strong> {"Finds all unit pairs (A, B) where A ⇒* B through unit productions. Replaces each unit chain with direct productions. E.g., if A → B and B → ab, creates A → ab."}
        </li>
        <li>
          → <strong className="text-[var(--color-text)]">Remove useless symbols:</strong> Two phases: (1) Remove non-generating symbols (those that can never derive a terminal string), (2) Remove unreachable symbols (those not reachable from the start symbol).
        </li>
        <li>
          → <strong className="text-[var(--color-text)]">Convert to CNF</strong> (Chomsky Normal Form): {"First applies ε-removal, unit-removal, and useless-removal. Then: (TERM) replaces terminals in bodies of length > 1 with fresh non-terminals, (BIN) breaks productions with > 2 body symbols into chains of binary productions."}
        </li>
        <li>
          → <strong className="text-[var(--color-text)]">Convert to GNF</strong> (Greibach Normal Form): First converts to CNF, then applies a forward pass (substitute lower-ordered non-terminals, remove left recursion by introducing primed non-terminals) and a backward pass (back-substitute so all productions start with a terminal).
        </li>
      </ul>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mt-2">
        Each transform shows intermediate productions at each step. Click <strong className="text-[var(--color-text)]">APPLY TO EDITOR</strong> to replace the grammar text with the result.
      </p>

      <h2 id="cyk-parser" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">CYK Parser</h2>
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

      <h2 id="ll1-parser" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">LL(1) Parser</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        A predictive top-down parser using FIRST and FOLLOW sets.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none">
        <li>→ <strong className="text-[var(--color-text)]">FIRST sets:</strong> Computed iteratively until fixpoint. For each non-terminal, determines which terminals can appear as the first symbol of strings derived from it.</li>
        <li>→ <strong className="text-[var(--color-text)]">FOLLOW sets:</strong> Computed iteratively. For each non-terminal, determines which terminals can appear immediately after it in some derivation. Start symbol always has $ in its FOLLOW set.</li>
        <li>→ <strong className="text-[var(--color-text)]">Parse table:</strong> {"Displayed as a grid with non-terminals as rows and terminals (plus $) as columns. Each cell shows the production to apply, or \"-\" for empty."}</li>
        <li>→ <strong className="text-[var(--color-text)]">Conflicts:</strong> If multiple productions map to the same (non-terminal, terminal) cell, conflicts are listed in red. The grammar is not LL(1) if conflicts exist.</li>
        <li>→ <strong className="text-[var(--color-text)]">Parse steps:</strong> A table shows each parsing step with: Stack, Input (remaining), and Action (match terminal or apply production). Limited to 500 steps.</li>
        <li>→ <strong className="text-[var(--color-text)]">Parse tree:</strong> If successful, an interactive collapsible parse tree is displayed</li>
      </ul>

      <h2 id="brute-force-parser" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Brute Force Parser</h2>
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

      <DocsPrevNext />
    </>
  );
}
