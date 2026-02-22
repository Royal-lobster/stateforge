'use client';

import { Screenshot } from '@/components/docs/Screenshot';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function ConversionsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-wider mb-6 text-[var(--color-text-bright)]">Conversions</h1>

      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
        Open the conversions panel with <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 text-[var(--color-accent)] text-[11px]">⌘M</kbd> or the CONVERT button in the toolbar. The panel has 6 tabs, each with its own step-through interface. All conversions support: ▶ Run (compute full result), ⏩ Step (advance one step), ⏭ Fast Forward (show all steps), and ↺ Reset.
      </p>

      <h2 id="nfa-to-dfa" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">NFA → DFA (Subset Construction)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Converts the current NFA to an equivalent DFA using the standard subset construction algorithm. Requires the automaton to be in NFA mode.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
        <li>→ <strong className="text-[var(--color-text)]">Algorithm:</strong> BFS starting from the ε-closure of the initial state. For each unprocessed subset and each alphabet symbol, compute the move set (states reachable on that symbol from any state in the subset) and take its ε-closure to get the resulting DFA state.</li>
        <li>→ <strong className="text-[var(--color-text)]">Step display:</strong> {"Each step shows δ(subset, symbol) = result, with \"NEW\" flagged for newly discovered subsets"}</li>
        <li>→ <strong className="text-[var(--color-text)]">State labels:</strong> DFA states are labeled with the set notation of their constituent NFA states, e.g., <code className="text-[var(--color-accent)]">{"{"}</code><code className="text-[var(--color-accent)]">q0,q1</code><code className="text-[var(--color-accent)]">{"}"}</code></li>
        <li>→ <strong className="text-[var(--color-text)]">Accepting:</strong> A DFA state is accepting if any of its constituent NFA states is accepting</li>
        <li>→ <strong className="text-[var(--color-text)]">Dead states:</strong> Empty move sets (no reachable states) are skipped rather than creating a trap state</li>
        <li>→ <strong className="text-[var(--color-text)]">Apply:</strong> Click APPLY to replace the canvas automaton with the resulting DFA (switches mode to DFA)</li>
        <li>→ <strong className="text-[var(--color-text)]">Layout:</strong> Result states are arranged in a circle with radius proportional to count</li>
      </ul>

      <h2 id="dfa-minimization" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">DFA Minimization (Table-Filling)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Minimizes the current DFA using the table-filling (Myhill-Nerode) algorithm. Requires DFA mode.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
        <li>→ <strong className="text-[var(--color-text)]">Step 1 — Reachability:</strong> First removes unreachable states via BFS from the initial state</li>
        <li>→ <strong className="text-[var(--color-text)]">Step 2 — Base case:</strong> All (accepting, non-accepting) pairs are marked as distinguishable (round 0)</li>
        <li>→ <strong className="text-[var(--color-text)]">Step 3 — Refinement:</strong> Iteratively: for each unmarked pair (p, q), if δ(p, a) and δ(q, a) are distinguishable for any symbol a, mark (p, q) as distinguishable. Repeat until no changes.</li>
        <li>→ <strong className="text-[var(--color-text)]">Step 4 — Merge:</strong> Unmarked pairs are equivalent. Uses Union-Find to merge equivalent states (prefers initial state as representative).</li>
        <li>→ <strong className="text-[var(--color-text)]">Step display:</strong> {"Each step shows: ✗ (stateA, stateB) with the reason (e.g., \"On 'a': q0→q1, q2→q3 (distinguishable)\")"}</li>
        <li>→ <strong className="text-[var(--color-text)]">Result:</strong> {"Reports how many states were removed. If already minimal, shows \"DFA is already minimal!\""}</li>
      </ul>

      <h2 id="re-to-nfa" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">RE → NFA (Thompson&apos;s Construction)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Enter a regular expression and convert it to an NFA using Thompson&apos;s construction.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
        <li>→ <strong className="text-[var(--color-text)]">Supported syntax:</strong> Literals (a-z, 0-9, any non-special character), <code className="text-[var(--color-accent)]">|</code> (union), <code className="text-[var(--color-accent)]">*</code> (Kleene star), <code className="text-[var(--color-accent)]">+</code> (one or more), <code className="text-[var(--color-accent)]">?</code> (optional), <code className="text-[var(--color-accent)]">()</code> groups, <code className="text-[var(--color-accent)]">ε</code> or <code className="text-[var(--color-accent)]">ϵ</code> (epsilon), and <code className="text-[var(--color-accent)]">\</code> for escaping special characters</li>
        <li>→ <strong className="text-[var(--color-text)]">Parser:</strong> {"Recursive descent with precedence: union < concatenation < Kleene/quantifiers < atoms"}</li>
        <li>→ <strong className="text-[var(--color-text)]">Construction:</strong> Each operation creates a fragment (start state, end state, internal transitions). Concatenation merges end/start states; union adds new start/end with ε-transitions to both branches; star adds ε-loops.</li>
        <li>→ <strong className="text-[var(--color-text)]">Step display:</strong> {"Each step describes the fragment built: \"Symbol 'a': q0 → q1\", \"Union: q4 → (q0|q2) → q5\", \"Star(*): q6 → q0...q3 → q7\""}</li>
        <li>→ <strong className="text-[var(--color-text)]">Error handling:</strong> {"Parse errors are displayed in red (e.g., \"Unexpected character at position 5\")"}</li>
      </ul>

      <h2 id="fa-to-re" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">FA → RE (State Elimination)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Converts the current finite automaton to a regular expression using the GNFA state elimination method.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
        <li>→ <strong className="text-[var(--color-text)]">GNFA setup:</strong> Adds a new start state (with ε to original initial) and a new accept state (ε from all original accepting states). Transitions are stored as regex edge labels.</li>
        <li>→ <strong className="text-[var(--color-text)]">Elimination:</strong> {"Each original state is eliminated one by one. For every pair (p, q) where p→eliminated and eliminated→q exist, a new edge p→q is created with label: R_in · R_self* · R_out (where R_self is the self-loop if it exists)."}</li>
        <li>→ <strong className="text-[var(--color-text)]">Step display:</strong> Each step shows which state was eliminated and how many edges were updated</li>
        <li>→ <strong className="text-[var(--color-text)]">Result:</strong> The final regex is the label on the edge from GNFA start to GNFA accept. A COPY RE button copies it to clipboard. Basic simplification removes redundant ε concatenations.</li>
      </ul>

      <h2 id="fa-to-grammar" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">FA → Grammar</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Generates a right-linear grammar from the current finite automaton.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
        <li>→ <strong className="text-[var(--color-text)]">Non-terminal mapping:</strong> The initial state maps to S; other states map to A, B, C, ... (or their label uppercased if single-char)</li>
        <li>→ <strong className="text-[var(--color-text)]">Production rules:</strong> For each transition from→to on symbol: Head → symbol Body. For ε-transitions: Head → Body.</li>
        <li>→ <strong className="text-[var(--color-text)]">Accepting states:</strong> For each accepting state, add Head → ε</li>
        <li>→ <strong className="text-[var(--color-text)]">Output:</strong> Productions displayed with start symbol indicated. COPY GRAMMAR button copies in standard notation.</li>
      </ul>

      <h2 id="combine" className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-6 mb-3 font-medium">Combine (DFA Operations)</h2>
      <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-2">
        Combine the canvas DFA (automaton A) with a second automaton B (specified as a regular expression). Requires DFA mode.
      </p>
      <ul className="text-sm text-[var(--color-text-dim)] space-y-1 list-none mb-2">
        <li>→ <strong className="text-[var(--color-text)]">∪ Union</strong> — accepts strings in A or B. Accepting condition: accept_A OR accept_B.</li>
        <li>→ <strong className="text-[var(--color-text)]">∩ Intersection</strong> — accepts strings in both A and B. Accepting condition: accept_A AND accept_B.</li>
        <li>→ <strong className="text-[var(--color-text)]">− Difference</strong> — accepts strings in A but not B. Accepting condition: accept_A AND NOT accept_B.</li>
        <li>→ <strong className="text-[var(--color-text)]">¬ Complement</strong> — flips accepting states of A (only A needed, ignores B). Both DFAs are first completed with a trap state for missing transitions.</li>
        <li>→ <strong className="text-[var(--color-text)]">Product construction:</strong> {"For binary ops, B is built from the RE input via RE→NFA→DFA pipeline. Then BFS explores product states (stateA, stateB), computing transitions for each alphabet symbol."}</li>
        <li>→ <strong className="text-[var(--color-text)]">DFA completion:</strong> Before product construction, both DFAs are automatically completed by adding a trap state (labeled ∅) with self-loops for all missing (state, symbol) pairs.</li>
        <li>→ <strong className="text-[var(--color-text)]">Step display:</strong> Each step shows δ(pair, symbol) = result, with NEW flags for newly discovered product states</li>
      </ul>

      <Screenshot id="conversions" description="Conversions panel — NFA→DFA, Minimize, RE, Grammar tools" src="/docs/conversions.png" />

      <DocsPrevNext />
    </>
  );
}
