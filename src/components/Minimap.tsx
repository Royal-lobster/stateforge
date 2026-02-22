'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useStore } from '@/store';

const MINIMAP_W = 160;
const MINIMAP_H = 100;
const PADDING = 40;
const STATE_SIZE = 4;

export default function Minimap() {
  const states = useStore(s => s.states);
  const transitions = useStore(s => s.transitions);
  const pan = useStore(s => s.pan);
  const zoom = useStore(s => s.zoom);
  const setPan = useStore(s => s.setPan);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // Hide when too few states
  if (states.length < 2) return null;

  // Compute bounds of all states
  const xs = states.map(s => s.x);
  const ys = states.map(s => s.y);
  const minX = Math.min(...xs) - PADDING;
  const maxX = Math.max(...xs) + PADDING;
  const minY = Math.min(...ys) - PADDING;
  const maxY = Math.max(...ys) + PADDING;
  const worldW = maxX - minX || 1;
  const worldH = maxY - minY || 1;

  // Scale to fit minimap
  const scale = Math.min(MINIMAP_W / worldW, MINIMAP_H / worldH);

  // Transform world coords to minimap coords
  const toMiniX = (x: number) => (x - minX) * scale;
  const toMiniY = (y: number) => (y - minY) * scale;

  // Viewport rectangle: what's visible on screen
  const canvasEl = typeof document !== 'undefined' ? document.querySelector('[data-canvas]') as HTMLElement | null : null;
  const cw = canvasEl ? canvasEl.clientWidth : 800;
  const ch = canvasEl ? canvasEl.clientHeight : 600;

  // Screen corners in world coords
  const vpLeft = -pan.x / zoom;
  const vpTop = -pan.y / zoom;
  const vpW = cw / zoom;
  const vpH = ch / zoom;

  const vpRectX = toMiniX(vpLeft);
  const vpRectY = toMiniY(vpTop);
  const vpRectW = vpW * scale;
  const vpRectH = vpH * scale;

  const navigateTo = useCallback((miniX: number, miniY: number) => {
    // Convert minimap coords back to world coords
    const worldX = miniX / scale + minX;
    const worldY = miniY / scale + minY;
    // Center the viewport on this world position
    const el = document.querySelector('[data-canvas]') as HTMLElement | null;
    const w = el ? el.clientWidth : 800;
    const h = el ? el.clientHeight : 600;
    setPan({ x: w / 2 - worldX * zoom, y: h / 2 - worldY * zoom });
  }, [scale, minX, minY, zoom, setPan]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = containerRef.current!.getBoundingClientRect();
    navigateTo(e.clientX - rect.left, e.clientY - rect.top);
  }, [navigateTo]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    e.stopPropagation();
    const rect = containerRef.current!.getBoundingClientRect();
    navigateTo(e.clientX - rect.left, e.clientY - rect.top);
  }, [dragging, navigateTo]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false);
  }, []);

  const stateMap = new Map(states.map(s => [s.id, s]));

  return (
    <div
      ref={containerRef}
      className="absolute z-10"
      style={{
        bottom: 28,
        right: 12,
        width: MINIMAP_W,
        height: MINIMAP_H,
        background: 'var(--bg-surface)',
        opacity: 0.85,
        border: '1px solid var(--color-border)',
        cursor: 'crosshair',
        overflow: 'hidden',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg width={MINIMAP_W} height={MINIMAP_H}>
        {/* Transitions */}
        {transitions.map(t => {
          const from = stateMap.get(t.from);
          const to = stateMap.get(t.to);
          if (!from || !to) return null;
          if (t.from === t.to) return null; // skip self-loops in minimap
          return (
            <line
              key={t.id}
              x1={toMiniX(from.x)}
              y1={toMiniY(from.y)}
              x2={toMiniX(to.x)}
              y2={toMiniY(to.y)}
              stroke="var(--color-grid)"
              strokeWidth={0.5}
            />
          );
        })}
        {/* States */}
        {states.map(s => (
          <rect
            key={s.id}
            x={toMiniX(s.x) - STATE_SIZE / 2}
            y={toMiniY(s.y) - STATE_SIZE / 2}
            width={STATE_SIZE}
            height={STATE_SIZE}
            fill="var(--color-accent)"
          />
        ))}
        {/* Viewport */}
        <rect
          x={vpRectX}
          y={vpRectY}
          width={vpRectW}
          height={vpRectH}
          fill="var(--color-accent)"
          fillOpacity={0.1}
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeOpacity={0.6}
        />
      </svg>
    </div>
  );
}
