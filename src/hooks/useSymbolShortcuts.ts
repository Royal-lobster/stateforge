'use client';

import { useCallback } from 'react';

const SHORTCUTS: [string, string][] = [
  // Longer patterns first to avoid premature matching
  ['\\lambda', 'λ'],
  ['\\exists', '∃'],
  ['\\empty', '∅'],
  ['\\sigma', 'Σ'],
  ['\\gamma', 'Γ'],
  ['\\delta', 'δ'],
  ['\\vdash', '⊢'],
  ['\\union', '∪'],
  ['\\inter', '∩'],
  ['\\from', '←'],
  ['\\eps', 'ε'],
  ['\\not', '¬'],
  ['\\all', '∀'],
  ['\\and', '∧'],
  ['\\or', '∨'],
  ['\\in', '∈'],
  ['\\to', '→'],
  ['\\e', 'ε'],
  ['\\l', 'λ'],
  ['\\d', 'δ'],
  ['\\S', 'Σ'],
  ['\\G', 'Γ'],
  ['\\t', '⊢'],
  ['->', '→'],
  ['<-', '←'],
];

export function applySymbolShortcuts(value: string): { replaced: boolean; value: string; cursorOffset: number } {
  for (const [pattern, symbol] of SHORTCUTS) {
    if (value.endsWith(pattern)) {
      return {
        replaced: true,
        value: value.slice(0, -pattern.length) + symbol,
        cursorOffset: value.length - pattern.length + symbol.length,
      };
    }
  }
  return { replaced: false, value, cursorOffset: value.length };
}

export function useSymbolShortcuts(
  setValue: (v: string) => void
): (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void {
  return useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = e.target.value;
      const { replaced, value } = applySymbolShortcuts(raw);
      setValue(replaced ? value : raw);
    },
    [setValue]
  );
}
