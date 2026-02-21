'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface LSystemDef {
  name: string;
  axiom: string;
  rules: Record<string, string>;
  angle: number;
  iterations: number;
}

const PRESETS: LSystemDef[] = [
  {
    name: 'Koch Curve',
    axiom: 'F',
    rules: { F: 'F+F-F-F+F' },
    angle: 90,
    iterations: 3,
  },
  {
    name: 'Sierpinski Triangle',
    axiom: 'F-G-G',
    rules: { F: 'F-G+F+G-F', G: 'GG' },
    angle: 120,
    iterations: 4,
  },
  {
    name: 'Dragon Curve',
    axiom: 'FX',
    rules: { X: 'X+YF+', Y: '-FX-Y' },
    angle: 90,
    iterations: 10,
  },
  {
    name: 'Plant',
    axiom: 'X',
    rules: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' },
    angle: 25,
    iterations: 5,
  },
  {
    name: 'Hilbert Curve',
    axiom: 'A',
    rules: { A: '-BF+AFA+FB-', B: '+AF-BFB-FA+' },
    angle: 90,
    iterations: 4,
  },
  {
    name: 'Penrose Tiling (P3)',
    axiom: '[7]++[7]++[7]++[7]++[7]',
    rules: { '6': '81++91----71[-81----61]++', '7': '+81--91[---61--71]+', '8': '-61++71[+++81++91]-', '9': '--81++++61[+91++++71]--71', '1': '' },
    angle: 36,
    iterations: 4,
  },
];

function generateString(axiom: string, rules: Record<string, string>, iterations: number): string {
  let current = axiom;
  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (const ch of current) {
      next += rules[ch] ?? ch;
    }
    current = next;
    if (current.length > 500000) break; // safety limit
  }
  return current;
}

interface Point { x: number; y: number; }

function computePath(str: string, angle: number): { points: Point[][]; bounds: { minX: number; maxX: number; minY: number; maxY: number } } {
  const rad = (angle * Math.PI) / 180;
  let x = 0, y = 0, dir = -Math.PI / 2; // start pointing up
  const stack: { x: number; y: number; dir: number }[] = [];
  const segments: Point[][] = [];
  let currentSegment: Point[] = [{ x, y }];

  for (const ch of str) {
    switch (ch) {
      case 'F':
      case 'G':
      case '1': case '6': case '7': case '8': case '9':
        x += Math.cos(dir);
        y += Math.sin(dir);
        currentSegment.push({ x, y });
        break;
      case 'f':
        x += Math.cos(dir);
        y += Math.sin(dir);
        if (currentSegment.length > 1) segments.push(currentSegment);
        currentSegment = [{ x, y }];
        break;
      case '+':
        dir += rad;
        break;
      case '-':
        dir -= rad;
        break;
      case '[':
        stack.push({ x, y, dir });
        break;
      case ']':
        if (currentSegment.length > 1) segments.push(currentSegment);
        const saved = stack.pop();
        if (saved) { x = saved.x; y = saved.y; dir = saved.dir; }
        currentSegment = [{ x, y }];
        break;
    }
  }
  if (currentSegment.length > 1) segments.push(currentSegment);

  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  for (const seg of segments) {
    for (const p of seg) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
  }

  return { points: segments, bounds: { minX, maxX, minY, maxY } };
}

export default function LSystem({ isMobile }: { isMobile: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preset, setPreset] = useState(0);
  const [iterations, setIterations] = useState(PRESETS[0].iterations);
  const [customRules, setCustomRules] = useState('');
  const [customAxiom, setCustomAxiom] = useState('');
  const [customAngle, setCustomAngle] = useState(90);

  const current = PRESETS[preset];
  const axiom = customAxiom || current.axiom;
  const angle = customAngle || current.angle;
  const rules = customRules
    ? Object.fromEntries(customRules.split('\n').map(l => { const [k, v] = l.split('=').map(s => s.trim()); return [k, v]; }).filter(([k, v]) => k && v))
    : current.rules;

  const path = useMemo(() => {
    const str = generateString(axiom, rules, iterations);
    return computePath(str, angle);
  }, [axiom, rules, iterations, angle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, w, h);

    const { points, bounds } = path;
    if (points.length === 0) return;

    const bw = bounds.maxX - bounds.minX || 1;
    const bh = bounds.maxY - bounds.minY || 1;
    const padding = 20;
    const scale = Math.min((w - padding * 2) / bw, (h - padding * 2) / bh);
    const offX = padding + (w - padding * 2 - bw * scale) / 2 - bounds.minX * scale;
    const offY = padding + (h - padding * 2 - bh * scale) / 2 - bounds.minY * scale;

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    for (const seg of points) {
      ctx.beginPath();
      for (let i = 0; i < seg.length; i++) {
        const sx = seg[i].x * scale + offX;
        const sy = seg[i].y * scale + offY;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
  }, [path]);

  const handlePresetChange = (idx: number) => {
    setPreset(idx);
    setIterations(PRESETS[idx].iterations);
    setCustomRules('');
    setCustomAxiom('');
    setCustomAngle(PRESETS[idx].angle);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* Controls */}
      <div className={`flex flex-col border-r border-[var(--color-border)] ${isMobile ? 'h-[35%]' : 'w-64'} shrink-0 overflow-y-auto`}>
        <div className="px-3 py-2 border-b border-[var(--color-border)] font-mono text-[10px] tracking-widest text-[var(--color-text-dim)] uppercase">
          L-Systems
        </div>

        {/* Preset selector */}
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <select
            value={preset}
            onChange={e => handlePresetChange(parseInt(e.target.value))}
            className="w-full bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-[10px] px-1 py-1 outline-none"
          >
            {PRESETS.map((p, i) => (
              <option key={i} value={i}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Iterations slider */}
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[var(--color-text-dim)]">Iterations</span>
            <span className="font-mono text-xs text-[var(--color-accent)]">{iterations}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIterations(Math.max(0, iterations - 1))} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]">
              <ChevronLeft size={14} />
            </button>
            <input
              type="range"
              min={0}
              max={10}
              value={iterations}
              onChange={e => setIterations(parseInt(e.target.value))}
              className="flex-1 accent-[var(--color-accent)]"
            />
            <button onClick={() => setIterations(Math.min(10, iterations + 1))} className="p-1 text-[var(--color-text-dim)] hover:text-[var(--color-accent)]">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Axiom */}
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <span className="font-mono text-[10px] text-[var(--color-text-dim)]">Axiom</span>
          <input
            value={customAxiom || current.axiom}
            onChange={e => setCustomAxiom(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 mt-1 outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* Angle */}
        <div className="px-3 py-2 border-b border-[var(--color-border)]">
          <span className="font-mono text-[10px] text-[var(--color-text-dim)]">Angle (°)</span>
          <input
            type="number"
            value={customAngle || current.angle}
            onChange={e => setCustomAngle(parseInt(e.target.value) || 90)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-xs px-2 py-1 mt-1 outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* Rules */}
        <div className="px-3 py-2 flex-1">
          <span className="font-mono text-[10px] text-[var(--color-text-dim)]">Rules (one per line: X=...)</span>
          <textarea
            value={customRules || Object.entries(current.rules).map(([k, v]) => `${k}=${v}`).join('\n')}
            onChange={e => setCustomRules(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--color-border)] text-[var(--color-text)] font-mono text-[10px] px-2 py-1 mt-1 outline-none focus:border-[var(--color-accent)] resize-none h-24"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-[var(--bg-canvas)] relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
