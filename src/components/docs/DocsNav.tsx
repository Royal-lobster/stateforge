export const docsNav = [
  {
    group: 'Getting Started',
    items: [
      { href: '/docs', label: 'Overview', match: '/docs' },
      { href: '/docs/getting-started', label: 'Getting Started', match: '/docs/getting-started' },
    ],
  },
  {
    group: 'Editor',
    items: [
      { href: '/docs/canvas', label: 'Canvas & States', match: '/docs/canvas' },
      { href: '/docs/transitions', label: 'Transitions', match: '/docs/transitions' },
    ],
  },
  {
    group: 'Simulation',
    items: [
      { href: '/docs/simulation', label: 'Simulation', match: '/docs/simulation' },
    ],
  },
  {
    group: 'Automata',
    items: [
      { href: '/docs/dfa', label: 'DFA', match: '/docs/dfa' },
      { href: '/docs/nfa', label: 'NFA', match: '/docs/nfa' },
      { href: '/docs/pda', label: 'PDA', match: '/docs/pda' },
      { href: '/docs/tm', label: 'Turing Machine', match: '/docs/tm' },
      { href: '/docs/mealy', label: 'Mealy Machine', match: '/docs/mealy' },
      { href: '/docs/moore', label: 'Moore Machine', match: '/docs/moore' },
    ],
  },
  {
    group: 'Tools',
    items: [
      { href: '/docs/conversions', label: 'Conversions', match: '/docs/conversions' },
      { href: '/docs/grammar', label: 'Grammar Editor', match: '/docs/grammar' },
      { href: '/docs/l-systems', label: 'L-Systems', match: '/docs/l-systems' },
      { href: '/docs/pumping-lemma', label: 'Pumping Lemma', match: '/docs/pumping-lemma' },
    ],
  },
  {
    group: 'Reference',
    items: [
      { href: '/docs/properties', label: 'Properties Panel', match: '/docs/properties' },
      { href: '/docs/import-export', label: 'Import/Export', match: '/docs/import-export' },
      { href: '/docs/command-palette', label: 'Command Palette', match: '/docs/command-palette' },
      { href: '/docs/shortcuts', label: 'Keyboard Shortcuts', match: '/docs/shortcuts' },
    ],
  },
];

// Flat ordered list for prev/next
export const docsPagesOrdered = [
  { href: '/docs', label: 'Overview' },
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: '/docs/canvas', label: 'Canvas & States' },
  { href: '/docs/transitions', label: 'Transitions' },
  { href: '/docs/simulation', label: 'Simulation' },
  { href: '/docs/dfa', label: 'DFA' },
  { href: '/docs/nfa', label: 'NFA' },
  { href: '/docs/pda', label: 'PDA' },
  { href: '/docs/tm', label: 'Turing Machine' },
  { href: '/docs/mealy', label: 'Mealy Machine' },
  { href: '/docs/moore', label: 'Moore Machine' },
  { href: '/docs/conversions', label: 'Conversions' },
  { href: '/docs/grammar', label: 'Grammar Editor' },
  { href: '/docs/l-systems', label: 'L-Systems' },
  { href: '/docs/pumping-lemma', label: 'Pumping Lemma' },
  { href: '/docs/properties', label: 'Properties Panel' },
  { href: '/docs/import-export', label: 'Import/Export' },
  { href: '/docs/command-palette', label: 'Command Palette' },
  { href: '/docs/shortcuts', label: 'Keyboard Shortcuts' },
];
