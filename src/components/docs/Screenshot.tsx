'use client';

import { useState } from 'react';
import { X as XIcon } from 'lucide-react';

export function Screenshot({ id, description, src }: { id: string; description: string; src?: string }) {
  const [lightbox, setLightbox] = useState(false);

  if (!src) {
    return (
      <div
        id={`screenshot-${id}`}
        className="border border-[var(--color-border)] bg-[var(--bg-surface-sunken)] flex items-center justify-center py-16 my-6 font-mono text-xs text-[var(--color-text-muted)]"
      >
        Screenshot: {description}
      </div>
    );
  }

  return (
    <>
      <figure id={`screenshot-${id}`} className="my-6 group cursor-pointer" onClick={() => setLightbox(true)}>
        <div className="border border-[var(--color-border)] bg-[var(--bg-surface-sunken)] overflow-hidden relative">
          <img src={src} alt={description} className="w-full block" loading="lazy" />
          <div className="absolute inset-0 bg-[var(--color-accent)]/0 group-hover:bg-[var(--color-accent)]/5 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-accent)] font-mono text-xs tracking-wider bg-[var(--bg-primary)]/80 px-3 py-1.5 border border-[var(--color-accent)]/30">CLICK TO EXPAND</span>
          </div>
        </div>
        <figcaption className="font-mono text-[11px] text-[var(--color-text-muted)] mt-2">{description}</figcaption>
      </figure>
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 cursor-pointer animate-fade-in" onClick={() => setLightbox(false)}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img src={src} alt={description} className="max-w-full max-h-[90vh] object-contain border border-[var(--color-border)]" />
            <button className="absolute -top-3 -right-3 w-7 h-7 bg-[var(--bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors" onClick={() => setLightbox(false)}>
              <XIcon size={14} />
            </button>
            <div className="absolute -bottom-8 left-0 right-0 text-center font-mono text-xs text-[var(--color-text-muted)]">{description}</div>
          </div>
        </div>
      )}
    </>
  );
}
