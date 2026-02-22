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

## ✨ Features

- **🔀 DFA & NFA** — Visual editor with full simulation, step-through, and multi-string testing
- **📥 NFA → DFA Conversion** — Subset construction with animated step-by-step or side-by-side view
- **📐 DFA Minimization** — Table-filling algorithm with before/after comparison
- **🔄 FA ↔ RegEx** — State elimination and Thompson's construction
- **📝 Grammar Editor** — Context-free grammars with syntax highlighting and type classification
- **🔧 Grammar Transforms** — Remove ε/unit productions, CNF, GNF conversions
- **📚 Pushdown Automata** — PDA editor with real-time stack visualization
- **🖥️ Turing Machines** — Tape visualization with head tracking and animation speed control
- **⚙️ Mealy & Moore Machines** — Output on transitions or states with live output display
- **🌿 L-Systems** — Turtle graphics with iteration depth slider and fractal presets
- **🔗 URL Sharing** — Entire automaton encodes into the URL hash — the link *is* the file
- **📄 Import/Export** — JFLAP `.jff` import, JSON export, PNG/SVG screenshots

## 🛠️ Tech Stack

- **Next.js** (static export, no server)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (state management + undo/redo)
- **HTML Canvas** (graph editor)
- **lucide-react** (icons)
- **lz-string** (URL compression)

## 🚀 Getting Started

```bash
git clone https://github.com/Royal-lobster/stateforge.git
cd stateforge
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000) and start building automata.

## 🏗️ Architecture

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

## 📖 Docs

Full documentation is built into the app at [stateforge.vercel.app/docs](https://stateforge.vercel.app/docs).

## 📜 License

MIT

</div>
