'use client';

import { useStore } from '@/store';
import {
  MousePointer2, Plus, ArrowRight, Trash2, Undo2, Redo2,
  LayoutGrid, Share2, PanelBottom, PanelRight, RotateCcw
} from 'lucide-react';
import { encodeAutomaton } from '@/url';

function ToolBtn({ active, onClick, children, title }: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 transition-colors ${active
        ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
        : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--bg-surface)]'
      }`}
    >
      {children}
    </button>
  );
}

export default function Toolbar() {
  const tool = useStore(s => s.tool);
  const mode = useStore(s => s.mode);
  const undoStack = useStore(s => s.undoStack);
  const redoStack = useStore(s => s.redoStack);
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);

  const setTool = useStore(s => s.setTool);
  const setMode = useStore(s => s.setMode);
  const deleteSelected = useStore(s => s.deleteSelected);
  const undo = useStore(s => s.undo);
  const redo = useStore(s => s.redo);
  const autoLayout = useStore(s => s.autoLayout);
  const clearAll = useStore(s => s.clearAll);
  const toggleSidebar = useStore(s => s.toggleSidebar);
  const toggleSimPanel = useStore(s => s.toggleSimPanel);

  const handleShare = () => {
    const hash = encodeAutomaton(states, transitions, mode);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    navigator.clipboard.writeText(url);
    // brief flash feedback
    const btn = document.getElementById('share-btn');
    if (btn) {
      btn.textContent = 'COPIED';
      setTimeout(() => { btn.textContent = 'SHARE'; }, 1200);
    }
  };

  const iconSize = 16;

  return (
    <div className="h-9 bg-[var(--bg-surface)] border-b border-[var(--color-border)] flex items-center px-1 gap-0.5 shrink-0 select-none">
      {/* Logo */}
      <div className="font-mono text-xs font-bold tracking-wider text-[var(--color-accent)] px-2 mr-2 border-r border-[var(--color-border)] h-full flex items-center">
        STATEFORGE
      </div>

      {/* Tools */}
      <ToolBtn active={tool === 'pointer'} onClick={() => setTool('pointer')} title="Pointer (V)">
        <MousePointer2 size={iconSize} />
      </ToolBtn>
      <ToolBtn active={tool === 'addState'} onClick={() => setTool('addState')} title="Add State (S)">
        <Plus size={iconSize} />
      </ToolBtn>
      <ToolBtn active={tool === 'addTransition'} onClick={() => setTool('addTransition')} title="Add Transition (T)">
        <ArrowRight size={iconSize} />
      </ToolBtn>

      <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

      <ToolBtn onClick={deleteSelected} title="Delete Selected (Del)">
        <Trash2 size={iconSize} />
      </ToolBtn>
      <ToolBtn onClick={undo} title="Undo (Ctrl+Z)">
        <Undo2 size={iconSize} className={undoStack.length === 0 ? 'opacity-30' : ''} />
      </ToolBtn>
      <ToolBtn onClick={redo} title="Redo (Ctrl+Shift+Z)">
        <Redo2 size={iconSize} className={redoStack.length === 0 ? 'opacity-30' : ''} />
      </ToolBtn>
      <ToolBtn onClick={autoLayout} title="Auto Layout">
        <LayoutGrid size={iconSize} />
      </ToolBtn>
      <ToolBtn onClick={clearAll} title="Clear All">
        <RotateCcw size={iconSize} />
      </ToolBtn>

      <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

      {/* Mode toggle */}
      <div className="flex items-center font-mono text-[10px] tracking-wider">
        <button
          onClick={() => setMode('dfa')}
          className={`px-2 py-1 transition-colors ${mode === 'dfa'
            ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
            : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
          }`}
        >
          DFA
        </button>
        <button
          onClick={() => setMode('nfa')}
          className={`px-2 py-1 transition-colors ${mode === 'nfa'
            ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
            : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
          }`}
        >
          NFA
        </button>
      </div>

      <div className="flex-1" />

      {/* Right side */}
      <button
        id="share-btn"
        onClick={handleShare}
        className="flex items-center gap-1 px-2 py-1 font-mono text-[10px] tracking-wider text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors"
      >
        <Share2 size={12} />
        SHARE
      </button>
      <ToolBtn onClick={toggleSimPanel} title="Toggle Simulation Panel">
        <PanelBottom size={iconSize} />
      </ToolBtn>
      <ToolBtn onClick={toggleSidebar} title="Toggle Sidebar">
        <PanelRight size={iconSize} />
      </ToolBtn>
    </div>
  );
}
