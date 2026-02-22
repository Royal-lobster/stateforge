'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/store';
import {
  MousePointer2, Plus, ArrowRight, Trash2, Undo2, Redo2,
  LayoutGrid, Share2, PanelBottom, PanelRight, RotateCcw, Maximize2,
  ArrowRightLeft, BookOpen, TreePine, Home, Download, Upload, Github, FileText,
  ChevronDown, Menu, Image, FileCode, Copy,
} from 'lucide-react';
import { downloadSVG, downloadPNG, copyTikZ } from '@/lib/export';
import { encodeAutomaton } from '@/url';
import type { State, Transition, Mode } from '@/types';
import Tooltip from './Tooltip';

/* ── Reusable button ─────────────────────────────────────── */
function ToolBtn({ active, onClick, children, title, shortcut, disabled, className: cx }: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  shortcut?: string;
  disabled?: boolean;
  className?: string;
}) {
  const btn = (
    <button
      onClick={onClick}
      aria-label={title}
      disabled={disabled}
      className={`flex items-center justify-center transition-colors ${active
        ? 'bg-[var(--color-accent)] text-[var(--bg-primary)] glow-accent'
        : disabled
          ? 'text-[var(--color-text-dim)] opacity-30'
          : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--bg-hover)] active:bg-[var(--color-accent)]/10'
      } ${cx ?? ''}`}
    >
      {children}
    </button>
  );
  return <Tooltip label={title} shortcut={shortcut}>{btn}</Tooltip>;
}

