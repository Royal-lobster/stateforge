'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function DocsTableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const pathname = usePathname();

  // Re-scan headings when pathname changes
  useEffect(() => {
    const scan = () => {
      const container = document.getElementById('docs-content');
      if (!container) return;
      const els = container.querySelectorAll('h2, h3');
      const items: TocItem[] = [];
      els.forEach((el) => {
        if (el.id) {
          items.push({ id: el.id, text: el.textContent || '', level: el.tagName === 'H2' ? 2 : 3 });
        }
      });
      setHeadings(items);
    };
    // Delay to let content render
    const timer = setTimeout(scan, 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block w-52 shrink-0 sticky top-0 h-screen overflow-y-auto py-10 px-4 border-l border-[var(--color-border)]/50">
      <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-4 font-semibold">
        On this page
      </div>
      <div className="relative">
        {/* Subtle line connecting items */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--color-border)]/30" />
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`block py-1 text-[12px] leading-snug transition-colors relative ${
              h.level === 3 ? 'pl-5' : 'pl-3'
            } ${
              activeId === h.id
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-dim)]'
            }`}
          >
            {activeId === h.id && (
              <span className="absolute left-0 top-0.5 bottom-0.5 w-px bg-[var(--color-accent)]" />
            )}
            {h.text}
          </a>
        ))}
      </div>
    </nav>
  );
}
