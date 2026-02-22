'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { docsNav } from './DocsNav';

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const handleClick = useCallback(() => {
    // Scroll main content to top when navigating between pages
    setTimeout(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTo({ top: 0, behavior: 'instant' });
    }, 50);
    onNavigate?.();
  }, [onNavigate]);

  return (
    <div className="py-6 px-4">
      <Link href="/" className="block text-[var(--color-accent)] font-bold text-xs tracking-[0.2em] mb-8 hover:opacity-80 transition-opacity">
        ← STATEFORGE
      </Link>
      {docsNav.map((group) => (
        <div key={group.group} className="mb-4">
          <div className="uppercase text-[10px] tracking-widest text-[var(--color-text-muted)] mb-2 mt-6 font-medium">
            {group.group}
          </div>
          {group.items.map((item) => {
            const isActive = item.match !== null && pathname === item.match;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClick}
                className={`block py-2 px-3 text-sm font-mono transition-all border-l-2 ${
                  isActive
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5'
                    : 'border-transparent text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent)]/5 hover:border-[var(--color-accent)]/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
