'use client';

import { useEffect, useState } from 'react';
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
  const [showGallery, setShowGallery] = useState(() => {
    // Show gallery on first visit (no saved data, no URL hash)
    if (typeof window !== 'undefined') {
      return !window.location.hash && !localStorage.getItem('stateforge_autosave');
    }
    return false;
  });

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
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [states, transitions, mode, showGrammar, showLSystem, showGallery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (showGrammar || showLSystem || showGallery) return;
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) { e.preventDefault(); redo(); }
      else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
      else if (e.key === 'Escape') { clearSelection(); }
      else if (e.key === 'v' || e.key === 'V') { setTool('pointer'); }
      else if (e.key === 's' && !e.ctrlKey && !e.metaKey) { setTool('addState'); }
      else if (e.key === 't' && !e.ctrlKey && !e.metaKey) { setTool('addTransition'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelected, clearSelection, setTool, showGrammar, showLSystem, showGallery]);

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
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
  };

  // Gallery view
  if (showGallery) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col overflow-hidden relative">
        <Toolbar {...toolbarProps} />
        <Gallery onSelect={() => setShowGallery(false)} />
      </div>
    );
  }

  // Grammar view
  if (showGrammar) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col overflow-hidden relative">
        <Toolbar {...toolbarProps} />
        <GrammarEditor isMobile={isMobile} />
      </div>
    );
  }

  // L-System view
  if (showLSystem) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col overflow-hidden relative">
        <Toolbar {...toolbarProps} />
        <LSystem isMobile={isMobile} />
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
    </div>
  );
}
