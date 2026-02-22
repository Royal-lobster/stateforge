# Turing Machine

A **Turing Machine** (TM) is the most powerful standard model of computation. Unlike finite automata and pushdown automata, a Turing Machine can read *and* write to an unbounded tape, giving it the ability to compute anything that is computable.

![TM simulation](/docs/tm-sim.png)

---

## Theory

### Formal Definition

A Turing Machine is formally defined as a **7-tuple** (Q, Σ, Γ, δ, q₀, q\_accept, q\_reject):

| Symbol | Meaning |
|---|---|
| **Q** | Finite set of states |
| **Σ** | Input alphabet (does not contain the blank symbol) |
| **Γ** | Tape alphabet (Σ ⊂ Γ, includes the blank symbol ⊔) |
| **δ** | Transition function: Q × Γ → Q × Γ × {L, R, S} |
| **q₀** | Start state (q₀ ∈ Q) |
| **q\_accept** | Accepting state |
| **q\_reject** | Rejecting state (q\_reject ≠ q\_accept) |

### The Tape

The TM operates on an **infinite bidirectional tape** divided into cells. Each cell holds a symbol from the tape alphabet Γ. A **read/write head** points to the current cell. All cells not explicitly written to contain the **blank symbol ⊔**.

### Transitions

At each step the machine:

1. **Reads** the symbol under the head
2. Based on the current state and symbol read, it:
   - **Writes** a new symbol to the cell
   - **Moves** the head left (L), right (R), or stays (S)
   - **Transitions** to a new state

The machine halts when it enters the accepting state or the rejecting state — or when no applicable transition exists.

### Church-Turing Thesis

The **Church-Turing thesis** states that any function which can be computed by an algorithm can be computed by a Turing Machine. This isn't a mathematical theorem (it can't be proven), but it is universally accepted. Every programming language, from Python to assembly, computes exactly what a TM can — no more, no less.

### Decidable vs Recognizable Languages

- A language is **decidable** (recursive) if a TM always halts on every input — either accepting or rejecting.
- A language is **recognizable** (recursively enumerable) if a TM accepts every string in the language, but may loop forever on strings not in the language.

Every decidable language is recognizable, but not vice versa.

### The Halting Problem

> Given a TM *M* and input *w*, does *M* halt on *w*?

Alan Turing proved this is **undecidable** — no algorithm can solve it for all possible TM/input pairs. This is proven by contradiction (diagonalization). The halting problem places a fundamental limit on what computation can achieve and has deep implications: you cannot write a perfect bug detector, a universal optimizer, or a program that decides all mathematical truths.

### Complexity Classes

- **P**: Problems solvable by a deterministic TM in polynomial time. These are "efficiently solvable" (sorting, shortest path, etc.).
- **NP**: Problems where a solution can be *verified* in polynomial time. Includes P, but also problems like SAT, graph coloring, and the traveling salesman problem. Whether P = NP is the most famous open question in computer science.

### Universal Turing Machine

A **Universal Turing Machine** (UTM) takes as input the description of *any* TM and an input string, then simulates that TM on that input. This is the theoretical foundation of general-purpose computers — one machine that can run any program.

### Classic Examples

| Machine | Input | Behavior |
|---|---|---|
| **Binary increment** | `1011` | Adds 1 to a binary number → `1100` |
| **Binary NOT** | `1010` | Flips each bit → `0101` |
| **Palindrome checker** | `abcba` | Accepts if the string reads the same forwards and backwards |
| **Unary addition** | `111+11` | Computes 3+2 in unary → `11111` |
| **String copy** | `abc` | Produces `abc⊔abc` on the tape |

### Computational Hierarchy

Turing Machines sit at the top of the Chomsky hierarchy:

```
Turing Machine (Type 0 / unrestricted grammars)
  ⊃ Pushdown Automaton (Type 2 / context-free grammars)
    ⊃ NFA / DFA (Type 3 / regular grammars)
```

- **DFA/NFA**: Fixed memory (states only). Can match regular expressions.
- **PDA**: Stack-based memory. Can match balanced parentheses, palindromes of even length.
- **TM**: Unlimited read/write tape. Can compute anything computable.

Each level strictly increases in power. A TM can simulate any PDA, and a PDA can simulate any DFA — but not the other way around.

---

## Using TM in StateForge

### Switching to TM Mode

