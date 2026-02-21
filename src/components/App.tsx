'use client';

import { useEffect } from 'react';
import { useStore } from '@/store';
import { decodeAutomaton, loadFromLocalStorage, saveToLocalStorage } from '@/url';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import Sidebar from './Sidebar';
import SimPanel from './SimPanel';

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

  // Load from URL hash or localStorage on mount
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

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage(states, transitions, mode);
    }, 500);
    return () => clearTimeout(timer);
  }, [states, transitions, mode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === 'Escape') {
        clearSelection();
      } else if (e.key === 'v' || e.key === 'V') {
        setTool('pointer');
      } else if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        setTool('addState');
      } else if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        setTool('addTransition');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelected, clearSelection, setTool]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Canvas />
        <Sidebar />
      </div>
      <SimPanel />
    </div>
  );
}
