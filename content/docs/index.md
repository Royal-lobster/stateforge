# <span class="text-[var(--color-accent)]">STATE</span><span class="text-[var(--color-text-bright)]">FORGE</span> <span class="text-sm text-[var(--color-text-dim)] ml-3 font-normal tracking-normal">Documentation</span>

StateForge is a browser-based tool for building, simulating, and converting formal automata.
It supports DFA, NFA, PDA, Turing machines, Mealy/Moore machines, context-free grammars, and L-systems — all in one interface with zero installation.
Everything runs client-side: your automaton is encoded into the URL hash on every change, so sharing is as simple as copying the link.

![Full app view — DFA with states, transitions, sidebar, and simulation panel](/docs/canvas-dfa.png)

## Why StateForge?

→ **No install, no accounts** — runs in any browser, works offline

→ **Shareable URLs** — your entire automaton (states, transitions, positions, mode) is encoded in the URL hash

→ **8 automaton types** — DFA, NFA, PDA, Turing Machine, Mealy, Moore, CFG, L-Systems

→ **6 conversion algorithms** — NFA→DFA, DFA minimization, RE→NFA, FA→RE, FA→Grammar, product construction

→ **Step-through simulation** — watch your automaton process input symbol by symbol

→ **JFLAP import** — load .jff files directly (FA, PDA, and TM types)

→ **Modern UI** — dark theme, keyboard-first workflow, full mobile/touch support

→ **Undo/redo** — up to 50 history snapshots

## Compared to JFLAP

| Feature | StateForge | JFLAP |
|---------|-----------|-------|
| Platform | Any browser | Java required |
| Sharing | Copy URL | Export/email files |
| Mealy/Moore | ✓ | ✓ |
| L-Systems | ✓ | ✓ |
| CFG Parsing | CYK, LL(1), brute-force | CYK, brute-force |
| Dark mode | ✓ | ✗ |
| Mobile support | ✓ | ✗ |
| Offline | ✓ (PWA) | ✓ (desktop app) |
| Price | Free | Free |
