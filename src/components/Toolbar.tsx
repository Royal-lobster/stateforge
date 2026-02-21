'use client';

import { useStore } from '@/store';
import {
  MousePointer2, Plus, ArrowRight, Trash2, Undo2, Redo2,
  LayoutGrid, Share2, PanelBottom, PanelRight, RotateCcw, Menu,
  ArrowRightLeft, BookOpen, TreePine, Home, Download, Upload,
} from 'lucide-react';
import { encodeAutomaton } from '@/url';
import type { State, Transition, Mode } from '@/types';

function ToolBtn({ active, onClick, children, title, disabled }: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:p-1.5 flex items-center justify-center transition-colors ${active
        ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
        : disabled
          ? 'text-[var(--color-text-dim)] opacity-30'
          : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--bg-surface)] active:bg-[var(--bg-surface)]'
      }`}
    >
      {children}
    </button>
  );
}

interface ToolbarProps {
  isMobile: boolean;
  onConvert: () => void;
  onModeChange?: (mode: string) => void;
  onGallery?: () => void;
  grammarMode?: boolean;
  lsystemMode?: boolean;
}

export default function Toolbar({ isMobile, onConvert, onModeChange, onGallery, grammarMode, lsystemMode }: ToolbarProps) {
  const tool = useStore(s => s.tool);
  const mode = useStore(s => s.mode);
  const undoStack = useStore(s => s.undoStack);
  const redoStack = useStore(s => s.redoStack);
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);

  const setTool = useStore(s => s.setTool);
  const deleteSelected = useStore(s => s.deleteSelected);
  const undo = useStore(s => s.undo);
  const redo = useStore(s => s.redo);
  const autoLayout = useStore(s => s.autoLayout);
  const clearAll = useStore(s => s.clearAll);
  const toggleSidebar = useStore(s => s.toggleSidebar);
  const toggleSimPanel = useStore(s => s.toggleSimPanel);

  const loadAutomaton = useStore(s => s.loadAutomaton);

  const handleShare = () => {
    const hash = encodeAutomaton(states, transitions, mode);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    navigator.clipboard.writeText(url);
    const btn = document.getElementById('share-btn');
    if (btn) {
      btn.textContent = 'COPIED';
      setTimeout(() => { btn.textContent = 'SHARE'; }, 1200);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ states, transitions, mode, _format: 'stateforge-v1' }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stateforge-${mode}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.jff';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        if (file.name.endsWith('.jff')) {
          // JFLAP .jff XML import
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/xml');
          const type = doc.querySelector('type')?.textContent ?? 'fa';
          const jStates: State[] = [];
          const jTrans: Transition[] = [];
          const stateIdMap = new Map<string, string>();
          doc.querySelectorAll('state').forEach((el) => {
            const jId = el.getAttribute('id') ?? '';
            const name = el.getAttribute('name') ?? `q${jId}`;
            const x = parseFloat(el.querySelector('x')?.textContent ?? '0');
            const y = parseFloat(el.querySelector('y')?.textContent ?? '0');
            const isInitial = !!el.querySelector('initial');
            const isAccepting = !!el.querySelector('final');
            const id = `jff_${jId}`;
            stateIdMap.set(jId, id);
            jStates.push({ id, label: name, x, y, isInitial, isAccepting });
          });
          // Group transitions by from→to
          const transMap = new Map<string, string[]>();
          doc.querySelectorAll('transition').forEach((el) => {
            const from = stateIdMap.get(el.querySelector('from')?.textContent ?? '') ?? '';
            const to = stateIdMap.get(el.querySelector('to')?.textContent ?? '') ?? '';
            const read = el.querySelector('read')?.textContent ?? '';
            const symbol = read === '' ? 'ε' : read;
            const key = `${from}→${to}`;
            if (!transMap.has(key)) transMap.set(key, []);
            transMap.get(key)!.push(symbol);
          });
          let tIdx = 0;
          for (const [key, symbols] of transMap) {
            const [from, to] = key.split('→');
            jTrans.push({ id: `jt_${tIdx++}`, from, to, symbols });
          }
          const jMode: Mode = type === 'pda' ? 'pda' : type === 'turing' ? 'tm' : jStates.length > 0 ? 'nfa' : 'dfa';
          loadAutomaton(jStates, jTrans, jMode);
        } else {
          const data = JSON.parse(text);
          if (data.states && data.transitions) {
            loadAutomaton(data.states, data.transitions, data.mode ?? 'dfa');
          }
        }
      } catch (err) {
        console.error('Import failed:', err);
      }
    };
    input.click();
  };

  const handleMode = (m: string) => onModeChange?.(m);

  const iconSize = isMobile ? 18 : 16;
  const isSpecialMode = grammarMode || lsystemMode;

  const modes: { id: string; label: string; icon?: React.ComponentType<{ size?: number }> }[] = [
    { id: 'dfa', label: 'DFA' },
    { id: 'nfa', label: 'NFA' },
    { id: 'pda', label: 'PDA' },
    { id: 'tm', label: 'TM' },
    { id: 'mealy', label: 'MEALY' },
    { id: 'moore', label: 'MOORE' },
  ];

  const isActiveMode = (id: string) => !isSpecialMode && mode === id;

  return (
    <div className="h-11 md:h-9 bg-[var(--bg-surface)] border-b border-[var(--color-border)] flex items-center px-1 gap-0.5 shrink-0 select-none overflow-x-auto scrollbar-hide">
      {/* Logo / Home */}
      <button
        onClick={onGallery}
        className="font-mono text-xs font-bold tracking-wider text-[var(--color-accent)] px-2 mr-1 md:mr-2 border-r border-[var(--color-border)] h-full flex items-center shrink-0 hover:bg-[var(--bg-primary)] transition-colors"
        title="Gallery"
      >
        {isMobile ? <Home size={16} /> : 'STATEFORGE'}
      </button>

      {/* Canvas tools (hidden in special modes) */}
      {!isSpecialMode && (
        <>
          <ToolBtn active={tool === 'pointer'} onClick={() => setTool('pointer')} title="Pointer (V)">
            <MousePointer2 size={iconSize} />
          </ToolBtn>
          <ToolBtn active={tool === 'addState'} onClick={() => setTool('addState')} title="Add State (S)">
            <Plus size={iconSize} />
          </ToolBtn>
          <ToolBtn active={tool === 'addTransition'} onClick={() => setTool('addTransition')} title="Add Transition (T)">
            <ArrowRight size={iconSize} />
          </ToolBtn>

          <div className="w-px h-5 bg-[var(--color-border)] mx-0.5 md:mx-1 shrink-0" />

          <ToolBtn onClick={deleteSelected} title="Delete Selected (Del)">
            <Trash2 size={iconSize} />
          </ToolBtn>
          <ToolBtn onClick={undo} title="Undo (Ctrl+Z)">
            <Undo2 size={iconSize} className={undoStack.length === 0 ? 'opacity-30' : ''} />
          </ToolBtn>
          <ToolBtn onClick={redo} title="Redo (Ctrl+Shift+Z)">
            <Redo2 size={iconSize} className={redoStack.length === 0 ? 'opacity-30' : ''} />
          </ToolBtn>

          {!isMobile && (
            <>
              <ToolBtn onClick={autoLayout} title="Auto Layout">
                <LayoutGrid size={iconSize} />
              </ToolBtn>
              <ToolBtn onClick={clearAll} title="Clear All">
                <RotateCcw size={iconSize} />
              </ToolBtn>
            </>
          )}

          <div className="w-px h-5 bg-[var(--color-border)] mx-0.5 md:mx-1 shrink-0" />
        </>
      )}

      {/* Mode toggle */}
      <div className="flex items-center font-mono text-[11px] tracking-wider shrink-0 overflow-x-auto scrollbar-hide">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => handleMode(m.id)}
            className={`px-1.5 md:px-2 py-1 min-h-[44px] md:min-h-0 flex items-center transition-colors whitespace-nowrap ${
              isActiveMode(m.id)
                ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
                : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
            }`}
          >
            {m.label}
          </button>
        ))}

        <div className="w-px h-4 bg-[var(--color-border)] mx-0.5 shrink-0" />

        <button
          onClick={() => handleMode('grammar')}
          className={`px-1.5 md:px-2 py-1 min-h-[44px] md:min-h-0 flex items-center gap-1 transition-colors ${grammarMode
            ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
            : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
          }`}
        >
          <BookOpen size={isMobile ? 12 : 11} />
          CFG
        </button>

        <button
          onClick={() => handleMode('lsystem')}
          className={`px-1.5 md:px-2 py-1 min-h-[44px] md:min-h-0 flex items-center gap-1 transition-colors ${lsystemMode
            ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
            : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
          }`}
        >
          <TreePine size={isMobile ? 12 : 11} />
          {isMobile ? 'L' : 'L-SYS'}
        </button>
      </div>

      {/* Convert (only for automata modes) */}
      {!isSpecialMode && (
        <>
          <div className="w-px h-5 bg-[var(--color-border)] mx-0.5 md:mx-1 shrink-0" />
          <button
            onClick={onConvert}
            title="Conversions"
            aria-label="Conversions"
            className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] tracking-wider text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors shrink-0"
          >
            <ArrowRightLeft size={14} />
            {!isMobile && 'CONVERT'}
          </button>
        </>
      )}

      <div className="flex-1" />

      {/* Right side */}
      {!isSpecialMode && (
        <>
          {!isMobile && (
            <>
              <ToolBtn onClick={handleImport} title="Import (JSON/JFLAP)">
                <Upload size={iconSize} />
              </ToolBtn>
              <ToolBtn onClick={handleExport} title="Export JSON">
                <Download size={iconSize} />
              </ToolBtn>
              <button
                id="share-btn"
                onClick={handleShare}
                className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] tracking-wider text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors shrink-0"
              >
                <Share2 size={12} />
                SHARE
              </button>
            </>
          )}
          <ToolBtn onClick={toggleSimPanel} title="Toggle Simulation Panel">
            <PanelBottom size={iconSize} />
          </ToolBtn>
          <ToolBtn onClick={toggleSidebar} title="Toggle Sidebar">
            {isMobile ? <Menu size={iconSize} /> : <PanelRight size={iconSize} />}
          </ToolBtn>
        </>
      )}
    </div>
  );
}
