'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStore } from '@/lib/store';
import {
  MousePointer2, Plus, ArrowRight, Trash2, Undo2, Redo2,
  LayoutGrid, Share2, PanelBottom, PanelRight, Maximize2,
  BookOpen, TreePine, Download, Upload, FileText, Image as ImageIcon, Code,
  Search, ArrowRightLeft, Zap, RotateCcw, XCircle, CheckSquare,
  Command,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface CmdItem {
  id: string;
  label: string;
  shortcut?: string;
  icon: ReactNode;
  category: string;
  action: () => void;
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function CommandPalette({ onModeChange, onPumpingLemma }: { onModeChange: (mode: string) => void; onPumpingLemma?: () => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const storeRef = useRef(useStore.getState());
  useEffect(() => useStore.subscribe(s => { storeRef.current = s; }), []);

  const commands: CmdItem[] = useMemo(() => [
    // Modes
    { id: 'mode-dfa', label: 'DFA', shortcut: '1', icon: <Zap size={14} />, category: 'Mode', action: () => onModeChange('dfa') },
    { id: 'mode-nfa', label: 'NFA', shortcut: '2', icon: <Zap size={14} />, category: 'Mode', action: () => onModeChange('nfa') },
    { id: 'mode-pda', label: 'PDA', shortcut: '3', icon: <Zap size={14} />, category: 'Mode', action: () => onModeChange('pda') },
    { id: 'mode-tm', label: 'Turing Machine', shortcut: '4', icon: <Zap size={14} />, category: 'Mode', action: () => onModeChange('tm') },
    { id: 'mode-mealy', label: 'Mealy', shortcut: '5', icon: <Zap size={14} />, category: 'Mode', action: () => onModeChange('mealy') },
    { id: 'mode-moore', label: 'Moore', shortcut: '6', icon: <Zap size={14} />, category: 'Mode', action: () => onModeChange('moore') },
    { id: 'mode-cfg', label: 'CFG (Context-Free Grammar)', shortcut: '7', icon: <BookOpen size={14} />, category: 'Mode', action: () => onModeChange('grammar') },
    { id: 'mode-lsystem', label: 'L-Systems', shortcut: '8', icon: <TreePine size={14} />, category: 'Mode', action: () => onModeChange('lsystem') },

    // Tools
    { id: 'tool-pointer', label: 'Pointer', shortcut: 'V', icon: <MousePointer2 size={14} />, category: 'Tool', action: () => storeRef.current.setTool('pointer') },
    { id: 'tool-state', label: 'Add State', shortcut: 'S', icon: <Plus size={14} />, category: 'Tool', action: () => storeRef.current.setTool('addState') },
    { id: 'tool-transition', label: 'Add Transition', shortcut: 'T', icon: <ArrowRight size={14} />, category: 'Tool', action: () => storeRef.current.setTool('addTransition') },
    { id: 'tool-delete', label: 'Delete Selected', shortcut: 'Del', icon: <Trash2 size={14} />, category: 'Tool', action: () => storeRef.current.deleteSelected() },

    // Actions
    { id: 'act-undo', label: 'Undo', shortcut: '⌘Z', icon: <Undo2 size={14} />, category: 'Action', action: () => storeRef.current.undo() },
    { id: 'act-redo', label: 'Redo', shortcut: '⌘⇧Z', icon: <Redo2 size={14} />, category: 'Action', action: () => storeRef.current.redo() },
    { id: 'act-selectall', label: 'Select All', shortcut: '⌘A', icon: <CheckSquare size={14} />, category: 'Action', action: () => { const s = storeRef.current; s.setSelected(new Set(s.states.map(st => st.id))); } },
    { id: 'act-clear', label: 'Clear All', shortcut: '⌘⇧X', icon: <XCircle size={14} />, category: 'Action', action: () => storeRef.current.clearAll() },
    { id: 'act-layout', label: 'Auto Layout', shortcut: '⌘⇧L', icon: <LayoutGrid size={14} />, category: 'Action', action: () => storeRef.current.autoLayout() },
    { id: 'act-zoomfit', label: 'Zoom to Fit', shortcut: '⌘1', icon: <Maximize2 size={14} />, category: 'Action', action: () => storeRef.current.zoomToFit() },

    // Panels
    { id: 'panel-sidebar', label: 'Toggle Sidebar', shortcut: '⌘/', icon: <PanelRight size={14} />, category: 'Panel', action: () => storeRef.current.toggleSidebar() },
    { id: 'panel-sim', label: 'Toggle Simulation', shortcut: '⌘.', icon: <PanelBottom size={14} />, category: 'Panel', action: () => storeRef.current.toggleSimPanel() },
    { id: 'panel-convert', label: 'Toggle Conversions', shortcut: '⌘M', icon: <ArrowRightLeft size={14} />, category: 'Panel', action: () => window.dispatchEvent(new CustomEvent('stateforge:toggle-convert')) },

    // Export
    { id: 'exp-share', label: 'Share URL', shortcut: '⌘S', icon: <Share2 size={14} />, category: 'Export', action: () => window.dispatchEvent(new CustomEvent('stateforge:share')) },
    { id: 'exp-json', label: 'Export JSON', shortcut: '⌘E', icon: <FileText size={14} />, category: 'Export', action: () => window.dispatchEvent(new CustomEvent('stateforge:export')) },
    { id: 'exp-png', label: 'Export PNG', icon: <ImageIcon size={14} />, category: 'Export', action: () => window.dispatchEvent(new CustomEvent('stateforge:export-png')) },
    { id: 'exp-svg', label: 'Export SVG', icon: <Code size={14} />, category: 'Export', action: () => window.dispatchEvent(new CustomEvent('stateforge:export-svg')) },
    { id: 'exp-import', label: 'Import File', shortcut: '⌘O', icon: <Upload size={14} />, category: 'Export', action: () => window.dispatchEvent(new CustomEvent('stateforge:import')) },

    // Games
    ...(onPumpingLemma ? [{ id: 'game-pumping', label: 'Pumping Lemma Game', icon: <Zap size={14} />, category: 'Game', action: () => onPumpingLemma() }] : []),
  ], [onModeChange, onPumpingLemma]);

  const filtered = query
    ? commands.filter(c => fuzzyMatch(query, c.label) || fuzzyMatch(query, c.category))
    : commands;

  // Global ⌘K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Keep selected in view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Clamp index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const execute = useCallback((cmd: CmdItem) => {
    setOpen(false);
    cmd.action();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) execute(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }, [filtered, selectedIndex, execute]);

  if (!open) return null;

  // Group by category
  let lastCat = '';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[480px] max-h-[60vh] flex flex-col bg-[var(--bg-surface)] border border-[var(--color-border)] shadow-panel animate-scale-in"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--color-border)]">
          <Search size={14} className="text-[var(--color-text-dim)] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command…"
            className="flex-1 bg-transparent text-[var(--color-text)] font-mono text-sm outline-none placeholder:text-[var(--color-text-dim)]"
          />
          <kbd className="text-[10px] font-mono text-[var(--color-text-dim)] border border-[var(--color-border)] px-1.5 py-0.5 bg-[var(--bg-surface-sunken)]">ESC</kbd>
        </div>

        {/* List */}
        <div ref={listRef} className="overflow-y-auto flex-1 py-1">
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-center font-mono text-xs text-[var(--color-text-dim)]">No results</div>
          )}
          {filtered.map((cmd, i) => {
            const showCat = cmd.category !== lastCat;
            lastCat = cmd.category;
            return (
              <div key={cmd.id}>
                {showCat && (
                  <div className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-widest text-[var(--color-accent)] uppercase font-medium">
                    {cmd.category}
                  </div>
                )}
                <button
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors ${
                    i === selectedIndex
                      ? 'bg-[var(--color-accent)]/15 text-[var(--color-text)]'
                      : 'text-[var(--color-text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-text)]'
                  }`}
                  onClick={() => execute(cmd)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span className="shrink-0 opacity-60">{cmd.icon}</span>
                  <span className="flex-1 font-mono text-xs">{cmd.label}</span>
                  {cmd.shortcut && (
                    <kbd className="text-[10px] font-mono text-[var(--color-text-dim)] border border-[var(--color-border)] px-1.5 py-0.5 bg-[var(--bg-surface-sunken)] shrink-0">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
