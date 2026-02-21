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
  // Reverse order so topmost state is picked first
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
      // Self-loop: check near the top of the state
      const cx = from.x, cy = from.y - 50;
      const dx = wx - cx, dy = wy - cy;
      if (dx * dx + dy * dy < 900) return t;
      continue;
    }
    // Check distance to line segment
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

// Compute offset for parallel edges (A->B and B->A)
function getEdgeCurveOffset(t: Transition, transitions: Transition[]): number {
  if (t.from === t.to) return 0;
  const reverse = transitions.find(t2 => t2.from === t.to && t2.to === t.from);
  if (!reverse) return 0;
  return 20;
}

export default function Canvas() {
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
  const mode = useStore(s => s.mode);

  const addState = useStore(s => s.addState);
  const moveState = useStore(s => s.moveState);
  const moveStates = useStore(s => s.moveStates);
  const deleteState = useStore(s => s.deleteState);
  const renameState = useStore(s => s.renameState);
  const toggleInitial = useStore(s => s.toggleInitial);
  const toggleAccepting = useStore(s => s.toggleAccepting);
  const addTransition = useStore(s => s.addTransition);
  const deleteTransition = useStore(s => s.deleteTransition);
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
  const deleteSelected = useStore(s => s.deleteSelected);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{ id: string; startX: number; startY: number; pushed: boolean } | null>(null);
  const [boxSelect, setBoxSelect] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [editInput, setEditInput] = useState('');
  const [stateEditInput, setStateEditInput] = useState('');

  // Space key tracking
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // When editing transition starts, populate input
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

  const getWorldPos = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    return screenToWorld(sx, sy, pan, zoom);
  }, [pan, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) return; // right-click handled separately
    setContextMenu(null);

    const rect = containerRef.current!.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const w = screenToWorld(sx, sy, pan, zoom);

    // Middle-click or space+click => pan
    if (e.button === 1 || spaceHeld) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const hitState = getStateAt(w.x, w.y, states);

    if (tool === 'addState' && !hitState) {
      addState(w.x, w.y);
      return;
    }

    if (tool === 'addTransition') {
      if (hitState) {
        setTransitionDraft({ fromId: hitState.id, x: w.x, y: w.y });
      }
      return;
    }

    // Pointer tool
    if (hitState) {
      if (e.shiftKey) {
        toggleSelected(hitState.id);
      } else if (!selectedIds.has(hitState.id)) {
        setSelected(new Set([hitState.id]));
      }
      setDragState({ id: hitState.id, startX: e.clientX, startY: e.clientY, pushed: false });
      return;
    }

    // Check transition hit
    const hitTrans = getTransitionAt(w.x, w.y, transitions, states);
    if (hitTrans) {
      setSelected(new Set([hitTrans.id]));
      setEditingTransition(hitTrans.id);
      return;
    }

    // Start box select
    if (!e.shiftKey) clearSelection();
    setBoxSelect({ startX: sx, startY: sy, endX: sx, endY: sy });
  }, [tool, states, transitions, pan, zoom, spaceHeld, selectedIds, addState, setTransitionDraft, toggleSelected, setSelected, clearSelection, setContextMenu, setEditingTransition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    if (transitionDraft) {
      const w = getWorldPos(e);
      setTransitionDraft({ ...transitionDraft, x: w.x, y: w.y });
      return;
    }

    if (dragState) {
      const dx = (e.clientX - dragState.startX) / zoom;
      const dy = (e.clientY - dragState.startY) / zoom;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        if (!dragState.pushed) {
          pushUndo();
          setDragState({ ...dragState, pushed: true });
        }
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
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (transitionDraft) {
      const w = getWorldPos(e);
      const hitState = getStateAt(w.x, w.y, states);
      if (hitState && hitState.id !== transitionDraft.fromId) {
        addTransition(transitionDraft.fromId, hitState.id);
      } else if (hitState && hitState.id === transitionDraft.fromId) {
        addTransition(transitionDraft.fromId, hitState.id);
      }
      setTransitionDraft(null);
      return;
    }

    if (dragState) {
      setDragState(null);
      return;
    }

    if (boxSelect) {
      // Select states in box
      const minX = Math.min(boxSelect.startX, boxSelect.endX);
      const maxX = Math.max(boxSelect.startX, boxSelect.endX);
      const minY = Math.min(boxSelect.startY, boxSelect.endY);
      const maxY = Math.max(boxSelect.startY, boxSelect.endY);
      const selected = new Set<string>();
      for (const s of states) {
        const sx = s.x * zoom + pan.x;
        const sy = s.y * zoom + pan.y;
        if (sx >= minX && sx <= maxX && sy >= minY && sy <= maxY) {
          selected.add(s.id);
        }
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
    // Zoom towards cursor
    const newPanX = mx - (mx - pan.x) * (newZoom / zoom);
    const newPanY = my - (my - pan.y) * (newZoom / zoom);
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan, setZoom, setPan]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const w = getWorldPos(e);
    const hitState = getStateAt(w.x, w.y, states);
    if (hitState) {
      setContextMenu({ x: e.clientX, y: e.clientY, stateId: hitState.id });
    } else {
      setContextMenu(null);
    }
  }, [states, getWorldPos, setContextMenu]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const w = getWorldPos(e);
    const hitState = getStateAt(w.x, w.y, states);
    if (hitState) {
      setEditingState(hitState.id);
      return;
    }
    const hitTrans = getTransitionAt(w.x, w.y, transitions, states);
    if (hitTrans) {
      setEditingTransition(hitTrans.id);
      return;
    }
    // Double-click on empty space adds a state (if pointer tool)
    if (tool === 'pointer') {
      addState(w.x, w.y);
    }
  }, [states, transitions, getWorldPos, setEditingState, setEditingTransition, addState, tool]);

  const commitTransitionEdit = useCallback(() => {
    if (!editingTransitionId) return;
    const symbols = editInput.split(',').map(s => s.trim()).filter(Boolean);
    if (symbols.length > 0) {
      updateTransitionSymbols(editingTransitionId, symbols);
    }
    setEditingTransition(null);
  }, [editingTransitionId, editInput, updateTransitionSymbols, setEditingTransition]);

  const commitStateEdit = useCallback(() => {
    if (!editingStateId) return;
    if (stateEditInput.trim()) {
      renameState(editingStateId, stateEditInput.trim());
    }
    setEditingState(null);
  }, [editingStateId, stateEditInput, renameState, setEditingState]);

  // Determine cursor
  let cursor = 'default';
  if (spaceHeld || isPanning) cursor = isPanning ? 'grabbing' : 'grab';
  else if (tool === 'addState') cursor = 'crosshair';
  else if (tool === 'addTransition') cursor = 'crosshair';

  const stateMap = new Map(states.map(s => [s.id, s]));

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[var(--bg-canvas)]"
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
          {/* Grid pattern */}
          <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
            <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="var(--color-grid)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Grid */}
          <rect x={-10000} y={-10000} width={20000} height={20000} fill="url(#grid)" />

          {/* Transitions */}
          {transitions.map(t => {
            const from = stateMap.get(t.from);
            const to = stateMap.get(t.to);
            if (!from || !to) return null;
            const isSelected = selectedIds.has(t.id);
            const curveOff = getEdgeCurveOffset(t, transitions);

            if (t.from === t.to) {
              // Self-loop
              const cx = from.x;
              const cy = from.y;
              const loopR = 22;
              return (
                <g key={t.id}>
                  <path
                    d={`M ${cx - 12} ${cy - STATE_RADIUS + 2} C ${cx - 30} ${cy - STATE_RADIUS - loopR * 2}, ${cx + 30} ${cy - STATE_RADIUS - loopR * 2}, ${cx + 12} ${cy - STATE_RADIUS + 2}`}
                    fill="none"
                    stroke={isSelected ? 'var(--color-accent)' : 'var(--color-border)'}
                    strokeWidth={isSelected ? 2 : 1.5}
                    markerEnd={isSelected ? 'url(#arrowhead)' : 'url(#arrowhead-dim)'}
                  />
                  <text
                    x={cx}
                    y={cy - STATE_RADIUS - loopR * 1.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="canvas-label"
                    fill="var(--color-text)"
                    fontSize="12"
                  >
                    {t.symbols.join(', ')}
                  </text>
                </g>
              );
            }

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len === 0) return null;
            const nx = dx / len, ny = dy / len;
            // Perpendicular
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
                  <path
                    d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                    fill="none"
                    stroke={isSelected ? 'var(--color-accent)' : 'var(--color-border)'}
                    strokeWidth={isSelected ? 2 : 1.5}
                    markerEnd={isSelected ? 'url(#arrowhead)' : 'url(#arrowhead-dim)'}
                  />
                ) : (
                  <line
                    x1={startX} y1={startY} x2={endX} y2={endY}
                    stroke={isSelected ? 'var(--color-accent)' : 'var(--color-border)'}
                    strokeWidth={isSelected ? 2 : 1.5}
                    markerEnd={isSelected ? 'url(#arrowhead)' : 'url(#arrowhead-dim)'}
                  />
                )}
                <text
                  x={labelX}
                  y={labelY - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="canvas-label"
                  fill="var(--color-text)"
                  fontSize="12"
                >
                  {t.symbols.join(', ')}
                </text>
              </g>
            );
          })}

          {/* Transition draft line */}
          {transitionDraft && (() => {
            const from = stateMap.get(transitionDraft.fromId);
            if (!from) return null;
            return (
              <line
                x1={from.x} y1={from.y}
                x2={transitionDraft.x} y2={transitionDraft.y}
                stroke="var(--color-accent)"
                strokeWidth={1.5}
                strokeDasharray="6,3"
                opacity={0.5}
                markerEnd="url(#arrowhead-draft)"
              />
            );
          })()}

          {/* States */}
          {states.map(s => {
            const isSelected = selectedIds.has(s.id);
            const isSimActive = simCurrentStates.has(s.id);
            const isAcceptedFinal = simStatus === 'accepted' && isSimActive;
            const isRejectedFinal = simStatus === 'rejected';

            let strokeColor = 'var(--color-border)';
            let fillColor = 'var(--bg-surface)';
            if (isSimActive && simStatus === 'stepping') {
              strokeColor = 'var(--color-sim-active)';
              fillColor = 'rgba(234, 179, 8, 0.15)';
            } else if (isAcceptedFinal) {
              strokeColor = 'var(--color-accept)';
              fillColor = 'rgba(34, 197, 94, 0.15)';
            } else if (isSelected) {
              strokeColor = 'var(--color-accent)';
            }

            return (
              <g key={s.id}>
                {/* Initial state arrow */}
                {s.isInitial && (
                  <line
                    x1={s.x - STATE_RADIUS - 30} y1={s.y}
                    x2={s.x - STATE_RADIUS - 2} y2={s.y}
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    markerEnd="url(#arrowhead)"
                  />
                )}
                {/* Accepting state double circle */}
                {s.isAccepting && (
                  <rect
                    x={s.x - STATE_RADIUS - 4} y={s.y - STATE_RADIUS - 4}
                    width={(STATE_RADIUS + 4) * 2} height={(STATE_RADIUS + 4) * 2}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={1}
                  />
                )}
                {/* State box */}
                <rect
                  x={s.x - STATE_RADIUS} y={s.y - STATE_RADIUS}
                  width={STATE_RADIUS * 2} height={STATE_RADIUS * 2}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected || isSimActive ? 2 : 1.5}
                  className="transition-colors"
                />
                {/* Label */}
                <text
                  x={s.x} y={s.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="canvas-label"
                  fill="var(--color-text)"
                  fontSize="13"
                  fontWeight={500}
                >
                  {s.label}
                </text>
              </g>
            );
          })}
        </g>

        {/* Box select rectangle */}
        {boxSelect && (
          <rect
            x={Math.min(boxSelect.startX, boxSelect.endX)}
            y={Math.min(boxSelect.startY, boxSelect.endY)}
            width={Math.abs(boxSelect.endX - boxSelect.startX)}
            height={Math.abs(boxSelect.endY - boxSelect.startY)}
            fill="var(--color-accent)"
            fillOpacity={0.08}
            stroke="var(--color-accent)"
            strokeWidth={1}
            strokeDasharray="4,2"
          />
        )}
      </svg>

      {/* Transition label editor overlay */}
      {editingTransitionId && (() => {
        const t = transitions.find(t => t.id === editingTransitionId);
        if (!t) return null;
        const from = stateMap.get(t.from);
        const to = stateMap.get(t.to);
        if (!from || !to) return null;
        let lx: number, ly: number;
        if (t.from === t.to) {
          lx = from.x * zoom + pan.x;
          ly = (from.y - STATE_RADIUS - 35) * zoom + pan.y;
        } else {
          lx = ((from.x + to.x) / 2) * zoom + pan.x;
          ly = ((from.y + to.y) / 2) * zoom + pan.y - 20;
        }
        return (
          <div className="absolute" style={{ left: lx - 60, top: ly - 12 }}>
            <input
              autoFocus
              className="bg-[var(--bg-surface)] border border-[var(--color-accent)] text-[var(--color-text)] px-2 py-1 text-xs font-mono w-[120px] outline-none"
              value={editInput}
              onChange={e => setEditInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitTransitionEdit();
                if (e.key === 'Escape') setEditingTransition(null);
              }}
              onBlur={commitTransitionEdit}
            />
          </div>
        );
      })()}

      {/* State label editor overlay */}
      {editingStateId && (() => {
        const s = states.find(s => s.id === editingStateId);
        if (!s) return null;
        const lx = s.x * zoom + pan.x;
        const ly = s.y * zoom + pan.y;
        return (
          <div className="absolute" style={{ left: lx - 40, top: ly - 12 }}>
            <input
              autoFocus
              className="bg-[var(--bg-surface)] border border-[var(--color-accent)] text-[var(--color-text)] px-2 py-1 text-xs font-mono w-[80px] outline-none text-center"
              value={stateEditInput}
              onChange={e => setStateEditInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitStateEdit();
                if (e.key === 'Escape') setEditingState(null);
              }}
              onBlur={commitStateEdit}
            />
          </div>
        );
      })()}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="absolute bg-[var(--bg-surface)] border border-[var(--color-border)] shadow-lg z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {[
            { label: 'Set Initial', action: () => toggleInitial(contextMenu.stateId) },
            { label: 'Set Accepting', action: () => toggleAccepting(contextMenu.stateId) },
            { label: 'Rename', action: () => setEditingState(contextMenu.stateId) },
            { label: 'Delete', action: () => deleteState(contextMenu.stateId) },
          ].map(item => (
            <button
              key={item.label}
              className="block w-full text-left px-4 py-1.5 text-xs font-mono hover:bg-[var(--color-accent)] hover:text-[var(--bg-primary)] transition-colors"
              onClick={() => {
                item.action();
                setContextMenu(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-[var(--color-text-dim)] bg-[var(--bg-surface)] border border-[var(--color-border)] px-2 py-0.5">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
