'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { docsPagesOrdered } from './DocsNav';

export function DocsPrevNext() {
  const pathname = usePathname();
  const idx = docsPagesOrdered.findIndex((p) => p.href === pathname);
  const prev = idx > 0 ? docsPagesOrdered[idx - 1] : null;
  const next = idx < docsPagesOrdered.length - 1 ? docsPagesOrdered[idx + 1] : null;

  return (
    <div className="flex gap-4 mt-16 pt-8 border-t border-[var(--color-border)]">
      {prev ? (
        <Link
          href={prev.href}
          className="flex-1 border border-[var(--color-border)] p-4 hover:border-[var(--color-accent)] transition-colors group"
        >
          <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Previous</div>
          <div className="text-sm font-mono text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors">
            ← {prev.label}
          </div>
        </Link>
      ) : <div className="flex-1" />}
      {next ? (
        <Link
          href={next.href}
          className="flex-1 border border-[var(--color-border)] p-4 hover:border-[var(--color-accent)] transition-colors group text-right"
        >
          <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Next</div>
          <div className="text-sm font-mono text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors">
            {next.label} →
          </div>
        </Link>
      ) : <div className="flex-1" />}
    </div>
  );
}
