'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ background: '#0a0a0a', color: '#ef4444', minHeight: '100vh', padding: 40, fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Something broke</h1>
      <pre style={{ color: '#d4d4d4', fontSize: 14, whiteSpace: 'pre-wrap', marginBottom: 24 }}>
        {error.message}
        {'\n\n'}
        {error.stack}
      </pre>
      <button
        onClick={reset}
        style={{ background: '#22d3ee', color: '#0a0a0a', border: 'none', padding: '8px 16px', cursor: 'pointer', fontFamily: 'monospace' }}
      >
        Try again
      </button>
    </div>
  );
}
