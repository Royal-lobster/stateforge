export const docsNav = [
  {
    group: 'Getting Started',
    items: [
      { href: '/docs', label: 'Overview', match: '/docs' },
      { href: '/docs#getting-started', label: 'Getting Started', match: null },
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
      { href: '/docs/modes', label: 'Automaton Modes', match: '/docs/modes' },
    ],
  },
  {
    group: 'Tools',
    items: [
      { href: '/docs/conversions', label: 'Conversions', match: '/docs/conversions' },
      { href: '/docs/grammar', label: 'Grammar Editor', match: '/docs/grammar' },
      { href: '/docs/l-systems', label: 'L-Systems', match: '/docs/l-systems' },
    ],
  },
  {
    group: 'Reference',
    items: [
      { href: '/docs/properties', label: 'Properties Panel', match: '/docs/properties' },
      { href: '/docs/import-export', label: 'Import/Export', match: '/docs/import-export' },
      { href: '/docs/shortcuts', label: 'Keyboard Shortcuts', match: '/docs/shortcuts' },
    ],
  },
];

// Flat ordered list for prev/next
export const docsPagesOrdered = [
  { href: '/docs', label: 'Overview' },
  { href: '/docs/canvas', label: 'Canvas & States' },
  { href: '/docs/transitions', label: 'Transitions' },
  { href: '/docs/simulation', label: 'Simulation' },
  { href: '/docs/modes', label: 'Automaton Modes' },
  { href: '/docs/conversions', label: 'Conversions' },
  { href: '/docs/grammar', label: 'Grammar Editor' },
  { href: '/docs/l-systems', label: 'L-Systems' },
  { href: '/docs/properties', label: 'Properties Panel' },
  { href: '/docs/import-export', label: 'Import/Export' },
  { href: '/docs/shortcuts', label: 'Keyboard Shortcuts' },
];
