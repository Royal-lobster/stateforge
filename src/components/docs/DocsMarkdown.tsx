'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Screenshot } from './Screenshot';
import type { Components } from 'react-markdown';
import React from 'react';

function slugify(children: React.ReactNode): string {
  const text = React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string') return child;
      if (React.isValidElement(child) && child.props && typeof (child.props as Record<string, unknown>).children === 'string') {
        return (child.props as Record<string, unknown>).children as string;
      }
      return '';
    })
    .join('');
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const components: Components = {
  img: ({ src, alt }) => (
    <Screenshot id={String(src || '')} description={String(alt || '')} src={String(src || '')} />
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse font-mono text-xs">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead>{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium border-b border-[var(--color-border)]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="py-1.5 pr-4 text-[var(--color-text)] border-b border-[var(--color-border)]/30">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-[var(--bg-surface-sunken)]">{children}</tr>
  ),
  pre: ({ children }) => (
    <pre className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-4 py-3 my-4 overflow-x-auto text-xs">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) {
      return <code className={`${className} text-[var(--color-text)]`}>{children}</code>;
    }
    return (
      <code className="bg-[var(--bg-surface-sunken)] px-1.5 py-0.5 text-[var(--color-accent)] text-[0.85em] border border-[var(--color-border)]/30">
        {children}
      </code>
    );
  },
  h1: ({ children }) => {
    const id = slugify(children);
    return (
      <h1 id={id} className="text-2xl md:text-3xl font-bold tracking-wider mb-6 text-[var(--color-text-bright)]">
        {children}
      </h1>
    );
  },
  h2: ({ children }) => {
    const id = slugify(children);
    return (
      <h2
        id={id}
        className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-12 first:mt-6 mb-3 font-medium pb-2 border-b border-[var(--color-border)]"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = slugify(children);
    return (
      <h3 id={id} className="text-xs tracking-widest text-[var(--color-accent)] uppercase mt-8 mb-3 font-medium">
        {children}
      </h3>
    );
  },
  kbd: ({ children }) => (
    <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1.5 py-0.5 text-[var(--color-accent)] text-[11px] shadow-[0_1px_0_var(--color-border)]">
      {children}
    </kbd>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-[var(--color-accent)] hover:underline"
    >
      {children}
    </a>
  ),
  p: ({ children }) => (
    <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="text-sm text-[var(--color-text-dim)] space-y-1.5 list-none mb-4">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-sm text-[var(--color-text-dim)] space-y-2 list-decimal list-inside mb-4">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li>{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="text-[var(--color-text)]">{children}</strong>
  ),
  hr: () => (
    <hr className="border-t border-[var(--color-border)] my-8" />
  ),
  span: ({ children, className }) => (
    <span className={className}>{children}</span>
  ),
};

export function DocsMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
