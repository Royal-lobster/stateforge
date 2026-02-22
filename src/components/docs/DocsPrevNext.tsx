'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
          className="flex-1 border border-[var(--color-border)] p-5 hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/3 transition-all group"
        >
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-2">
            <ArrowLeft size={12} />
            Previous
          </div>
          <div className="text-sm text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors font-medium">
            {prev.label}
          </div>
        </Link>
      ) : <div className="flex-1" />}
      {next ? (
        <Link
          href={next.href}
          className="flex-1 border border-[var(--color-border)] p-5 hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/3 transition-all group text-right"
        >
          <div className="flex items-center gap-2 justify-end text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-2">
            Next
            <ArrowRight size={12} />
          </div>
          <div className="text-sm text-[var(--color-text-dim)] group-hover:text-[var(--color-accent)] transition-colors font-medium">
            {next.label}
          </div>
        </Link>
      ) : <div className="flex-1" />}
    </div>
  );
}
