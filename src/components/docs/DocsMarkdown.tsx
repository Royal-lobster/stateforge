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
    <div className="overflow-x-auto my-6 border border-[var(--color-border)]">
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[var(--bg-surface-sunken)]">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left py-2.5 px-4 text-xs font-semibold text-[var(--color-text-dim)] uppercase tracking-wider border-b border-[var(--color-border)]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="py-2.5 px-4 text-[var(--color-text-dim)] border-b border-[var(--color-border)]/20">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-[var(--bg-surface-sunken)]/50 transition-colors">{children}</tr>
  ),
  pre: ({ children }) => (
    <pre className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-5 py-4 my-5 overflow-x-auto text-sm font-mono leading-relaxed">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) {
      return <code className={`${className} text-[var(--color-text)]`}>{children}</code>;
    }
    return (
      <code className="bg-[var(--color-accent)]/8 text-[var(--color-accent)] px-1.5 py-0.5 text-[0.88em] font-mono border border-[var(--color-accent)]/15">
        {children}
      </code>
    );
  },
  h1: ({ children }) => {
    const id = slugify(children);
    return (
      <h1 id={id} className="text-3xl md:text-4xl font-bold mb-3 text-[var(--color-text-bright)] leading-tight tracking-tight">
        {children}
      </h1>
    );
  },
  h2: ({ children }) => {
    const id = slugify(children);
    return (
      <h2
        id={id}
        className="text-xl font-semibold text-[var(--color-text-bright)] mt-16 first:mt-8 mb-4 pb-3 border-b border-[var(--color-border)] leading-snug"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = slugify(children);
    return (
      <h3 id={id} className="text-base font-semibold text-[var(--color-accent)] mt-10 mb-3 leading-snug">
        {children}
      </h3>
    );
  },
  h4: ({ children }) => {
    const id = slugify(children);
    return (
      <h4 id={id} className="text-sm font-semibold text-[var(--color-text)] mt-6 mb-2">
        {children}
      </h4>
    );
  },
  kbd: ({ children }) => (
    <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1.5 py-0.5 text-[var(--color-accent)] text-[0.8em] font-mono shadow-[0_1px_0_var(--color-border)]">
      {children}
    </kbd>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-[var(--color-accent)] hover:underline underline-offset-2">
      {children}
    </a>
  ),
  p: ({ children }) => (
    <p className="text-[15px] text-[var(--color-text-dim)] leading-[1.75] mb-4">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="text-[15px] text-[var(--color-text-dim)] space-y-2 mb-5 ml-1">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-[15px] text-[var(--color-text-dim)] space-y-2 list-decimal list-inside mb-5 ml-1">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1 leading-[1.7]">
      <span className="text-[var(--color-accent)] mr-2 text-xs">→</span>
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="text-[var(--color-text-bright)] font-semibold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-[var(--color-text)] italic">{children}</em>
  ),
  hr: () => (
    <hr className="border-t border-[var(--color-border)] my-10" />
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[var(--color-accent)] pl-4 py-1 my-5 bg-[var(--color-accent)]/5">
      {children}
    </blockquote>
  ),
};

export function DocsMarkdown({ content }: { content: string }) {
  // Strip YAML frontmatter if present
  const stripped = content.replace(/^---[\s\S]*?---\n*/, '');
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={components}
    >
      {stripped}
    </ReactMarkdown>
  );
}
