'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store';
import { decodeAutomaton, loadFromLocalStorage, saveToLocalStorage } from '@/url';
import { useIsMobile } from '@/hooks/useIsMobile';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import Sidebar from './Sidebar';
import SimPanel from './SimPanel';
import ConvertPanel from './ConvertPanel';
import GrammarEditor from './GrammarEditor';
import PDASimPanel from './PDASimPanel';
import TMSimPanel from './TMSimPanel';
import MealyMoorePanel from './MealyMoorePanel';
import LSystem from './LSystem';
import Gallery from './Gallery';
import { X } from 'lucide-react';

export default function App() {
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);
  const mode = useStore(s => s.mode);
  const loadAutomaton = useStore(s => s.loadAutomaton);
  const undo = useStore(s => s.undo);
  const redo = useStore(s => s.redo);
  const deleteSelected = useStore(s => s.deleteSelected);
  const clearSelection = useStore(s => s.clearSelection);
  const setTool = useStore(s => s.setTool);
  const setMode = useStore(s => s.setMode);
  const isMobile = useIsMobile();
  const [showConvert, setShowConvert] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showLSystem, setShowLSystem] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showGallery, setShowGallery] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.location.hash && !localStorage.getItem('stateforge_autosave');
    }
    return false;
  });

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1100);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const data = decodeAutomaton(hash);
      if (data) {
        loadAutomaton(data.states, data.transitions, data.mode);
        setShowGallery(false);
        return;
      }
    }
    const saved = loadFromLocalStorage();
    if (saved && saved.states.length > 0) {
      loadAutomaton(saved.states, saved.transitions, saved.mode);
      setShowGallery(false);
    }
  }, [loadAutomaton]);

  useEffect(() => {
    if (!showGrammar && !showLSystem && !showGallery) {
      const timer = setTimeout(() => {
        saveToLocalStorage(states, transitions, mode);
        if (states.length > 0) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [states, transitions, mode, showGrammar, showLSystem, showGallery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (showGrammar || showLSystem || showGallery) return;
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) { e.preventDefault(); redo(); showToast('Redo'); }
      else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); showToast('Undo'); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
      else if (e.key === 'Escape') { clearSelection(); setShowShortcuts(false); }
      else if (e.key === '?') { setShowShortcuts(v => !v); }
      else if (e.key === 'v' || e.key === 'V') { setTool('pointer'); }
      else if (e.key === 's' && !e.ctrlKey && !e.metaKey) { setTool('addState'); }
      else if (e.key === 't' && !e.ctrlKey && !e.metaKey) { setTool('addTransition'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelected, clearSelection, setTool, showGrammar, showLSystem, showGallery, showToast]);

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'width=device-width, initial-scale=1');
  }, []);

  const handleModeChange = (newMode: string) => {
    setShowGallery(false);
    if (newMode === 'grammar') {
      setShowGrammar(true); setShowLSystem(false); setShowConvert(false);
    } else if (newMode === 'lsystem') {
      setShowLSystem(true); setShowGrammar(false); setShowConvert(false);
    } else {
      setShowGrammar(false); setShowLSystem(false);
      setMode(newMode as 'dfa' | 'nfa' | 'pda' | 'tm' | 'mealy' | 'moore');
    }
  };

  const toolbarProps = {
    isMobile,
    onConvert: () => setShowConvert(true),
    onModeChange: handleModeChange,
    onGallery: () => setShowGallery(true),
    grammarMode: showGrammar,
    lsystemMode: showLSystem,
    saved,
    onShortcuts: () => setShowShortcuts(true),
  };

  const shortcuts = [
    ['V', 'Pointer tool'],
    ['S', 'Add State tool'],
    ['T', 'Add Transition tool'],
    ['Double-click', 'Add state / Edit label'],
    ['Right-click', 'Context menu'],
    ['Del / Backspace', 'Delete selected'],
    ['Ctrl+Z', 'Undo'],
    ['Ctrl+Shift+Z', 'Redo'],
    ['Space + Drag', 'Pan canvas'],
    ['Scroll', 'Zoom'],
    ['Shift+Click', 'Multi-select'],
    ['Esc', 'Deselect / Close'],
    ['?', 'Toggle this help'],
  ];

  const overlays = (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--color-border)] px-4 py-1.5 font-mono text-xs text-[var(--color-text)] shadow-panel animate-toast">
            {toast}
          </div>
        </div>
      )}
      {/* Shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60" onClick={() => setShowShortcuts(false)}>
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--color-border)] shadow-panel w-80 max-h-[80vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
              <span className="font-mono text-xs font-semibold tracking-widest uppercase text-[var(--color-text-bright)]">Keyboard Shortcuts</span>
              <button onClick={() => setShowShortcuts(false)} className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]"><X size={14} /></button>
            </div>
            <div className="p-4 space-y-2">
              {shortcuts.map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[var(--color-text-dim)]">{desc}</span>
                  <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1.5 py-0.5 text-[var(--color-accent)] text-[11px]">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Gallery view
  if (showGallery) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col overflow-hidden relative">
        <Toolbar {...toolbarProps} />
        <Gallery onSelect={() => setShowGallery(false)} />
        {overlays}
      </div>
    );
  }

  // Grammar view
  if (showGrammar) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col overflow-hidden relative">
        <Toolbar {...toolbarProps} />
        <GrammarEditor isMobile={isMobile} />
        {overlays}
      </div>
    );
  }

  // L-System view
  if (showLSystem) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col overflow-hidden relative">
        <Toolbar {...toolbarProps} />
        <LSystem isMobile={isMobile} />
        {overlays}
      </div>
    );
  }

  // Main automaton view
  const bottomPanel = showConvert ? (
    <ConvertPanel isMobile={isMobile} onClose={() => setShowConvert(false)} />
  ) : mode === 'pda' ? (
    <PDASimPanel isMobile={isMobile} />
  ) : mode === 'tm' ? (
    <TMSimPanel isMobile={isMobile} />
  ) : mode === 'mealy' || mode === 'moore' ? (
    <MealyMoorePanel isMobile={isMobile} />
  ) : (
    <SimPanel isMobile={isMobile} />
  );

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden relative">
      <Toolbar {...toolbarProps} />
      <div className="flex flex-1 overflow-hidden relative">
        <Canvas isMobile={isMobile} />
        <Sidebar isMobile={isMobile} />
      </div>
      {bottomPanel}
      {overlays}
    </div>
  );
}
