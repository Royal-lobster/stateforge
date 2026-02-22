'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store';
import { encodeAutomaton, decodeAutomaton, loadFromLocalStorage, saveToLocalStorage } from '@/url';
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
import CommandPalette from './CommandPalette';
import PumpingLemma from './PumpingLemma';
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
  const autoLayout = useStore(s => s.autoLayout);
  const clearAll = useStore(s => s.clearAll);
  const toggleSidebar = useStore(s => s.toggleSidebar);
  const toggleSimPanel = useStore(s => s.toggleSimPanel);
  const addTrapState = useStore(s => s.addTrapState);
  const toggleSnapToGrid = useStore(s => s.toggleSnapToGrid);
  const simStart = useStore(s => s.simStart);
  const simStep = useStore(s => s.simStep);
  const simFastRun = useStore(s => s.simFastRun);
  const simReset = useStore(s => s.simReset);
  const setSelected = useStore(s => s.setSelected);
  const zoomToFit = useStore(s => s.zoomToFit);
  const isMobile = useIsMobile();
  const [showConvert, setShowConvert] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [showLSystem, setShowLSystem] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPumpingLemma, setShowPumpingLemma] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [initialGrammarText, setInitialGrammarText] = useState<string | undefined>(undefined);
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
        if (data.grammarText) {
          setInitialGrammarText(data.grammarText);
          setShowGrammar(true);
          setShowGallery(false);
          return;
        }
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
        // Sync URL hash so the address bar is always shareable
        if (states.length > 0) {
          const hash = encodeAutomaton(states, transitions, mode);
          window.history.replaceState(null, '', `#${hash}`);
          setSaved(true); setTimeout(() => setSaved(false), 2000);
        } else {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [states, transitions, mode, showGrammar, showLSystem, showGallery]);

  const handleModeChange = useCallback((newMode: string) => {
    setShowGallery(false);
    if (newMode === 'grammar') {
      setShowGrammar(true); setShowLSystem(false); setShowConvert(false);
    } else if (newMode === 'lsystem') {
      setShowLSystem(true); setShowGrammar(false); setShowConvert(false);
    } else {
      setShowGrammar(false); setShowLSystem(false);
      setMode(newMode as 'dfa' | 'nfa' | 'pda' | 'tm' | 'mealy' | 'moore');
    }
  }, [setMode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      const key = e.key.toLowerCase();

      // Global shortcuts (work even in inputs for some)
      if (key === 'escape') { clearSelection(); setShowShortcuts(false); setShowConvert(false); return; }

      // Ctrl/Cmd shortcuts (work everywhere)
      if (mod) {
        if (key === 'z' && shift) { e.preventDefault(); redo(); showToast('Redo'); return; }
        if (key === 'z') { e.preventDefault(); undo(); showToast('Undo'); return; }
        if (key === 's') { e.preventDefault(); window.dispatchEvent(new CustomEvent('stateforge:share')); showToast('URL Copied'); return; }
        if (key === 'e' && !shift) { e.preventDefault(); window.dispatchEvent(new CustomEvent('stateforge:export')); return; }
        if (key === 'o') { e.preventDefault(); window.dispatchEvent(new CustomEvent('stateforge:import')); return; }
        if (key === '.') { e.preventDefault(); toggleSimPanel(); return; }
        if (key === '/') { e.preventDefault(); toggleSidebar(); return; }
        if (key === 'm' && !shift) { e.preventDefault(); setShowConvert(v => !v); return; }
        if (key === 'g' && !shift) { e.preventDefault(); toggleSnapToGrid(); return; }
        if (key === 'a' && !inInput) { e.preventDefault(); setSelected(new Set(states.map(s => s.id))); return; }
        if (key === '0') { e.preventDefault(); simReset(); showToast('Sim Reset'); return; }
        if (key === '1') { e.preventDefault(); zoomToFit(); return; }
        if (key === 'enter' && shift) { e.preventDefault(); simFastRun(); return; }
        if (key === 'enter') { e.preventDefault(); simStart(); return; }
        if (key === "'") { e.preventDefault(); simStep(); return; }
        if (key === ';') { e.preventDefault(); /* toggle sim mode handled via ref */ return; }

        // Ctrl+Shift combos
        if (shift) {
          if (key === 'l') { e.preventDefault(); autoLayout(); showToast('Auto Layout'); return; }
          if (key === 'x') { e.preventDefault(); clearAll(); showToast('Cleared'); return; }
          if (key === 'q') { e.preventDefault(); addTrapState(); showToast('Trap State Added'); return; }
        }
        return;
      }

      // Non-modifier shortcuts (skip if in input)
      if (inInput) return;
      if (showGrammar || showLSystem || showGallery) return;

      if (key === 'delete' || key === 'backspace') { e.preventDefault(); deleteSelected(); }
      else if (key === '?') { setShowShortcuts(v => !v); }
      else if (key === 'v') { setTool('pointer'); }
      else if (key === 's') { setTool('addState'); }
      else if (key === 't') { setTool('addTransition'); }
      // Mode switching with number keys
      else if (key === '1') { handleModeChange('dfa'); }
      else if (key === '2') { handleModeChange('nfa'); }
      else if (key === '3') { handleModeChange('pda'); }
      else if (key === '4') { handleModeChange('tm'); }
      else if (key === '5') { handleModeChange('mealy'); }
      else if (key === '6') { handleModeChange('moore'); }
      else if (key === '7') { handleModeChange('grammar'); }
      else if (key === '8') { handleModeChange('lsystem'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelected, clearSelection, setTool, setSelected, states,
      showGrammar, showLSystem, showGallery, showToast, handleModeChange,
      autoLayout, clearAll, toggleSidebar, toggleSimPanel, addTrapState,
      simStart, simStep, simFastRun, simReset, zoomToFit, toggleSnapToGrid]);

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'width=device-width, initial-scale=1');
  }, []);

  const toolbarProps = {
    isMobile,
    onConvert: () => setShowConvert(true),
    onModeChange: handleModeChange,
    onGallery: () => setShowGallery(true),
    grammarMode: showGrammar,
    lsystemMode: showLSystem,
    saved,
    onShortcuts: () => setShowShortcuts(true),
    onPumpingLemma: () => setShowPumpingLemma(true),
  };

  const shortcuts = [
    ['— TOOLS —', ''],
    ['V', 'Pointer tool'],
    ['S', 'Add State tool'],
    ['T', 'Add Transition tool'],
    ['Del', 'Delete selected'],
    ['⌘A', 'Select all'],
    ['⌘Z / ⌘⇧Z', 'Undo / Redo'],
    ['', ''],
    ['— MODES —', ''],
    ['1–6', 'DFA · NFA · PDA · TM · Mealy · Moore'],
    ['7 / 8', 'CFG / L-System'],
    ['', ''],
    ['— PANELS —', ''],
    ['⌘.', 'Toggle Simulation'],
    ['⌘/', 'Toggle Properties'],
    ['⌘M', 'Toggle Conversions'],
    ['', ''],
    ['— SIMULATION —', ''],
    ['⌘↵', 'Start simulation'],
    ['⌘\'', 'Step simulation'],
    ['⇧⌘↵', 'Fast run'],
    ['⌘0', 'Reset simulation'],
    ['', ''],
    ['— FILE —', ''],
    ['⌘S', 'Share / Copy URL'],
    ['⌘E', 'Export JSON'],
    ['⌘O', 'Import file'],
    ['', ''],
    ['— CANVAS —', ''],
    ['Space+Drag', 'Pan'],
    ['Scroll', 'Zoom'],
    ['Shift+Click', 'Multi-select'],
    ['Double-click', 'Add state / Edit'],
    ['Right-click', 'Context menu'],
    ['⇧⌘L', 'Auto Layout'],
    ['⇧⌘X', 'Clear All'],
    ['⇧⌘Q', 'Add Trap State'],
    ['Esc', 'Deselect / Close'],
    ['?', 'This help'],
  ];

  const overlays = (
    <>
      <CommandPalette onModeChange={handleModeChange} onPumpingLemma={() => setShowPumpingLemma(true)} />
      {showPumpingLemma && <PumpingLemma onClose={() => setShowPumpingLemma(false)} />}
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
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--color-border)] shadow-panel w-96 max-h-[80vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
              <span className="font-mono text-xs font-semibold tracking-widest uppercase text-[var(--color-text-bright)]">Keyboard Shortcuts</span>
              <button onClick={() => setShowShortcuts(false)} className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]"><X size={14} /></button>
            </div>
            <div className="p-4 space-y-1">
              {shortcuts.map(([key, desc], i) => {
                if (!key && !desc) return <div key={i} className="h-1" />;
                if (key.startsWith('—')) return (
                  <div key={i} className="font-mono text-[10px] tracking-widest text-[var(--color-accent)] uppercase pt-1 font-medium">{key.replaceAll('—', '').trim()}</div>
                );
                return (
                  <div key={i} className="flex items-center justify-between font-mono text-xs py-0.5">
                    <span className="text-[var(--color-text-dim)]">{desc}</span>
                    <kbd className="bg-[var(--bg-surface-sunken)] border border-[var(--color-border)] px-1.5 py-0.5 text-[var(--color-accent)] text-[11px] shrink-0 ml-3">{key}</kbd>
                  </div>
                );
              })}
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
        <GrammarEditor isMobile={isMobile} initialGrammarText={initialGrammarText} />
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
