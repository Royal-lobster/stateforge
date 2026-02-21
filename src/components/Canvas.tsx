'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/store';
import type { State, Transition } from '@/types';

const STATE_RADIUS = 28;
const GRID_SIZE = 20;

function screenToWorld(sx: number, sy: number, pan: { x: number; y: number }, zoom: number) {
  return { x: (sx - pan.x) / zoom, y: (sy - pan.y) / zoom };
}

function getStateAt(x: number, y: number, states: State[]): State | null {
  for (let i = states.length - 1; i >= 0; i--) {
    const s = states[i];
    const dx = x - s.x, dy = y - s.y;
    if (dx * dx + dy * dy <= STATE_RADIUS * STATE_RADIUS) return s;
  }
  return null;
}

function getTransitionAt(wx: number, wy: number, transitions: Transition[], states: State[]): Transition | null {
  const stateMap = new Map(states.map(s => [s.id, s]));
  for (const t of transitions) {
    const from = stateMap.get(t.from);
    const to = stateMap.get(t.to);
    if (!from || !to) continue;
    if (t.from === t.to) {
      const cx = from.x, cy = from.y - 50;
      const dx = wx - cx, dy = wy - cy;
      if (dx * dx + dy * dy < 900) return t;
      continue;
    }
    const ax = from.x, ay = from.y, bx = to.x, by = to.y;
    const abx = bx - ax, aby = by - ay;
    const apx = wx - ax, apy = wy - ay;
    const t2 = Math.max(0, Math.min(1, (apx * abx + apy * aby) / (abx * abx + aby * aby)));
    const px = ax + t2 * abx, py = ay + t2 * aby;
    const dist = Math.sqrt((wx - px) ** 2 + (wy - py) ** 2);
    if (dist < 12) return t;
  }
  return null;
}

function getEdgeCurveOffset(t: Transition, transitions: Transition[]): number {
  if (t.from === t.to) return 0;
  const reverse = transitions.find(t2 => t2.from === t.to && t2.to === t.from);
  if (!reverse) return 0;
  return 20;
}

