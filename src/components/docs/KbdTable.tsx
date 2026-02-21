export function KbdTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full font-mono text-xs border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left py-2 pr-4 text-[var(--color-text-dim)] font-medium">Shortcut</th>
            <th className="text-left py-2 text-[var(--color-text-dim)] font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, desc], i) => (
            <tr key={i} className="border-b border-[var(--color-border)]/30">
              <td className="py-1.5 pr-4">
                <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1.5 py-0.5 text-[var(--color-accent)] text-[11px]">{key}</kbd>
              </td>
              <td className="py-1.5 text-[var(--color-text)]">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
