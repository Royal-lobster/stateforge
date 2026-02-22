# Moore Machine

A **Moore machine** is a finite-state transducer whose output depends solely on the current state — not the transition being taken. This makes Moore machines particularly intuitive: if you know what state you're in, you know exactly what output is being produced.

---

## Theory

### Formal definition

A Moore machine is a 6-tuple **(Q, Σ, Λ, δ, ω, q₀)** where:

| Symbol | Meaning |
|--------|---------|
| **Q** | Finite set of states |
| **Σ** | Input alphabet |
| **Λ** | Output alphabet |
| **δ: Q × Σ → Q** | Transition function |
| **ω: Q → Λ** | Output function (maps **states** to outputs) |
| **q₀ ∈ Q** | Initial state |

The critical distinction is **ω: Q → Λ** — the output function is defined on *states*, not on transitions. Every state has exactly one output symbol permanently associated with it.

### Output behavior

For an input string of length *n*, a Moore machine produces an output of length **n + 1**. The extra symbol comes from the initial state, which produces output before any input is consumed.

```
Input:   a  b  a
States:  q₀ → q₁ → q₂ → q₁
Output:  0    1    0    1
         ↑              ↑
    initial state    after last input
```

This "output-length = input-length + 1" property is a signature of Moore machines.

### Moore vs Mealy

| Property | Moore | Mealy |
|----------|-------|-------|
| Output depends on | Current state only | Current state + input |
| Output attached to | States | Transitions |
| Output length | \|input\| + 1 | \|input\| |
| Number of states | Typically more | Typically fewer |
| Output stability | Stable between transitions | May glitch during transitions |

**Equivalence.** Every Moore machine has an equivalent Mealy machine and vice versa — they recognize the same class of transductions (up to the initial output symbol). The conversion is constructive:

- **Moore → Mealy:** Move each state's output onto all *incoming* transitions.
- **Mealy → Moore:** Split states. If state *q* can be reached with transitions producing different outputs, create one copy of *q* per distinct output. This can cause **state explosion** — a Mealy machine with *n* states and *k* distinct outputs per state may become a Moore machine with up to *n × k* states.

### Use cases

Moore machines naturally model systems where **output is a property of the current state**:

- **Traffic lights** — the state *is* the light color (red, yellow, green)
- **Elevator controllers** — the state encodes the current floor and direction
- **Vending machines** — state indicators (idle, selecting, dispensing)
- **Synchronous digital circuits** — output is stable between clock edges, avoiding glitches that plague combinational (Mealy-style) outputs

---

## Using Moore in StateForge

### Switching to Moore mode

Press **`6`** or select **Moore** from the mode switcher in the toolbar. The canvas and simulation panel adapt to Moore semantics.

### State label format

In Moore mode, each state's label encodes both the name and the output, separated by a forward slash:

```
name/output
```

Examples:
- `q0/0` — state named "q0", output is "0"
- `even/0` — state named "even", output is "0"
- `saw01/1` — state named "saw01", output is "1"

The output is **parsed from after the `/`** in the label. If you omit the slash, the state has no output (which will cause simulation errors).

### Transitions

Unlike Mealy mode, transitions in Moore carry **only input symbols** — no output on edges. A transition labeled `a` means "on input `a`, move to the target state." The output comes from whichever state you land in.

### Simulation

Open the simulation panel to test your Moore machine:

1. **Enter an input string** in the input field
2. **Step** (Enter) to advance one symbol at a time, or **Fast Run** to process the entire input
3. **Reset** to start over

The step table shows each transition: the current state, input symbol consumed, the output produced by the *next* state, and which state is entered. The **output sequence** displayed is one character longer than the input — the initial state's output appears first.

![Mealy/Moore simulation](/docs/mealy-sim.png)

### Gallery examples

StateForge ships with two Moore gallery examples:

**Binary Counter (mod 4)** — Four states (`q0/0`, `q1/1`, `q2/2`, `q3/3`) arranged in a cycle. Each input pulse advances the counter. The output is the current count value.

**Sequence Detector ("01")** — Three states: `init/0`, `saw0/0`, and `saw01/1`. Scans a binary input and outputs `1` whenever the subsequence "01" has just been detected. Demonstrates how the output cleanly reflects "what has been recognized" via state identity alone.

---

## Tips & best practices

### Naming states

Use meaningful names that describe *what the state represents*, not just sequential numbers:

| ❌ Avoid | ✅ Prefer |
|----------|-----------|
| `q0/0` | `even/0` |
| `q1/1` | `odd/1` |
| `q2/0` | `init/0` |

The name before the `/` is documentation — make it count.

### Output stability

A Moore machine's output **only changes when the state changes**. Between transitions, the output is rock-steady. This is exactly why hardware designers favor Moore machines for synchronous circuits — no transient glitches.

### State count trade-off

Moore machines typically require **more states** than an equivalent Mealy machine because the output must be "baked into" the state. If two transitions into the same logical state would produce different outputs (in Mealy), Moore needs separate states for each output variant.

The upside: reasoning is simpler. You can look at any state and immediately know its output without considering how you arrived there.

### Common mistakes

- **Forgetting the `/output` in state labels** — a label like `q0` without a slash has no output. The simulator won't know what to produce. Always include `name/output`.
- **Putting output on transitions** — that's Mealy, not Moore. In Moore mode, transition labels should be plain input symbols (e.g., `0`, `1`, `a`), not `input/output` pairs.
- **Forgetting the initial output** — remember that the output sequence starts *before* the first input is consumed. The initial state's output is always the first character of the output string.