export default function Canvas({ isMobile }: { isMobile: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);
  const tool = useStore(s => s.tool);
  const selectedIds = useStore(s => s.selectedIds);
  const pan = useStore(s => s.pan);
  const zoom = useStore(s => s.zoom);
  const transitionDraft = useStore(s => s.transitionDraft);
  const editingTransitionId = useStore(s => s.editingTransitionId);
  const editingStateId = useStore(s => s.editingStateId);
  const contextMenu = useStore(s => s.contextMenu);
  const simCurrentStates = useStore(s => s.simCurrentStates);
  const simStatus = useStore(s => s.simStatus);

  const addState = useStore(s => s.addState);
  const moveStates = useStore(s => s.moveStates);
  const deleteState = useStore(s => s.deleteState);
  const renameState = useStore(s => s.renameState);
  const toggleInitial = useStore(s => s.toggleInitial);
  const toggleAccepting = useStore(s => s.toggleAccepting);
  const addTransition = useStore(s => s.addTransition);
  const updateTransitionSymbols = useStore(s => s.updateTransitionSymbols);
  const setSelected = useStore(s => s.setSelected);
  const toggleSelected = useStore(s => s.toggleSelected);
  const clearSelection = useStore(s => s.clearSelection);
  const setTransitionDraft = useStore(s => s.setTransitionDraft);
  const setEditingTransition = useStore(s => s.setEditingTransition);
  const setEditingState = useStore(s => s.setEditingState);
  const setContextMenu = useStore(s => s.setContextMenu);
  const setPan = useStore(s => s.setPan);
  const setZoom = useStore(s => s.setZoom);
  const pushUndo = useStore(s => s.pushUndo);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{ id: string; startX: number; startY: number; pushed: boolean } | null>(null);
  const [boxSelect, setBoxSelect] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [editInput, setEditInput] = useState('');
  const [stateEditInput, setStateEditInput] = useState('');
  const [showMobileContextMenu, setShowMobileContextMenu] = useState(false);
  const [mobileContextStateId, setMobileContextStateId] = useState<string | null>(null);

  // Touch tracking refs
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);
  const touchDragState = useRef<{ id: string; pushed: boolean } | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement)) { e.preventDefault(); setSpaceHeld(true); }
    };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceHeld(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => {
    if (editingTransitionId) {
      const t = transitions.find(t => t.id === editingTransitionId);
      if (t) setEditInput(t.symbols.join(', '));
    }
  }, [editingTransitionId, transitions]);

  useEffect(() => {
    if (editingStateId) {
      const s = states.find(s => s.id === editingStateId);
      if (s) setStateEditInput(s.label);
    }
  }, [editingStateId, states]);

  // Prevent default touch behavior on canvas to avoid browser gestures
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => { if (e.touches.length > 0) e.preventDefault(); };
    el.addEventListener('touchmove', prevent, { passive: false });
    el.addEventListener('touchstart', prevent, { passive: false });
    return () => { el.removeEventListener('touchmove', prevent); el.removeEventListener('touchstart', prevent); };
  }, []);

  const getWorldPos = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return screenToWorld(e.clientX - rect.left, e.clientY - rect.top, pan, zoom);
  }, [pan, zoom]);

  const getWorldPosFromXY = useCallback((cx: number, cy: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return screenToWorld(cx - rect.left, cy - rect.top, pan, zoom);
  }, [pan, zoom]);

  // ===== TOUCH HANDLERS =====
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setContextMenu(null);
    setShowMobileContextMenu(false);

    if (e.touches.length === 2) {
      // Pinch zoom start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const w = getWorldPosFromXY(touch.clientX, touch.clientY);
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      const hitState = getStateAt(w.x, w.y, states);

      // Long-press for context menu
      if (hitState) {
        longPressTimer.current = setTimeout(() => {
          setMobileContextStateId(hitState.id);
          setShowMobileContextMenu(true);
          longPressTimer.current = null;
          touchDragState.current = null; // cancel drag
        }, 500);
      }

      if (tool === 'addState' && !hitState) {
        addState(w.x, w.y);
        return;
      }

      if (tool === 'addTransition' && hitState) {
        setTransitionDraft({ fromId: hitState.id, x: w.x, y: w.y });
        return;
      }

      if (hitState) {
        if (!selectedIds.has(hitState.id)) setSelected(new Set([hitState.id]));
        touchDragState.current = { id: hitState.id, pushed: false };
        return;
      }

      const hitTrans = getTransitionAt(w.x, w.y, transitions, states);
      if (hitTrans) {
        setSelected(new Set([hitTrans.id]));
        setEditingTransition(hitTrans.id);
        return;
      }

      // Pan with single finger on empty space
      setIsPanning(true);
      setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  }, [states, transitions, tool, pan, zoom, selectedIds, addState, setTransitionDraft, setSelected, setEditingTransition, setContextMenu, getWorldPosFromXY]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) {
      // If moved too far, cancel long press
      if (touchStartPos.current && e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartPos.current.x;
        const dy = e.touches[0].clientY - touchStartPos.current.y;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    }

    // Pinch zoom
    if (e.touches.length === 2 && lastTouchDist.current !== null && lastTouchCenter.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist / lastTouchDist.current;
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect = containerRef.current!.getBoundingClientRect();
      const mx = cx - rect.left;
      const my = cy - rect.top;
      const newZoom = Math.max(0.1, Math.min(5, zoom * factor));
      const newPanX = mx - (mx - pan.x) * (newZoom / zoom);
      const newPanY = my - (my - pan.y) * (newZoom / zoom);
      // Also pan with two-finger drag
      const dcx = cx - lastTouchCenter.current.x;
      const dcy = cy - lastTouchCenter.current.y;
      setZoom(newZoom);
      setPan({ x: newPanX + dcx, y: newPanY + dcy });
      lastTouchDist.current = dist;
      lastTouchCenter.current = { x: cx, y: cy };
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];

      // Dragging a transition draft
      if (transitionDraft) {
        const w = getWorldPosFromXY(touch.clientX, touch.clientY);
        setTransitionDraft({ ...transitionDraft, x: w.x, y: w.y });
        return;
      }

      // Dragging a state
      if (touchDragState.current) {
        const dx = (touch.clientX - (touchStartPos.current?.x || 0)) / zoom;
        const dy = (touch.clientY - (touchStartPos.current?.y || 0)) / zoom;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          if (!touchDragState.current.pushed) { pushUndo(); touchDragState.current.pushed = true; }
          const draggedIds = selectedIds.has(touchDragState.current.id)
            ? [...selectedIds].filter(id => states.some(s => s.id === id))
            : [touchDragState.current.id];
          moveStates(draggedIds, dx, dy);
          touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        }
        return;
      }

      // Panning
      if (isPanning) {
        setPan({ x: touch.clientX - panStart.x, y: touch.clientY - panStart.y });
      }
    }
  }, [zoom, pan, isPanning, panStart, transitionDraft, selectedIds, states, getWorldPosFromXY, setTransitionDraft, moveStates, pushUndo, setPan, setZoom]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    lastTouchDist.current = null;
    lastTouchCenter.current = null;

    if (transitionDraft && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const w = getWorldPosFromXY(touch.clientX, touch.clientY);
      const hitState = getStateAt(w.x, w.y, states);
      if (hitState) addTransition(transitionDraft.fromId, hitState.id);
      setTransitionDraft(null);
    }

    touchDragState.current = null;
    if (isPanning) setIsPanning(false);
  }, [transitionDraft, isPanning, states, addTransition, setTransitionDraft, getWorldPosFromXY]);

  // ===== MOUSE HANDLERS (desktop) =====
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) return;
    setContextMenu(null);
    const rect = containerRef.current!.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const w = screenToWorld(sx, sy, pan, zoom);

    if (e.button === 1 || spaceHeld) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const hitState = getStateAt(w.x, w.y, states);
    if (tool === 'addState' && !hitState) { addState(w.x, w.y); return; }
    if (tool === 'addTransition') {
      if (hitState) setTransitionDraft({ fromId: hitState.id, x: w.x, y: w.y });
      return;
    }
    if (hitState) {
      if (e.shiftKey) toggleSelected(hitState.id);
      else if (!selectedIds.has(hitState.id)) setSelected(new Set([hitState.id]));
      setDragState({ id: hitState.id, startX: e.clientX, startY: e.clientY, pushed: false });
      return;
    }
    const hitTrans = getTransitionAt(w.x, w.y, transitions, states);
    if (hitTrans) { setSelected(new Set([hitTrans.id])); setEditingTransition(hitTrans.id); return; }
    if (!e.shiftKey) clearSelection();
    setBoxSelect({ startX: sx, startY: sy, endX: sx, endY: sy });
  }, [tool, states, transitions, pan, zoom, spaceHeld, selectedIds, addState, setTransitionDraft, toggleSelected, setSelected, clearSelection, setContextMenu, setEditingTransition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) { setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }); return; }
    if (transitionDraft) { const w = getWorldPos(e); setTransitionDraft({ ...transitionDraft, x: w.x, y: w.y }); return; }
    if (dragState) {
      const dx = (e.clientX - dragState.startX) / zoom;
      const dy = (e.clientY - dragState.startY) / zoom;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        if (!dragState.pushed) { pushUndo(); setDragState({ ...dragState, pushed: true }); }
        const draggedIds = selectedIds.has(dragState.id) ? [...selectedIds].filter(id => states.some(s => s.id === id)) : [dragState.id];
        moveStates(draggedIds, dx, dy);
        setDragState({ ...dragState, startX: e.clientX, startY: e.clientY, pushed: true });
      }
      return;
    }
    if (boxSelect) {
      const rect = containerRef.current!.getBoundingClientRect();
      setBoxSelect({ ...boxSelect, endX: e.clientX - rect.left, endY: e.clientY - rect.top });
    }
  }, [isPanning, panStart, transitionDraft, dragState, boxSelect, pan, zoom, getWorldPos, setTransitionDraft, moveStates, pushUndo, selectedIds, states, setPan]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isPanning) { setIsPanning(false); return; }
    if (transitionDraft) {
      const w = getWorldPos(e);
      const hitState = getStateAt(w.x, w.y, states);
      if (hitState) addTransition(transitionDraft.fromId, hitState.id);
      setTransitionDraft(null);
      return;
    }
    if (dragState) { setDragState(null); return; }
    if (boxSelect) {
      const minX = Math.min(boxSelect.startX, boxSelect.endX);
      const maxX = Math.max(boxSelect.startX, boxSelect.endX);
      const minY = Math.min(boxSelect.startY, boxSelect.endY);
      const maxY = Math.max(boxSelect.startY, boxSelect.endY);
      const selected = new Set<string>();
      for (const s of states) {
        const sx2 = s.x * zoom + pan.x;
        const sy2 = s.y * zoom + pan.y;
        if (sx2 >= minX && sx2 <= maxX && sy2 >= minY && sy2 <= maxY) selected.add(s.id);
      }
      setSelected(selected);
      setBoxSelect(null);
    }
  }, [isPanning, transitionDraft, dragState, boxSelect, states, zoom, pan, getWorldPos, addTransition, setTransitionDraft, setSelected]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * factor));
    const newPanX = mx - (mx - pan.x) * (newZoom / zoom);
    const newPanY = my - (my - pan.y) * (newZoom / zoom);
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan, setZoom, setPan]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isMobile) return;
    const w = getWorldPos(e);
    const hitState = getStateAt(w.x, w.y, states);
    if (hitState) setContextMenu({ x: e.clientX, y: e.clientY, stateId: hitState.id });
    else setContextMenu(null);
  }, [states, getWorldPos, setContextMenu, isMobile]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const w = getWorldPos(e);
    const hitState = getStateAt(w.x, w.y, states);
    if (hitState) { setEditingState(hitState.id); return; }
    const hitTrans = getTransitionAt(w.x, w.y, transitions, states);
    if (hitTrans) { setEditingTransition(hitTrans.id); return; }
    if (tool === 'pointer') addState(w.x, w.y);
  }, [states, transitions, getWorldPos, setEditingState, setEditingTransition, addState, tool]);

  const commitTransitionEdit = useCallback(() => {
    if (!editingTransitionId) return;
    const symbols = editInput.split(',').map(s => s.trim()).filter(Boolean);
    if (symbols.length > 0) updateTransitionSymbols(editingTransitionId, symbols);
    setEditingTransition(null);
  }, [editingTransitionId, editInput, updateTransitionSymbols, setEditingTransition]);

  const commitStateEdit = useCallback(() => {
    if (!editingStateId) return;
    if (stateEditInput.trim()) renameState(editingStateId, stateEditInput.trim());
    setEditingState(null);
  }, [editingStateId, stateEditInput, renameState, setEditingState]);

  let cursor = 'default';
  if (spaceHeld || isPanning) cursor = isPanning ? 'grabbing' : 'grab';
  else if (tool === 'addState') cursor = 'crosshair';
  else if (tool === 'addTransition') cursor = 'crosshair';

  const stateMap = new Map(states.map(s => [s.id, s]));

  const contextMenuItems = (stateId: string) => [
    { label: 'Set Initial', action: () => toggleInitial(stateId) },
    { label: 'Set Accepting', action: () => toggleAccepting(stateId) },
    { label: 'Rename', action: () => setEditingState(stateId) },
    { label: 'Delete', action: () => deleteState(stateId) },
  ];

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[var(--bg-canvas)] touch-none"
      style={{ cursor }}
      onWheel={handleWheel}
    >
      <svg
        ref={svgRef}
        className="w-full h-full absolute inset-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-accent)" />
          </marker>
          <marker id="arrowhead-dim" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-border)" />
          </marker>
          <marker id="arrowhead-draft" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-accent)" opacity="0.5" />
          </marker>
          <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
            <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="var(--color-grid)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          <rect x={-10000} y={-10000} width={20000} height={20000} fill="url(#grid)" />

          {/* Transitions */}
          {transitions.map(t => {
            const from = stateMap.get(t.from);
            const to = stateMap.get(t.to);
            if (!from || !to) return null;
            const isSelected = selectedIds.has(t.id);
            const curveOff = getEdgeCurveOffset(t, transitions);

            if (t.from === t.to) {
              const cx = from.x, cy = from.y, loopR = 22;
              return (
                <g key={t.id}>
                  <path d={`M ${cx - 12} ${cy - STATE_RADIUS + 2} C ${cx - 30} ${cy - STATE_RADIUS - loopR * 2}, ${cx + 30} ${cy - STATE_RADIUS - loopR * 2}, ${cx + 12} ${cy - STATE_RADIUS + 2}`} fill="none" stroke={isSelected ? 'var(--color-accent)' : 'var(--color-border)'} strokeWidth={isSelected ? 2 : 1.5} markerEnd={isSelected ? 'url(#arrowhead)' : 'url(#arrowhead-dim)'} />
                  <text x={cx} y={cy - STATE_RADIUS - loopR * 1.5} textAnchor="middle" dominantBaseline="middle" className="canvas-label" fill="var(--color-text)" fontSize="12">{t.symbols.join(', ')}</text>
                </g>
              );
            }

            const dx = to.x - from.x, dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len === 0) return null;
            const nx = dx / len, ny = dy / len;
            const px = -ny, py = nx;
            const startX = from.x + nx * STATE_RADIUS + px * curveOff;
            const startY = from.y + ny * STATE_RADIUS + py * curveOff;
            const endX = to.x - nx * (STATE_RADIUS + 10) + px * curveOff;
            const endY = to.y - ny * (STATE_RADIUS + 10) + py * curveOff;
            const midX = (from.x + to.x) / 2 + px * curveOff * 2;
            const midY = (from.y + to.y) / 2 + py * curveOff * 2;
            const labelX = (from.x + to.x) / 2 + px * (curveOff * 2 + 14);
            const labelY = (from.y + to.y) / 2 + py * (curveOff * 2 + 14);

            return (
              <g key={t.id}>
                {curveOff > 0 ? (
                  <path d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`} fill="none" stroke={isSelected ? 'var(--color-accent)' : 'var(--color-border)'} strokeWidth={isSelected ? 2 : 1.5} markerEnd={isSelected ? 'url(#arrowhead)' : 'url(#arrowhead-dim)'} />
                ) : (
                  <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={isSelected ? 'var(--color-accent)' : 'var(--color-border)'} strokeWidth={isSelected ? 2 : 1.5} markerEnd={isSelected ? 'url(#arrowhead)' : 'url(#arrowhead-dim)'} />
                )}
                <text x={labelX} y={labelY - 4} textAnchor="middle" dominantBaseline="middle" className="canvas-label" fill="var(--color-text)" fontSize="12">{t.symbols.join(', ')}</text>
              </g>
            );
          })}

          {/* Draft line */}
          {transitionDraft && (() => {
            const from = stateMap.get(transitionDraft.fromId);
            if (!from) return null;
            return <line x1={from.x} y1={from.y} x2={transitionDraft.x} y2={transitionDraft.y} stroke="var(--color-accent)" strokeWidth={1.5} strokeDasharray="6,3" opacity={0.5} markerEnd="url(#arrowhead-draft)" />;
          })()}

          {/* States */}
          {states.map(s => {
            const isSelected = selectedIds.has(s.id);
            const isSimActive = simCurrentStates.has(s.id);
            const isAcceptedFinal = simStatus === 'accepted' && isSimActive;

            let strokeColor = 'var(--color-border)';
            let fillColor = 'var(--bg-surface)';
            if (isSimActive && simStatus === 'stepping') { strokeColor = 'var(--color-sim-active)'; fillColor = 'rgba(234, 179, 8, 0.15)'; }
            else if (isAcceptedFinal) { strokeColor = 'var(--color-accept)'; fillColor = 'rgba(34, 197, 94, 0.15)'; }
            else if (isSelected) { strokeColor = 'var(--color-accent)'; }

            return (
              <g key={s.id}>
                {s.isInitial && <line x1={s.x - STATE_RADIUS - 30} y1={s.y} x2={s.x - STATE_RADIUS - 2} y2={s.y} stroke="var(--color-accent)" strokeWidth={2} markerEnd="url(#arrowhead)" />}
                {s.isAccepting && <rect x={s.x - STATE_RADIUS - 4} y={s.y - STATE_RADIUS - 4} width={(STATE_RADIUS + 4) * 2} height={(STATE_RADIUS + 4) * 2} fill="none" stroke={strokeColor} strokeWidth={1} />}
                <rect x={s.x - STATE_RADIUS} y={s.y - STATE_RADIUS} width={STATE_RADIUS * 2} height={STATE_RADIUS * 2} fill={fillColor} stroke={strokeColor} strokeWidth={isSelected || isSimActive ? 2 : 1.5} />
                <text x={s.x} y={s.y} textAnchor="middle" dominantBaseline="central" className="canvas-label" fill="var(--color-text)" fontSize="13" fontWeight={500}>{s.label}</text>
              </g>
            );
          })}
        </g>

        {/* Box select */}
        {boxSelect && (
          <rect x={Math.min(boxSelect.startX, boxSelect.endX)} y={Math.min(boxSelect.startY, boxSelect.endY)} width={Math.abs(boxSelect.endX - boxSelect.startX)} height={Math.abs(boxSelect.endY - boxSelect.startY)} fill="var(--color-accent)" fillOpacity={0.08} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="4,2" />
        )}
      </svg>

      {/* Transition label editor */}
      {editingTransitionId && (() => {
        const t = transitions.find(t => t.id === editingTransitionId);
        if (!t) return null;
        const from = stateMap.get(t.from);
        const to = stateMap.get(t.to);
        if (!from || !to) return null;
        let lx: number, ly: number;
        if (t.from === t.to) { lx = from.x * zoom + pan.x; ly = (from.y - STATE_RADIUS - 35) * zoom + pan.y; }
        else { lx = ((from.x + to.x) / 2) * zoom + pan.x; ly = ((from.y + to.y) / 2) * zoom + pan.y - 20; }
        return (
          <div className="absolute" style={{ left: lx - 60, top: ly - 12 }}>
            <input autoFocus className="bg-[var(--bg-surface)] border border-[var(--color-accent)] text-[var(--color-text)] px-2 py-1 text-xs font-mono w-[120px] outline-none" value={editInput} onChange={e => setEditInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commitTransitionEdit(); if (e.key === 'Escape') setEditingTransition(null); }} onBlur={commitTransitionEdit} />
          </div>
        );
      })()}

      {/* State label editor */}
      {editingStateId && (() => {
        const s = states.find(s => s.id === editingStateId);
        if (!s) return null;
        const lx = s.x * zoom + pan.x;
        const ly = s.y * zoom + pan.y;
        return (
          <div className="absolute" style={{ left: lx - 40, top: ly - 12 }}>
            <input autoFocus className="bg-[var(--bg-surface)] border border-[var(--color-accent)] text-[var(--color-text)] px-2 py-1 text-xs font-mono w-[80px] outline-none text-center" value={stateEditInput} onChange={e => setStateEditInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commitStateEdit(); if (e.key === 'Escape') setEditingState(null); }} onBlur={commitStateEdit} />
          </div>
        );
      })()}

      {/* Desktop context menu */}
      {!isMobile && contextMenu && (
        <div className="absolute bg-[var(--bg-surface)] border border-[var(--color-border)] shadow-lg z-50" style={{ left: contextMenu.x, top: contextMenu.y }}>
          {contextMenuItems(contextMenu.stateId).map(item => (
            <button key={item.label} className="block w-full text-left px-4 py-1.5 text-xs font-mono hover:bg-[var(--color-accent)] hover:text-[var(--bg-primary)] transition-colors" onClick={() => { item.action(); setContextMenu(null); }}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Mobile context menu (bottom sheet) */}
      {isMobile && showMobileContextMenu && mobileContextStateId && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowMobileContextMenu(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--color-border)] z-50 animate-slide-up">
            <div className="w-8 h-1 bg-[var(--color-border)] mx-auto mt-2 mb-1" />
            <div className="px-4 py-2 font-mono text-xs text-[var(--color-accent)] border-b border-[var(--color-border)]">
              {stateMap.get(mobileContextStateId)?.label}
            </div>
            {contextMenuItems(mobileContextStateId).map(item => (
              <button key={item.label} className="block w-full text-left px-4 min-h-[48px] flex items-center text-sm font-mono text-[var(--color-text)] active:bg-[var(--color-accent)] active:text-[var(--bg-primary)]" onClick={() => { item.action(); setShowMobileContextMenu(false); }}>
                {item.label}
              </button>
            ))}
            <div className="h-[env(safe-area-inset-bottom,8px)]" />
          </div>
        </>
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-[var(--color-text-dim)] bg-[var(--bg-surface)] border border-[var(--color-border)] px-2 py-0.5">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
