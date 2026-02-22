'use client';

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFloating, offset, flip, shift, autoUpdate, type Placement } from '@floating-ui/react-dom';

interface TooltipProps {
  label: string;
  shortcut?: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
}

export default function Tooltip({ label, shortcut, children, position = 'bottom' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const placement: Placement = position === 'top' ? 'top' : 'bottom';

  const { refs, floatingStyles } = useFloating({
    open: show,
    placement,
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const handleEnter = useCallback(() => {
    timeout.current = setTimeout(() => setShow(true), 300);
  }, []);

  const handleLeave = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    setShow(false);
  }, []);

  useEffect(() => {
    return () => { if (timeout.current) clearTimeout(timeout.current); };
  }, []);

  return (
    <div ref={refs.setReference} className="relative inline-flex" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {show && typeof document !== 'undefined' && createPortal(
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-[200] pointer-events-none animate-fade-in"
        >
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--color-border)] shadow-panel px-2 py-1 font-mono text-[11px] flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[var(--color-text)]">{label}</span>
            {shortcut && (
              <kbd className="text-[var(--color-accent)] bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 py-px text-[10px] leading-tight">{shortcut}</kbd>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
