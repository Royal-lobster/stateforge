'use client';

import { useState, useRef, useCallback, type ReactNode } from 'react';

interface TooltipProps {
  label: string;
  shortcut?: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
}

export default function Tooltip({ label, shortcut, children, position = 'bottom' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback(() => {
    timeout.current = setTimeout(() => setShow(true), 200);
  }, []);

  const handleLeave = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    setShow(false);
  }, []);

  return (
    <div className="relative inline-flex" onMouseEnter={handleEnter} onMouseLeave={handleLeave} onFocus={handleEnter} onBlur={handleLeave}>
      {children}
      {show && (
        <div className={`absolute z-[80] pointer-events-none animate-fade-in ${
          position === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        } left-1/2 -translate-x-1/2 whitespace-nowrap`}>
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--color-border)] shadow-panel px-2 py-1 font-mono text-[11px] flex items-center gap-1.5">
            <span className="text-[var(--color-text)]">{label}</span>
            {shortcut && (
              <kbd className="text-[var(--color-accent)] bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1 py-px text-[10px] leading-tight">{shortcut}</kbd>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
