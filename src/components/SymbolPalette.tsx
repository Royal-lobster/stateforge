'use client';

import { useState, useCallback, type RefObject } from 'react';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react-dom';
import { Keyboard } from 'lucide-react';

const SYMBOL_GROUPS = [
  { label: 'Greek', symbols: ['ε', 'λ', 'δ', 'Σ', 'Γ', 'Ω', 'α', 'β'] },
  { label: 'Arrows', symbols: ['→', '←', '↔', '⊢', '⊣'] },
  { label: 'Sets', symbols: ['∅', '∈', '∉', '∪', '∩', '⊆', '⊇'] },
  { label: 'Logic', symbols: ['∧', '∨', '¬', '∀', '∃'] },
];

interface SymbolPaletteProps {
  inputRef?: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onInsert?: (symbol: string) => void;
  className?: string;
}

export default function SymbolPalette({ inputRef, onInsert, className = '' }: SymbolPaletteProps) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles } = useFloating({
    open,
    placement: 'bottom-start',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const insert = useCallback(
    (symbol: string) => {
      if (onInsert) {
        onInsert(symbol);
        return;
      }
      const el = inputRef?.current;
      if (!el) return;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? start;
      const before = el.value.slice(0, start);
      const after = el.value.slice(end);
      const nativeSetter = Object.getOwnPropertyDescriptor(
        el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(el, before + symbol + after);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      requestAnimationFrame(() => {
        const pos = start + symbol.length;
        el.setSelectionRange(pos, pos);
        el.focus();
      });
    },
    [inputRef, onInsert]
  );

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        onMouseDown={e => {
          e.preventDefault();
          setOpen(o => !o);
        }}
        className={`p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors ${className}`}
        title="Symbol palette"
      >
        <Keyboard size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onMouseDown={e => { e.preventDefault(); setOpen(false); }} />
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-50 bg-[var(--bg-surface)] border border-[var(--color-border)] shadow-lg p-1.5 w-[220px]"
          >
            {SYMBOL_GROUPS.map(group => (
              <div key={group.label} className="mb-1 last:mb-0">
                <div className="text-[9px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider px-0.5 mb-0.5">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-px">
                  {group.symbols.map(s => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={e => {
                        e.preventDefault();
                        insert(s);
                      }}
                      className="w-[24px] h-[24px] flex items-center justify-center font-mono text-xs text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-[var(--bg-primary)] transition-colors bg-[var(--bg-surface-sunken)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
