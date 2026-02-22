# NFA — Nondeterministic Finite Automaton

A **Nondeterministic Finite Automaton** extends the DFA model by allowing multiple possible transitions from a single state on the same input symbol—including transitions on no input at all (ε-transitions). NFAs recognize exactly the regular languages, just like DFAs, but are often more concise to construct.

---

## Theory

### Formal Definition

An NFA is a 5-tuple **(Q, Σ, δ, q₀, F)** where:

| Symbol | Meaning |
|--------|---------|
| **Q** | Finite set of states |
| **Σ** | Finite input alphabet |
| **δ** | Transition function: **Q × (Σ ∪ {ε}) → P(Q)** |
| **q₀** | Start state (q₀ ∈ Q) |
| **F** | Set of accepting states (F ⊆ Q) |

The critical difference from a DFA is the transition function **δ**. Instead of mapping to a single next state, it maps to a **set of states** (the power set P(Q)). This means:

- A state may have **zero, one, or many** transitions on the same symbol.
- A state may have **ε-transitions** — transitions that happen without consuming any input.

### Nondeterminism

Nondeterminism means the machine can be in **multiple states simultaneously**. Think of it as the NFA "guessing" the right path, or equivalently, exploring all possible paths in parallel:

- **Multiple transitions on the same symbol:** From state q₁, reading `a` might lead to both q₂ and q₃.
- **ε-transitions:** The machine can move from one state to another "for free" — without reading any input character.
- **No transition (dead end):** If no transition exists for a given symbol, that computation branch simply dies.

### Acceptance

A string **w** is accepted by an NFA if there **exists at least one** computation path from q₀ that consumes all of w and ends in an accepting state. It doesn't matter if other paths reject or get stuck — one accepting path is enough.

> **Key insight:** DFA acceptance requires *the* path to accept. NFA acceptance requires *some* path to accept.

### Epsilon Closure

The **ε-closure** of a set of states S is the set of all states reachable from any state in S by following only ε-transitions (zero or more of them). This includes the states in S themselves.

**Algorithm** (stack-based DFS):

```
ε-closure(S):
  closure ← S
  stack ← all states in S
  while stack is not empty:
    current ← stack.pop()
    for each transition (current, ε) → q:
      if q ∉ closure:
        closure ← closure ∪ {q}
        stack.push(q)
  return closure
```

The ε-closure is computed at the start of simulation (from the initial state) and after every symbol transition.

### Equivalence with DFA

**Every NFA has an equivalent DFA**, and vice versa — they recognize exactly the same class of languages (the regular languages).

The **subset construction** (also called the powerset construction) converts an NFA with *n* states into an equivalent DFA where:

- Each DFA state corresponds to a **subset** of NFA states.
- The DFA start state is the ε-closure of the NFA start state.
- A DFA state is accepting if it contains **any** NFA accepting state.
- Transitions are computed by: for each symbol, take the union of all NFA transitions from states in the current subset, then compute the ε-closure.

**Blowup:** An NFA with *n* states can produce a DFA with up to **2ⁿ** states. In practice the reachable subset is usually much smaller, but worst-case exponential blowup is possible.

### Thompson's Construction

**Thompson's construction** builds an NFA from a regular expression inductively:

| Regex | NFA Fragment |
|-------|-------------|
| `a` (literal) | Two states connected by transition on `a` |
| `ε` | Two states connected by an ε-transition |
| `R₁R₂` (concat) | Merge the accept state of R₁ with the start state of R₂ |
| `R₁\|R₂` (union) | New start with ε-transitions to both sub-NFAs; both accept states ε-transition to new accept |
| `R*` (Kleene star) | New start/accept with ε-transitions for zero-or-more repetition |
| `R+` (one or more) | Like star, but no skip from start to accept |
| `R?` (optional) | Like union with ε |

Each construction produces exactly **two new states** (plus the sub-NFA states), keeping the NFA linear in the size of the regex.

### Use Cases

- **Regular expression matching** — regex engines often compile patterns to NFAs
- **Compiler lexers** — tokenizers use NFAs (converted to DFAs) for fast lexical analysis
- **Protocol modeling** — nondeterminism naturally models concurrent or ambiguous behavior

---

## Using NFA in StateForge

### Switching to NFA Mode

