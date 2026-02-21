'use client';

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  label: string;
  shortcut?: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
}

export default function Tooltip({ label, shortcut, children, position = 'bottom' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [clamped, setClamped] = useState({ x: 0, ready: false });

  const handleEnter = useCallback(() => {
    timeout.current = setTimeout(() => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: position === 'top' ? rect.top : rect.bottom,
        });
        setClamped({ x: 0, ready: false });
      }
      setShow(true);
    }, 300);
  }, [position]);

  const handleLeave = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    setShow(false);
  }, []);

  // Clamp tooltip to viewport after it renders
  useEffect(() => {
    if (show && tipRef.current && !clamped.ready) {
      const tip = tipRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const pad = 8;
      let x = coords.x;
      // Clamp right edge
      if (x + tip.width / 2 > vw - pad) {
        x = vw - pad - tip.width / 2;
      }
      // Clamp left edge
      if (x - tip.width / 2 < pad) {
        x = pad + tip.width / 2;
      }
      setClamped({ x, ready: true });
    }
  }, [show, coords, clamped.ready]);

  useEffect(() => {
    return () => { if (timeout.current) clearTimeout(timeout.current); };
  }, []);

  const tipX = clamped.ready ? clamped.x : coords.x;

  return (
    <div ref={ref} className="relative inline-flex" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {show && typeof document !== 'undefined' && createPortal(
        <div
          ref={tipRef}
          className={`fixed z-[200] pointer-events-none ${clamped.ready ? 'animate-fade-in' : 'opacity-0'}`}
          style={{
            left: tipX,
            top: position === 'top' ? coords.y - 6 : coords.y + 6,
            transform: position === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
          }}
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
