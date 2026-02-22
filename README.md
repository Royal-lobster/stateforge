<div align="center">

<!-- OG image as hero -->
<img src="https://stateforge.vercel.app/opengraph-image" alt="StateForge" width="600" />

<br />

**JFLAP for the modern web — build, simulate, and share automata in the browser.**

No install. No accounts. Just a URL.

[![Live Demo](https://img.shields.io/badge/Live-stateforge.vercel.app-22d3ee?style=flat-square)](https://stateforge.vercel.app)
[![License](https://img.shields.io/github/license/Royal-lobster/stateforge?style=flat-square&color=22d3ee)](LICENSE)

</div>

---

## Features

- **DFA & NFA** — visual editor with step-through simulation and batch string testing
- **NFA → DFA** — subset construction, step-by-step or all-at-once
- **DFA minimization** — table-filling algorithm with before/after view
- **FA ↔ RegEx** — state elimination and Thompson's construction
- **Grammar editor** — context-free grammars with syntax highlighting and auto-classification
- **Grammar transforms** — ε-removal, unit-removal, CNF, GNF
- **Pushdown automata** — PDA editor with live stack visualization
- **Turing machines** — tape visualization with head tracking and speed control
- **Mealy & Moore** — transducer simulation with output display
- **L-Systems** — turtle graphics with iteration slider and fractal presets
- **URL sharing** — the entire automaton encodes into the URL hash
- **Import/export** — JFLAP `.jff` import, JSON export, PNG/SVG screenshots

## Tech stack

- **Next.js** (static site, client-side only)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (state management + undo/redo)
- **HTML Canvas** (graph editor)
- **lucide-react** (icons)
- **lz-string** (URL compression)

## Getting started

```bash
git clone https://github.com/Royal-lobster/stateforge.git
cd stateforge
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000) and start building automata.

## Architecture

```
src/
├── app/            # Next.js app router (layout, page, OG image)
├── components/     # Canvas, Toolbar, Sidebar, SimPanel, etc.
├── hooks/          # Custom React hooks
├── store.ts        # Zustand store (single source of truth)
├── types.ts        # TypeScript types
├── url.ts          # URL encode/decode (lz-string)
├── conversions.ts  # NFA→DFA, minimization, RE conversions
├── grammar.ts      # Grammar parsing, transforms, CYK
├── pda.ts          # PDA simulation
├── tm.ts           # Turing machine simulation
└── mealy-moore.ts  # Mealy/Moore machine simulation
```

## Docs

Full documentation is built into the app at [stateforge.vercel.app/docs](https://stateforge.vercel.app/docs).

## License

MIT

</div>