Press <kbd>2</kbd> or select **NFA** from the mode switcher in the sidebar. When you create a new transition in NFA mode, the default symbol is **ε** (epsilon), reflecting the central role of ε-transitions in NFAs.

### Building an NFA

1. **Add states** — click the canvas (or use the state tool). The first state is automatically marked as initial.
2. **Add transitions** — drag from one state to another. The default label is `ε`; double-click the transition to edit symbols.
3. **Multiple symbols** — enter comma-separated symbols on a single transition (e.g., `a, b`). Each symbol creates a separate logical transition.
4. **ε-transitions** — keep the default `ε` symbol or add it alongside other symbols for "free" state changes.
5. **Self-loops** — drag from a state back to itself for repetition patterns.

### Simulating an NFA

Open the simulation panel (bottom of the screen) and enter an input string.

**How NFA simulation works in StateForge:**

1. **Start** (<kbd>Enter</kbd> or ▶): The simulator computes the **ε-closure** of the initial state. All states in this closure become active — you'll see them highlighted on the canvas and listed as chips in the simulation panel.

2. **Step** (<kbd>Enter</kbd> or ⏭): For each active state, the simulator finds all transitions matching the next input symbol, collects the target states, then computes the **ε-closure** of that set. The result becomes the new set of active states.

3. **Fast Run** (⏩): Processes the entire input string at once and reports the result.

4. **Acceptance:** After all input is consumed, the string is **accepted** if **any** active state is an accepting state. If no active states remain (all branches died), the string is rejected.

![NFA simulation](/docs/sim-accepted.png)

**Key difference from DFA simulation:** A DFA always has exactly one active state. An NFA tracks **all possible states simultaneously** — you'll see multiple highlighted states on the canvas and multiple chips in the "Active States" display.

### Multi-Run Testing

Switch to the **Multi** tab in the simulation panel to batch-test multiple strings at once. Enter one string per line (empty line = ε). This is useful for verifying your NFA against a set of expected accepts/rejects.

### RE → NFA Conversion

StateForge includes a **Thompson's construction** tool that converts a regular expression into an NFA:

1. Open the conversion tools from the sidebar.
2. Enter a regular expression (supports `|`, `*`, `+`, `?`, parentheses, and literal characters).
3. The tool builds the NFA and displays step-by-step construction details showing each fragment created (symbol, concat, union, star, etc.).
4. The resulting NFA is loaded onto the canvas with states auto-laid out.

**Supported syntax:**
- `a`, `b`, ... — literal characters
- `ε` — epsilon (empty string)
- `R₁R₂` — concatenation
- `R₁|R₂` — union (alternation)
- `R*` — Kleene star (zero or more)
- `R+` — one or more
- `R?` — optional (zero or one)
- `(R)` — grouping
- `\c` — escape special characters

### NFA → DFA Conversion

Convert your NFA to an equivalent DFA using the **subset construction**:

1. Click the **NFA → DFA** conversion button in the sidebar.
2. StateForge performs the full subset construction, producing:
   - **New DFA states** — each labeled with the set of NFA states it represents (e.g., `{q0,q1,q3}`).
   - **Step-by-step log** — each step shows which subset is being processed, the symbol consumed, the resulting subset, and whether it's a newly discovered state.
3. The resulting DFA is loaded onto the canvas.

A DFA state is marked accepting if its subset contains **any** NFA accepting state. The initial DFA state is the ε-closure of the NFA's initial state.

---

## Tips

- **ε-transitions for "free" moves** — use them to connect sub-automata without consuming input. They're the glue that makes Thompson's construction work and lets you build complex NFAs from simple pieces.

- **NFAs can be much smaller than equivalent DFAs** — a classic example: the language "strings where the n-th symbol from the end is `a`" needs only O(n) NFA states but O(2ⁿ) DFA states. When modeling, start with an NFA if it's more natural.

- **Simulation shows all active states** — during stepping, watch the highlighted states on the canvas. If **any** active state is accepting when input is consumed, the string is accepted. This parallel exploration is the essence of nondeterminism.

- **Comma-separated symbols** — put multiple symbols on one transition edge to keep the diagram clean. `a, b` on one arrow is equivalent to two separate arrows.

- **Convert and compare** — build an NFA, then convert to DFA to see the subset construction in action. Compare the state counts to appreciate the size tradeoff.

- **Test with Multi-Run** — after building your NFA, batch-test edge cases (empty string, single characters, long strings) to build confidence in your design.
