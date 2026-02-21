'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function DocsTableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
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
  }, []);

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
    <nav className="hidden lg:block w-48 shrink-0 sticky top-0 h-screen overflow-y-auto py-8 px-4">
      <div className="uppercase text-[10px] tracking-widest text-[var(--color-text-muted)] mb-3 font-medium">
        On this page
      </div>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={`block py-1 text-xs transition-colors ${
            h.level === 3 ? 'pl-3' : ''
          } ${
            activeId === h.id
              ? 'text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-dim)]'
          }`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}