Press **4** (or select from the mode menu) to switch to Turing Machine mode. The simulation panel changes to show tape-specific controls.

### Building Transitions

Transitions use the format:

```
read → write, direction
```

For example:

| Label | Meaning |
|---|---|
| `0 → 1, R` | Read `0`, write `1`, move head right |
| `⊔ → ⊔, L` | Read blank, write blank, move left |
| `a → X, R` | Read `a`, mark it with `X`, move right |
| `* → *, R` | Read any symbol, leave it unchanged, move right |

**Alternative syntax** is also accepted: `0/1,R` or `0->1,R`.

### Directions

| Symbol | Direction |
|---|---|
| **R** | Move head right |
| **L** | Move head left |
| **S** | Stay (head doesn't move) |

### Wildcard `*`

The wildcard `*` matches **any symbol** on the tape. This is useful for "skip over" transitions where you want to scan past characters without caring what they are.

- `* → *, R` — move right over any symbol without changing it
- `* → *, L` — move left over any symbol without changing it

When `*` appears in the **write** position, it means "write back whatever was read" (the symbol is preserved).

### Blank Symbol ⊔

The blank symbol `⊔` represents empty tape cells. You can read and write it like any other symbol. Use it to detect the end of input or to erase cells.

### Multiple Transitions

Multiple transitions between the same pair of states are allowed. Each transition label is treated independently — the simulator tries them in order and uses the first match.

### The Tape

StateForge uses a **sparse Map-based tape**: only non-blank cells are stored in memory. This means the tape is effectively infinite in both directions without allocating unbounded memory.

The tape visualization shows cells around the head position, with a **▼** marker indicating the current head position. The head cell is highlighted.

### Running the Simulation

| Control | Action |
|---|---|
| **▶ Start** | Initialize the tape with your input and enter the initial state |
| **⏭ Step** | Execute one transition step |
| **⏩ Fast Run** | Run until the machine halts or hits the step limit |
| **↺ Reset** | Clear the simulation and start fresh |

You can also press **Enter** to start or step through.

### Step Limit

The default step limit is **1000**. This prevents infinite loops from freezing the simulator. If a machine exceeds the limit, it reports **HALTED** status. You can adjust the limit in the header bar — increase it for complex machines that need more steps.

### Three Outcomes

| Status | Meaning |
|---|---|
| **ACCEPTED** | The machine reached an **accepting state** |
| **REJECTED** | The machine reached a state with no valid transition (and it's not accepting), or a rejecting state |
| **HALTED** | The step limit was exceeded — the machine may be in an infinite loop |

### Info Display

While running, the panel shows:

- **STATE** — the current state label
- **HEAD** — the head's position on the tape (integer index)
- **STEP** — how many transitions have been executed

### History Log

Every step is logged with the action taken (e.g., `Read '0', write '1', move R → carry`). The history panel shows the full trace, with the most recent step highlighted.

### Gallery Examples

StateForge includes several built-in TM examples in the gallery:

- **Binary Increment** — adds 1 to a binary number by scanning right to the end, then carrying back left
- **Binary NOT** — flips every bit (0↔1) and halts at the blank
- **Unary Addition** — adds two unary numbers separated by `+` (e.g., `111+11` → `11111`)
- **Copy String** — duplicates the input string with a blank separator

Load these from the gallery to study how real TM designs work.

---

## Tips

- **Use both accepting and rejecting states** for clear halting behavior. A TM that only has accepting states will reject by "getting stuck" (no transition), which is less explicit and harder to debug.

- **Wildcard `*` saves many transitions.** Instead of writing separate transitions for every symbol in your alphabet, use `* → *, R` to scan past characters. This keeps your state diagram clean.

- **Step limit protects against infinite loops.** If your machine legitimately needs more than 1000 steps (e.g., operating on long input), increase the limit. If it consistently hits the limit on short input, you likely have a bug causing an infinite loop.

- **Name states descriptively.** Use names like `scan-right`, `carry`, `return`, `done` instead of `q0`, `q1`, `q2`. Meaningful names make the machine's logic self-documenting and much easier to debug.

- **Test with edge cases.** Try empty input (ε), single-character input, and the smallest non-trivial case. TMs often have off-by-one bugs at tape boundaries.

- **Think in phases.** Most TMs work in distinct phases (scan, mark, return, repeat). Design each phase as a group of states, then connect them. This modular approach scales better than trying to design the whole machine at once.