/* ── Mobile mode selector dropdown ───────────────────────── */
function ModeDropdown({ mode, grammarMode, lsystemMode, onModeChange }: {
  mode: string;
  grammarMode?: boolean;
  lsystemMode?: boolean;
  onModeChange: (m: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const allModes = [
    { id: 'dfa', label: 'DFA' },
    { id: 'nfa', label: 'NFA' },
    { id: 'pda', label: 'PDA' },
    { id: 'tm', label: 'TM' },
    { id: 'mealy', label: 'Mealy' },
    { id: 'moore', label: 'Moore' },
    { id: 'grammar', label: 'CFG' },
    { id: 'lsystem', label: 'L-Sys' },
  ];
  const current = grammarMode ? 'CFG' : lsystemMode ? 'L-Sys' : mode.toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 font-mono text-xs font-bold tracking-wider text-[var(--color-accent)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 min-h-[36px]"
      >
        {current}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--bg-surface-raised)] border border-[var(--color-border)] shadow-panel min-w-[120px] animate-scale-in">
            {allModes.map(m => (
              <button
                key={m.id}
                onClick={() => { onModeChange(m.id); setOpen(false); }}
                className={`w-full text-left px-3 py-2 font-mono text-xs tracking-wider flex items-center gap-2 transition-colors ${
                  (m.id === mode && !grammarMode && !lsystemMode) ||
                  (m.id === 'grammar' && grammarMode) ||
                  (m.id === 'lsystem' && lsystemMode)
                    ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {m.id === 'grammar' && <BookOpen size={12} />}
                {m.id === 'lsystem' && <TreePine size={12} />}
                {m.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Export Dropdown ──────────────────────────────────────── */
function ExportDropdown({ states, transitions, mode, onExportJSON }: {
  states: any[];
  transitions: any[];
  mode: string;
  onExportJSON: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const items = [
    { label: 'JSON', icon: <FileText size={12} />, action: () => { onExportJSON(); setOpen(false); } },
    { label: 'SVG', icon: <FileCode size={12} />, action: () => { downloadSVG(states, mode as any); setOpen(false); } },
    { label: 'PNG', icon: <Image size={12} />, action: () => { downloadPNG(states, mode as any); setOpen(false); } },
    { label: 'LaTeX', icon: <Copy size={12} />, action: async () => {
      const ok = await copyTikZ(states, transitions, mode as any);
      showToast(ok ? 'TikZ copied!' : 'Copy failed');
      setOpen(false);
    }},
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--bg-hover)] transition-colors"
        title="Export (⌘E)"
      >
        <Download size={16} />
        <ChevronDown size={10} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 z-50 bg-[var(--bg-surface-raised)] border border-[var(--color-border)] shadow-panel min-w-[130px] animate-scale-in">
            {items.map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full text-left px-3 py-2 font-mono text-xs tracking-wider flex items-center gap-2 text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
      {toast && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-[var(--color-accent)] text-[var(--bg-primary)] px-3 py-1.5 font-mono text-xs whitespace-nowrap animate-scale-in">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ── Props ────────────────────────────────────────────────── */
interface ToolbarProps {
  isMobile: boolean;
  onConvert: () => void;
  onModeChange?: (mode: string) => void;
  onGallery?: () => void;
  grammarMode?: boolean;
  lsystemMode?: boolean;
  saved?: boolean;
  onShortcuts?: () => void;
}

/* ── Main Toolbar ────────────────────────────────────────── */
export default function Toolbar({ isMobile, onConvert, onModeChange, onGallery, grammarMode, lsystemMode, saved, onShortcuts }: ToolbarProps) {
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
  const zoomToFit = useStore(s => s.zoomToFit);
  const toggleSidebar = useStore(s => s.toggleSidebar);
  const toggleSimPanel = useStore(s => s.toggleSimPanel);
  const loadAutomaton = useStore(s => s.loadAutomaton);

  const [shareText, setShareText] = useState('SHARE');

  const handleShare = useCallback(async () => {
    const hash = encodeAutomaton(states, transitions, mode);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareText('COPIED');
    } catch {
      prompt('Copy this URL:', url);
      setShareText('COPIED');
    }
    setTimeout(() => setShareText('SHARE'), 1200);
  }, [states, transitions, mode]);

  const handleExport = useCallback(() => {
    const data = JSON.stringify({ states, transitions, mode, _format: 'stateforge-v1' }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stateforge-${mode}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [states, transitions, mode]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.jff';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        if (file.name.endsWith('.jff')) {
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
          const jMode: Mode = type === 'pda' ? 'pda' : type === 'turing' ? 'tm' : 'nfa';
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
  }, [loadAutomaton]);

  useEffect(() => {
    const onShare = () => handleShare();
    const onExport = () => handleExport();
    const onImport = () => handleImport();
    window.addEventListener('stateforge:share', onShare);
    window.addEventListener('stateforge:export', onExport);
    window.addEventListener('stateforge:import', onImport);
    return () => {
      window.removeEventListener('stateforge:share', onShare);
      window.removeEventListener('stateforge:export', onExport);
      window.removeEventListener('stateforge:import', onImport);
    };
  }, [handleShare, handleExport, handleImport]);

  const handleMode = (m: string) => onModeChange?.(m);
  const isSpecialMode = grammarMode || lsystemMode;

  const modes: { id: string; label: string; shortcut: string }[] = [
    { id: 'dfa', label: 'DFA', shortcut: '1' },
    { id: 'nfa', label: 'NFA', shortcut: '2' },
    { id: 'pda', label: 'PDA', shortcut: '3' },
    { id: 'tm', label: 'TM', shortcut: '4' },
    { id: 'mealy', label: 'MEALY', shortcut: '5' },
    { id: 'moore', label: 'MOORE', shortcut: '6' },
  ];

  const isActiveMode = (id: string) => !isSpecialMode && mode === id;

  /* ── MOBILE LAYOUT ──────────────────────────────────────── */
  if (isMobile) {
    const mb = "w-9 h-9 flex items-center justify-center shrink-0";
    return (
      <div className="shrink-0 select-none bg-[var(--bg-surface)] border-b border-[var(--color-border)]">
        {/* Row 1: Brand + Mode + File actions + Panels */}
        <div className="h-10 flex items-center px-1.5 gap-0.5 border-b border-[var(--color-border)]/50">
          <button onClick={onGallery} className="shrink-0 p-1.5 text-[var(--color-accent)]" title="Gallery">
            <Home size={15} />
          </button>

          <ModeDropdown mode={mode} grammarMode={grammarMode} lsystemMode={lsystemMode} onModeChange={handleMode} />

          {!isSpecialMode && (
            <button onClick={onConvert} className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] shrink-0">
              <ArrowRightLeft size={14} />
            </button>
          )}

          <div className="flex-1 min-w-1" />

          {saved && <span className="font-mono text-[10px] text-[var(--color-text-muted)] animate-fade-in shrink-0">saved</span>}

          <ToolBtn onClick={handleShare} title="Share" className={mb}><Share2 size={15} /></ToolBtn>
          <ToolBtn onClick={handleImport} title="Import" className={mb}><Upload size={15} /></ToolBtn>
          <ToolBtn onClick={handleExport} title="Export" className={mb}><Download size={15} /></ToolBtn>

          <div className="w-px h-4 bg-[var(--color-border)] mx-0.5 shrink-0" />

          {!isSpecialMode && (
            <>
              <ToolBtn onClick={toggleSimPanel} title="Simulation" className={mb}><PanelBottom size={15} /></ToolBtn>
              <ToolBtn onClick={toggleSidebar} title="Properties" className={mb}><Menu size={15} /></ToolBtn>
            </>
          )}
        </div>

        {/* Row 2: Canvas tools (only for canvas modes) */}
        {!isSpecialMode && (
          <div className="h-9 flex items-center px-1 gap-0">
            <ToolBtn active={tool === 'pointer'} onClick={() => setTool('pointer')} title="Pointer" shortcut="V" className={mb}>
              <MousePointer2 size={15} />
            </ToolBtn>
            <ToolBtn active={tool === 'addState'} onClick={() => setTool('addState')} title="Add State" shortcut="S" className={mb}>
              <Plus size={15} />
            </ToolBtn>
            <ToolBtn active={tool === 'addTransition'} onClick={() => setTool('addTransition')} title="Add Transition" shortcut="T" className={mb}>
              <ArrowRight size={15} />
            </ToolBtn>

            <div className="w-px h-4 bg-[var(--color-border)] mx-0.5 shrink-0" />

            <ToolBtn onClick={deleteSelected} title="Delete" className={mb}>
              <Trash2 size={15} />
            </ToolBtn>
            <ToolBtn onClick={undo} title="Undo" className={mb}>
              <Undo2 size={15} className={undoStack.length === 0 ? 'opacity-30' : ''} />
            </ToolBtn>
            <ToolBtn onClick={redo} title="Redo" className={mb}>
              <Redo2 size={15} className={redoStack.length === 0 ? 'opacity-30' : ''} />
            </ToolBtn>

            <div className="w-px h-4 bg-[var(--color-border)] mx-0.5 shrink-0" />

            <ToolBtn onClick={zoomToFit} title="Zoom to Fit" className={mb}>
              <Maximize2 size={15} />
            </ToolBtn>
            <ToolBtn onClick={autoLayout} title="Layout" className={mb}>
              <LayoutGrid size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => { if (window.confirm('Clear all states and transitions?')) clearAll(); }} title="Clear" className={mb}>
              <RotateCcw size={15} />
            </ToolBtn>

            <div className="flex-1" />

            <a href="/docs" className={`${mb} text-[var(--color-text-muted)] hover:text-[var(--color-accent)]`} title="Docs">
              <FileText size={15} />
            </a>
            <a href="https://github.com/Royal-lobster/stateforge" target="_blank" rel="noopener noreferrer" className={`${mb} text-[var(--color-text-muted)] hover:text-[var(--color-accent)]`} title="GitHub">
              <Github size={15} />
            </a>
          </div>
        )}
      </div>
    );
  }

  /* ── DESKTOP LAYOUT ─────────────────────────────────────── */
  return (
    <div className="h-9 bg-[var(--bg-surface)] border-b border-[var(--color-border)] flex items-center px-1 gap-0.5 shrink-0 select-none overflow-x-auto scrollbar-hide">
      {/* Logo / Home */}
      <button
        onClick={onGallery}
        className="font-mono text-xs font-bold tracking-wider text-[var(--color-accent)] px-2 mr-2 border-r border-[var(--color-border)] h-full flex items-center shrink-0 hover:bg-[var(--bg-primary)] transition-colors"
        title="Gallery"
      >
        STATEFORGE
      </button>

      {/* Canvas tools */}
      {!isSpecialMode && (
        <>
          <ToolBtn active={tool === 'pointer'} onClick={() => setTool('pointer')} title="Pointer" shortcut="V" className="p-1.5">
            <MousePointer2 size={16} />
          </ToolBtn>
          <ToolBtn active={tool === 'addState'} onClick={() => setTool('addState')} title="Add State" shortcut="S" className="p-1.5">
            <Plus size={16} />
          </ToolBtn>
          <ToolBtn active={tool === 'addTransition'} onClick={() => setTool('addTransition')} title="Add Transition" shortcut="T" className="p-1.5">
            <ArrowRight size={16} />
          </ToolBtn>

          <div className="w-px h-5 bg-[var(--color-border)] mx-1 shrink-0" />

          <ToolBtn onClick={deleteSelected} title="Delete Selected" shortcut="Del" className="p-1.5">
            <Trash2 size={16} />
          </ToolBtn>
          <ToolBtn onClick={undo} title="Undo" shortcut="⌘Z" className="p-1.5">
            <Undo2 size={16} className={undoStack.length === 0 ? 'opacity-30' : ''} />
          </ToolBtn>
          <ToolBtn onClick={redo} title="Redo" shortcut="⌘⇧Z" className="p-1.5">
            <Redo2 size={16} className={redoStack.length === 0 ? 'opacity-30' : ''} />
          </ToolBtn>

          <ToolBtn onClick={zoomToFit} title="Zoom to Fit" shortcut="⌘1" className="p-1.5">
            <Maximize2 size={16} />
          </ToolBtn>
          <ToolBtn onClick={autoLayout} title="Auto Layout" shortcut="⇧⌘L" className="p-1.5">
            <LayoutGrid size={16} />
          </ToolBtn>
          <ToolBtn onClick={() => { if (window.confirm('Clear all states and transitions?')) clearAll(); }} title="Clear All" shortcut="⇧⌘X" className="p-1.5">
            <RotateCcw size={16} />
          </ToolBtn>

          <div className="w-px h-5 bg-[var(--color-border)] mx-1 shrink-0" />
        </>
      )}

      {/* Mode tabs */}
      <div className="flex items-center font-mono text-[11px] tracking-wider shrink-0">
        {modes.map(m => (
          <Tooltip key={m.id} label={m.label} shortcut={m.shortcut}>
            <button
              onClick={() => handleMode(m.id)}
              className={`px-2 py-1 flex items-center transition-colors whitespace-nowrap ${
                isActiveMode(m.id)
                  ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
              }`}
            >
              {m.label}
            </button>
          </Tooltip>
        ))}

        <div className="w-px h-4 bg-[var(--color-border)] mx-0.5 shrink-0" />

        <button
          onClick={() => handleMode('grammar')}
          className={`px-2 py-1 flex items-center gap-1 transition-colors ${grammarMode
            ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
            : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
          }`}
        >
          <BookOpen size={11} /> CFG
        </button>

        <button
          onClick={() => handleMode('lsystem')}
          className={`px-2 py-1 flex items-center gap-1 transition-colors ${lsystemMode
            ? 'bg-[var(--color-accent)] text-[var(--bg-primary)]'
            : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
          }`}
        >
          <TreePine size={11} /> L-SYS
        </button>
      </div>

      {/* Convert */}
      {!isSpecialMode && (
        <>
          <div className="w-px h-5 bg-[var(--color-border)] mx-1 shrink-0" />
          <button
            onClick={onConvert}
            title="Conversions (⌘M)"
            className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] tracking-wider text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors shrink-0"
          >
            <ArrowRightLeft size={14} />
            CONVERT
          </button>
        </>
      )}

      <div className="flex-1" />

      {/* Right side */}
      {!isSpecialMode && (
        <>
          <ToolBtn onClick={handleImport} title="Import" shortcut="⌘O" className="p-1.5">
            <Upload size={16} />
          </ToolBtn>
          <ToolBtn onClick={handleExport} title="Export" shortcut="⌘E" className="p-1.5">
            <Download size={16} />
          </ToolBtn>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] tracking-wider text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors shrink-0"
          >
            <Share2 size={12} />
            {shareText}
          </button>
        </>
      )}
      {saved && <span className="font-mono text-[11px] text-[var(--color-text-muted)] animate-fade-in shrink-0">saved</span>}
      {onShortcuts && (
        <button onClick={onShortcuts} title="Keyboard Shortcuts (?)" className="px-1.5 py-1 font-mono text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors shrink-0">?</button>
      )}
      <ToolBtn onClick={toggleSimPanel} title="Simulation Panel" shortcut="⌘." className="p-1.5">
        <PanelBottom size={16} />
      </ToolBtn>
      <ToolBtn onClick={toggleSidebar} title="Properties Panel" shortcut="⌘/" className="p-1.5">
        <PanelRight size={16} />
      </ToolBtn>
      <a href="/docs" className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors shrink-0 ml-1" title="Docs">
        <FileText size={14} />
      </a>
      <a href="https://github.com/Royal-lobster/stateforge" target="_blank" rel="noopener noreferrer" className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors shrink-0" title="GitHub">
        <Github size={14} />
      </a>
    </div>
  );
}
