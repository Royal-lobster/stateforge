# Mealy Machine

A **Mealy machine** is a finite-state transducer whose outputs are determined by the current state *and* the current input — meaning output is produced on **transitions**, not on states. This makes it one of the two classical transducer models (the other being the [Moore machine](/docs/moore)).

![Mealy simulation](/docs/mealy-sim.png)

---

## Theory

### Formal definition

A Mealy machine is a 6-tuple **(Q, Σ, Λ, δ, ω, q₀)** where:

| Symbol | Meaning |
|--------|---------|
| **Q** | Finite set of states |
| **Σ** | Input alphabet (finite set of input symbols) |
| **Λ** | Output alphabet (finite set of output symbols) |
| **δ** | Transition function: Q × Σ → Q |
| **ω** | Output function: Q × Σ → Λ |
| **q₀** | Initial state (q₀ ∈ Q) |

The key distinction: **ω depends on both the current state and the input symbol**. Each transition edge carries both an input and an output, written as `input/output`.

### Transducer concept

Unlike acceptors (DFA, NFA) that classify strings as accepted or rejected, a Mealy machine is a **transducer** — it transforms an input sequence into an output sequence. For every input symbol consumed, exactly one output symbol is produced. Therefore:

> **The output sequence is always the same length as the input sequence.**

There are no accepting or rejecting states. A Mealy machine doesn't decide membership in a language; it computes a mapping from input strings to output strings.

### Mealy vs Moore

The two classical transducer models differ in where output is associated:

| Property | Mealy | Moore |
|----------|-------|-------|
| Output associated with | **Transitions** (edges) | **States** (nodes) |
| Edge label format | `input/output` | `input` |
| State label format | `name` | `name/output` |
| Output timing | Same cycle as input | One cycle delayed |
| Number of states | Typically **fewer** | May need more states |

**Equivalence theorem:** Every Mealy machine has an equivalent Moore machine and vice versa. The equivalent Moore machine may require up to |Q| × |Λ| states (one for each state–output pair), while converting Moore → Mealy never increases the state count.

### Use cases

- **Serial protocol design** — encoding/decoding bit streams (e.g., Manchester encoding)
- **Signal processing** — edge detection, filtering
- **Vending machines** — output (dispense item, give change) depends on current state *and* the coin inserted
- **Traffic light controllers** — signal changes depend on state and sensor input
- **Parity checkers** — track even/odd parity of a bit stream
- **Sequence transformers** — map one symbol stream to another (e.g., complement, delay, cipher)

### Classic examples

**Parity Checker** — Outputs `0` when the number of `1`s seen so far is even, `1` when odd:

- States: `Even` (initial), `Odd`
- Transitions from `Even`: `0/0` → `Even`, `1/1` → `Odd`
- Transitions from `Odd`: `0/0` → `Odd`, `1/1` → `Even`
- Input `1011` → Output `1100`

**Edge Detector** — Outputs `1` only when the input changes from `0` to `1`:

- States: `S0` (last input was 0, initial), `S1` (last input was 1)
- From `S0`: `0/0` → `S0`, `1/1` → `S1`
- From `S1`: `0/0` → `S0`, `1/0` → `S1`
- Input `01011` → Output `01010`

---

## Using Mealy in StateForge

### Switching to Mealy mode

Press **`5`** to switch the editor to **Mealy machine** mode. The mode indicator in the toolbar updates, and the simulation panel switches to the Mealy transducer interface. You can also select Mealy from the mode dropdown in the sidebar.

In Mealy mode:
- **Accepting states are disabled.** Transducers don't accept or reject — they transform. The toggle-accepting action has no effect.
- **Transition labels use `input/output` format.** Each symbol on a transition is written as a pair separated by `/`.

### Transition format

When editing a transition, enter symbols in the format:

```
input/output
```

For example:
- `0/1` — on input `0`, output `1`
- `a/x` — on input `a`, output `x`
- `1/0` — on input `1`, output `0`

Multiple input/output pairs on the same edge are separated by commas: `0/0, 1/1`.

StateForge parses each symbol using the pattern `input/output` and will warn if the format is invalid. Internally, `parseMealyLabel()` splits on `/` to extract the input and output components.

### Simulation

Open the simulation panel (toggle with the sim button or shortcut) to test your Mealy machine:

1. **Enter an input string** in the INPUT field (e.g., `1011`)
2. **Step** (press Enter or click the step button) to process one input symbol at a time
3. **Fast Run** to process the entire input at once
4. **Reset** to clear the simulation

The panel displays:
- **Status**: IDLE → COMPLETE or ERROR
- **Output**: the accumulated output string, built symbol-by-symbol as the machine processes input
- **Step counter**: `(current/total)` showing progress through the input

#### Step table

As you step through the simulation, a table shows each processing step:

| # | State | Input | Output | Next |
|---|-------|-------|--------|------|
| 1 | Even | 1 | 1 | Odd |
| 2 | Odd | 0 | 0 | Odd |
| 3 | Odd | 1 | 1 | Even |
| 4 | Even | 1 | 1 | Odd |

Each row records:
- The **current state** before processing
- The **input symbol** consumed
- The **output symbol** produced (highlighted in accent color)
- The **next state** after the transition

The canvas highlights the current state as you step through, giving visual feedback.

If no valid transition exists for the current input symbol, the simulation halts with an **ERROR** status and displays "No valid transition found."

### Gallery examples

The gallery includes pre-built Mealy machines you can load:

- **Parity Bit Generator** — computes running parity of a binary input
- **Edge Detector** — detects 0→1 transitions in a binary signal

Load a gallery example to see a working Mealy machine with transitions already labeled in `input/output` format, then run the simulation to observe the step-by-step transformation.

---

## Tips & Mealy vs Moore

### When to choose Mealy

- **Faster response**: output appears on the *same clock cycle* as the input, whereas Moore output is delayed by one cycle (output depends only on state, which updates after the transition). In hardware design, this one-cycle advantage matters.
- **Fewer states**: since output is encoded in transitions rather than states, a Mealy machine often needs fewer states than the equivalent Moore machine. A Moore machine must split states to distinguish different outputs.

### Common mistakes

- **Forgetting the output on transitions** — every transition in a Mealy machine must have the `input/output` format. A bare symbol like `0` (without `/output`) will not be recognized by the simulator. Always write `0/0`, `0/1`, etc.
- **Expecting accept/reject behavior** — Mealy machines are transducers, not acceptors. There are no accepting states. If you need acceptance, use DFA or NFA mode.
- **Mismatched output length** — in a correct Mealy machine, every input symbol produces exactly one output symbol. If simulation shows an error partway through, check that all input symbols have corresponding transitions from every reachable state.

### Quick reference

| Want to... | Do this |
|------------|---------|
| Switch to Mealy mode | Press `5` |
| Label a transition | `input/output` (e.g., `0/1`) |
| Simulate | Enter input → Step or Fast Run |
| Check output | Read the OUTPUT line in the sim panel |
