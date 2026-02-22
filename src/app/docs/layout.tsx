'use client';

import { useState } from 'react';
import { Menu, X as XIcon, Search, Github } from 'lucide-react';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DocsTableOfContents } from '@/components/docs/DocsTableOfContents';
import Link from 'next/link';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--color-text)] overflow-hidden" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Top bar */}
      <header className="h-12 shrink-0 bg-[var(--bg-surface)] border-b border-[var(--color-border)] flex items-center px-4 gap-4 z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-[var(--color-accent)] font-bold text-sm tracking-[0.15em] font-mono">STATE</span>
          <span className="text-[var(--color-text-bright)] font-bold text-sm tracking-[0.15em] font-mono">FORGE</span>
        </Link>
        <div className="w-px h-5 bg-[var(--color-border)]" />
        <span className="text-xs tracking-wide text-[var(--color-text-muted)]">Documentation</span>
        <div className="flex-1" />
        <div className="hidden md:flex items-center gap-1 bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] cursor-pointer hover:border-[var(--color-accent)]/50 transition-colors min-w-[180px]">
          <Search size={13} className="shrink-0 mr-1" />
          <span>Search docs...</span>
          <kbd className="ml-auto text-[10px] bg-[var(--bg-primary)] border border-[var(--color-border)] px-1 py-px font-mono">⌘K</kbd>
        </div>
        <a href="https://github.com/Royal-lobster/stateforge" target="_blank" rel="noopener" className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors">
          <Github size={16} />
        </a>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
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
            fixed top-12 left-0 bottom-0 w-64 border-r border-[var(--color-border)] z-40
            overflow-y-auto transition-transform duration-200
            lg:relative lg:top-0 lg:translate-x-0 lg:z-10 lg:shrink-0
            bg-[hsl(220,10%,9%)]
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <DocsSidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto scroll-smooth">
          <div id="docs-content" className="px-6 md:px-12 lg:px-16 py-12 max-w-3xl mx-auto">
            {children}
          </div>
        </main>

        {/* Right TOC */}
        <DocsTableOfContents />
      </div>
    </div>
  );
}
