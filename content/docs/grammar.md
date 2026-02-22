# Grammar editor

Press <kbd>7</kbd> or click **CFG** in the toolbar to open the grammar editor. It replaces the canvas with a split-pane view: grammar text editor on the left (320px wide on desktop, 40% height on mobile), tools panel on the right.

## Grammar syntax

→ Write productions with `→`, `->`, or `::=` as the arrow

→ Use `|` for alternatives on the same line: `S → aSb | ε`

→ Use `ε`, `eps`, `epsilon`, or `ϵ` for the empty string

→ Lines starting with `#` or `//` are treated as comments and ignored

→ Multi-character non-terminals can be written in angle brackets: `<Expr>`

→ Uppercase single letters are non-terminals; everything else (lowercase, digits, symbols) are terminals

→ The first production's head becomes the start symbol

## Built-in examples

Load from the dropdown:

→ **Simple CFG (aⁿbⁿ):** `S → aSb | ε`

→ **Arithmetic:** `E → E+T | T; T → T*F | F; F → (E) | a`

→ **Balanced Parens:** `S → (S)S | ε`

→ **Palindrome:** `S → aSa | bSb | a | b | ε`

## Grammar classification

The grammar is automatically classified and shown in the header:

→ <span class="text-[var(--color-accept)]">Regular</span> — right-linear: each body is a single terminal, a terminal followed by a non-terminal, or ε

→ <span class="text-[var(--color-accent)]">Context-Free</span> — head is a single non-terminal, body is unrestricted

→ Context-Sensitive — |head| ≤ |body| for all productions (except S → ε)

→ <span class="text-[var(--color-reject)]">Unrestricted</span> — none of the above constraints hold

The stats bar shows: Σ (terminals), V (non-terminals), and production count.

## Transforms

Five standard grammar transformations, each with step-by-step explanations:

→ **Remove ε-productions:** Finds all nullable non-terminals (those that can derive ε). For each production containing nullable symbols, generates all combinations with those symbols optionally removed. If the start symbol was nullable, re-adds S → ε.

→ **Remove unit productions:** Finds all unit pairs (A, B) where A ⇒* B through unit productions. Replaces each unit chain with direct productions. E.g., if A → B and B → ab, creates A → ab.

→ **Remove useless symbols:** Two phases: (1) Remove non-generating symbols (those that can never derive a terminal string), (2) Remove unreachable symbols (those not reachable from the start symbol).

→ **Convert to CNF** (Chomsky Normal Form): First applies ε-removal, unit-removal, and useless-removal. Then: (TERM) replaces terminals in bodies of length > 1 with fresh non-terminals, (BIN) breaks productions with > 2 body symbols into chains of binary productions.

→ **Convert to GNF** (Greibach Normal Form): First converts to CNF, then applies a forward pass (substitute lower-ordered non-terminals, remove left recursion by introducing primed non-terminals) and a backward pass (back-substitute so all productions start with a terminal).

Each transform shows intermediate productions at each step. Click **APPLY TO EDITOR** to replace the grammar text with the result.

## CYK parser

The Cocke-Younger-Kasami algorithm for parsing context-free grammars.

→ **Auto-CNF:** If the grammar is not in CNF, it is automatically converted first

→ **Empty string:** Handled specially; checks if S → ε exists in the grammar

→ **Table display:** Shows the triangular CYK table where cell [l][i] contains the set of non-terminals that derive the substring from position i with length l+1. Populated cells show non-terminals in accent color; empty cells show ∅.

→ **Parse tree:** If accepted, a parse tree is reconstructed via backtracking and displayed as an interactive collapsible tree (click non-terminal nodes to expand/collapse)

→ **Steps:** Each step shows which substring was analyzed and what non-terminals were found

## LL(1) parser

A predictive top-down parser using FIRST and FOLLOW sets.

→ **FIRST sets:** Computed iteratively until fixpoint. For each non-terminal, determines which terminals can appear as the first symbol of strings derived from it.

→ **FOLLOW sets:** Computed iteratively. For each non-terminal, determines which terminals can appear immediately after it in some derivation. Start symbol always has $ in its FOLLOW set.

→ **Parse table:** Displayed as a grid with non-terminals as rows and terminals (plus $) as columns. Each cell shows the production to apply, or "-" for empty.

→ **Conflicts:** If multiple productions map to the same (non-terminal, terminal) cell, conflicts are listed in red. The grammar is not LL(1) if conflicts exist.

→ **Parse steps:** A table shows each parsing step with: Stack, Input (remaining), and Action (match terminal or apply production). Limited to 500 steps.

→ **Parse tree:** If successful, an interactive collapsible parse tree is displayed

## SLR(1) parser

A bottom-up shift-reduce parser using SLR(1) parsing tables.

→ **Build Table:** Click "Build Table" to compute the LR(0) item sets, GOTO function, and SLR(1) ACTION/GOTO table from FIRST and FOLLOW sets.

→ **Item sets:** The parser first computes the canonical collection of LR(0) item sets using closure and goto operations. Each item set is displayed showing all items (productions with a dot indicating the parser position).

→ **ACTION table:** For each state and terminal (including $), shows shift (s*n*), reduce (r*n*), or accept. Displayed as a grid.

→ **GOTO table:** For each state and non-terminal, shows the next state. Displayed alongside the ACTION table.

→ **Conflict detection:** If multiple actions map to the same (state, terminal) cell, conflicts are listed. Shift-reduce and reduce-reduce conflicts indicate the grammar is not SLR(1).

→ **Step-through parsing:** Enter a string and click "Parse" to see step-by-step shift-reduce parsing. Each step shows the stack contents, remaining input, and action taken (shift, reduce by production, or accept).

## Parse tree visualization

CYK and LL(1) parsers display an interactive parse tree when parsing succeeds.

→ **SVG tree:** The tree is rendered as a collapsible SVG diagram with non-terminal nodes and terminal leaves.

→ **Expand/collapse:** Click any non-terminal node to collapse or expand its subtree.

→ **Layout:** Nodes are arranged top-down with automatic spacing. Terminal leaves are shown in accent color, non-terminals in the default text color.

## Brute force parser

A BFS exhaustive search parser that works with any grammar type.

→ **Algorithm:** Starting from the start symbol, applies leftmost derivation: finds the leftmost non-terminal and tries all applicable productions. BFS ensures the shortest derivation is found first.

→ **Pruning:** Derivations exceeding the max depth (15) are pruned. Sentential forms with more than input.length + 5 terminals are also pruned. Visited forms are tracked to avoid cycles.

→ **Output:** If accepted, shows the leftmost derivation as a sequence: S ⇒ aSb ⇒ aabb

→ **Limitations:** Slow for large grammars or long strings due to exponential search space. Best for small examples.

![Grammar editor — CFG transforms panel with grammar loaded](/docs/grammar-editor.png)
