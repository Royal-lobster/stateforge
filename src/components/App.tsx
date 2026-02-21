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

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const data = decodeAutomaton(hash);
      if (data) {
        loadAutomaton(data.states, data.transitions, data.mode);
        return;
      }
    }
    const saved = loadFromLocalStorage();
    if (saved) {
      loadAutomaton(saved.states, saved.transitions, saved.mode);
    }
  }, [loadAutomaton]);

  useEffect(() => {
    if (!showGrammar) {
      const timer = setTimeout(() => {
        saveToLocalStorage(states, transitions, mode);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [states, transitions, mode, showGrammar]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (showGrammar) return; // don't capture keys in grammar mode
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
  }, [undo, redo, deleteSelected, clearSelection, setTool, showGrammar]);

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
    if (newMode === 'grammar') {
      setShowGrammar(true);
      setShowConvert(false);
    } else {
      setShowGrammar(false);
      setMode(newMode as 'dfa' | 'nfa' | 'pda' | 'tm');
    }
  };

  if (showGrammar) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col overflow-hidden relative">
        <Toolbar
          isMobile={isMobile}
          onConvert={() => setShowConvert(true)}
          grammarMode={true}
          onModeChange={handleModeChange}
        />
        <GrammarEditor isMobile={isMobile} />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden relative">
      <Toolbar
        isMobile={isMobile}
        onConvert={() => setShowConvert(true)}
        grammarMode={false}
        onModeChange={handleModeChange}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Canvas isMobile={isMobile} />
        <Sidebar isMobile={isMobile} />
      </div>
      {showConvert ? (
        <ConvertPanel isMobile={isMobile} onClose={() => setShowConvert(false)} />
      ) : mode === 'pda' ? (
        <PDASimPanel isMobile={isMobile} />
      ) : mode === 'tm' ? (
        <TMSimPanel isMobile={isMobile} />
      ) : (
        <SimPanel isMobile={isMobile} />
      )}
    </div>
  );
}
