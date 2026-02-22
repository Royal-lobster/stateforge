'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { docsNav } from './DocsNav';

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const handleClick = useCallback(() => {
    setTimeout(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'instant' });
    }, 50);
    onNavigate?.();
  }, [onNavigate]);

  return (
    <div className="py-6 px-3">
      {docsNav.map((group, gi) => (
        <div key={group.group} className={gi === 0 ? 'mb-2' : 'mb-2'}>
          <div className="uppercase text-[10px] tracking-[0.15em] text-[var(--color-text-muted)] mb-1 mt-6 first:mt-0 px-3 font-semibold">
            {group.group}
          </div>
          {group.items.map((item) => {
            const isActive = item.match !== null && pathname === item.match;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClick}
                className={`block py-1.5 px-3 text-[13px] transition-all relative ${
                  isActive
                    ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/8 font-medium'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent)]/5'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-[var(--color-accent)]" />
                )}
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
