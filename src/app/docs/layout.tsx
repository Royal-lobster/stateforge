'use client';

import { useState } from 'react';
import { Menu, X as XIcon } from 'lucide-react';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DocsTableOfContents } from '@/components/docs/DocsTableOfContents';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--color-text)] font-mono overflow-hidden">
      {/* Top bar */}
      <header className="h-11 shrink-0 bg-[var(--bg-surface)] border-b border-[var(--color-border)] flex items-center px-4 gap-3 z-50">
        <span className="text-xs tracking-widest uppercase text-[var(--color-text-dim)]">Documentation</span>
        <div className="flex-1" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-1 text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <XIcon size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Left sidebar */}
        <aside
          className={`
            fixed top-11 left-0 bottom-0 w-64 border-r border-[var(--color-border)] z-40
            overflow-y-auto transition-transform duration-200
            lg:relative lg:top-0 lg:translate-x-0 lg:z-10 lg:shrink-0
            bg-[var(--bg-primary)]
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <DocsSidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto scroll-smooth">
          <div id="docs-content" className="px-6 md:px-12 py-12 max-w-3xl mx-auto">
            {children}
          </div>
        </main>

        {/* Right TOC */}
        <DocsTableOfContents />
      </div>
    </div>
  );
}
