# Import/Export & Sharing

## URL Sharing

Your automaton is automatically encoded in the URL hash on every change. The encoding includes all state positions, labels, flags (initial/accepting), transitions with symbols, and the current mode. Press <kbd>⌘S</kbd> or click **SHARE** to copy the full URL to clipboard. Anyone opening the URL will see your exact automaton with identical layout.

## JSON Export

Press <kbd>⌘E</kbd> to download your automaton as a JSON file. The format is:

→ `_format: "stateforge-v1"` — format identifier

→ `mode` — automaton type (dfa, nfa, pda, tm, mealy, moore)

→ `states` — array of state objects with id, label, x, y, isInitial, isAccepting

→ `transitions` — array of transition objects with id, from, to, symbols array

→ File is named `stateforge-MODE.json` (e.g., stateforge-dfa.json)

## Import

Press <kbd>⌘O</kbd> to import a file. Supported formats:

→ **.json** — StateForge native format. Must have a `states` array. Mode defaults to "dfa" if not specified.

→ **.jff** — JFLAP XML format. The importer parses the XML structure to extract states (with coordinates), transitions (with read/write/pop/push/move attributes), and automaton type (fa→dfa, pda→pda, turing→tm). State positions are preserved from the JFLAP file.

After import, Zoom to Fit is automatically called to frame the loaded automaton. The next state number counter is set to one past the highest existing qN label.

## Auto-Save

Your work is automatically saved to localStorage via Zustand's subscription mechanism. On reload, it restores your last automaton (states, transitions, mode, viewport). The URL hash takes priority over localStorage if present — this means opening a shared link always loads that specific automaton regardless of what was saved locally.
