import type { State, Transition, Mode } from '@/types';

const STATE_RADIUS = 28;
const PADDING = 60;

/* ── Bounding box ──────────────────────────────────────── */
function getBBox(states: State[]) {
  if (states.length === 0) return { minX: 0, minY: 0, maxX: 200, maxY: 200 };
  const xs = states.map(s => s.x);
  const ys = states.map(s => s.y);
  return {
    minX: Math.min(...xs) - STATE_RADIUS - PADDING,
    minY: Math.min(...ys) - STATE_RADIUS - PADDING - 40, // extra for self-loops
    maxX: Math.max(...xs) + STATE_RADIUS + PADDING,
    maxY: Math.max(...ys) + STATE_RADIUS + PADDING,
  };
}

/* ── SVG Export ────────────────────────────────────────── */
export function exportSVG(states_: State[], mode: Mode): string {
  const svgEl = document.querySelector('[data-canvas] svg') as SVGSVGElement | null;
  if (!svgEl) throw new Error('No SVG canvas found');

  const bbox = getBBox(states_);
  const w = bbox.maxX - bbox.minX;
  const h = bbox.maxY - bbox.minY;

  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  // Remove event handlers by setting attributes
  clone.removeAttribute('class');
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(w));
  clone.setAttribute('height', String(h));
  clone.setAttribute('viewBox', `${bbox.minX} ${bbox.minY} ${w} ${h}`);

  // Remove grid pattern rect
  const gridRects = clone.querySelectorAll('rect[fill*="url(#grid"]');
  gridRects.forEach(r => r.remove());

  // Remove box-select rect if any
  // Fix transform: remove pan/zoom, use identity
  const mainG = clone.querySelector('g[transform]');
  if (mainG) mainG.setAttribute('transform', '');

  // Add dark background
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('x', String(bbox.minX));
  bg.setAttribute('y', String(bbox.minY));
  bg.setAttribute('width', String(w));
  bg.setAttribute('height', String(h));
  bg.setAttribute('fill', '#0a0a0f');
  clone.insertBefore(bg, clone.firstChild);

  // Inline CSS variables as actual colors for standalone SVG
  const colorMap: Record<string, string> = {
    'var(--color-accent)': '#22d3ee',
    'var(--color-accent-dim)': '#155e75',
    'var(--color-border)': '#1e1e1e',
    'var(--bg-surface)': '#111111',
    'var(--bg-surface-raised)': '#161616',
    'var(--bg-surface-sunken)': '#0c0c0c',
    'var(--color-text)': '#d4d4d4',
    'var(--color-text-bright)': '#f0f0f0',
    'var(--color-text-dim)': '#888888',
    'var(--color-text-muted)': '#555555',
    'var(--color-grid)': '#161616',
    'var(--bg-primary)': '#0a0a0a',
    'var(--bg-canvas)': '#080808',
    'var(--color-reject)': '#ef4444',
    'var(--color-accept)': '#22c55e',
    'var(--color-sim-active)': '#eab308',
  };

  function inlineColors(el: Element) {
    for (const attr of ['fill', 'stroke', 'color', 'stop-color']) {
      const val = el.getAttribute(attr);
      if (val) {
        // Handle var() references
        const match = val.match(/var\(([^)]+)\)/);
        if (match && colorMap[`var(${match[1]})`]) {
          el.setAttribute(attr, colorMap[`var(${match[1]})`]);
        } else if (colorMap[val]) {
          el.setAttribute(attr, colorMap[val]);
        }
      }
    }
    // Also handle style attributes
    const style = el.getAttribute('style');
    if (style) {
      let newStyle = style;
      for (const [varRef, hex] of Object.entries(colorMap)) {
        newStyle = newStyle.replaceAll(varRef, hex);
      }
      el.setAttribute('style', newStyle);
    }
    for (const child of el.children) inlineColors(child);
  }
  inlineColors(clone);

  // Add font style
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `text { font-family: 'JetBrains Mono', 'Fira Code', monospace; }`;
  clone.insertBefore(style, clone.firstChild);

  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

export function downloadSVG(states: State[], mode: Mode) {
  try {
    const svgStr = exportSVG(states, mode);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stateforge-${mode}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('SVG export failed:', e);
    alert('SVG export failed. See console for details.');
  }
}

/* ── PNG Export ─────────────────────────────────────────── */
export function downloadPNG(states: State[], mode: Mode) {
  let svgStr: string;
  try {
    svgStr = exportSVG(states, mode);
  } catch (e) {
    console.error('PNG export failed:', e);
    alert('PNG export failed. See console for details.');
    return;
  }

  // Parse dimensions from the SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgStr, 'image/svg+xml');
  const svgRoot = doc.documentElement;
  const w = parseFloat(svgRoot.getAttribute('width') || '800');
  const h = parseFloat(svgRoot.getAttribute('height') || '600');

  const scale = 2; // retina
  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  const img = new Image();
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `stateforge-${mode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }, 'image/png');
  };

  img.src = url;
}

/* ── LaTeX/TikZ Export ─────────────────────────────────── */
export function generateTikZ(states: State[], transitions: Transition[], mode: Mode): string {
  if (states.length === 0) return '% No states to export';

  // Scale positions: TikZ uses cm, our coords are px. ~50px = 1cm
  const SCALE = 1 / 50;

  const stateMap = new Map(states.map(s => [s.id, s]));

  // Find reference point (min x, min y) to normalize positions
  const minX = Math.min(...states.map(s => s.x));
  const minY = Math.min(...states.map(s => s.y));

  const lines: string[] = [];
  lines.push('\\begin{tikzpicture}[shorten >=1pt, node distance=2cm, on grid, auto]');

  // Nodes
  for (const s of states) {
    const opts: string[] = ['state'];
    if (s.isInitial) opts.push('initial');
    if (s.isAccepting) opts.push('accepting');

    const x = ((s.x - minX) * SCALE).toFixed(1);
    const y = (-(s.y - minY) * SCALE).toFixed(1); // flip Y axis

    const label = s.label.replace(/([_^$&%#{}~])/g, '\\$1');
    const texLabel = s.label.match(/^q(\d+)$/)
      ? `$q_{${s.label.slice(1)}}$`
      : `$\\text{${label}}$`;

    lines.push(`  \\node[${opts.join(', ')}] (${s.label}) at (${x}, ${y}) {${texLabel}};`);
  }

  lines.push('');

  // Group transitions by from state
  const fromGroups = new Map<string, Transition[]>();
  for (const t of transitions) {
    if (!fromGroups.has(t.from)) fromGroups.set(t.from, []);
    fromGroups.get(t.from)!.push(t);
  }

  if (transitions.length > 0) {
    lines.push('  \\path[->]');
    const pathLines: string[] = [];

    for (const [fromId, trans] of fromGroups) {
      const fromState = stateMap.get(fromId);
      if (!fromState) continue;

      for (const t of trans) {
        const toState = stateMap.get(t.to);
        if (!toState) continue;

        const symbols = t.symbols.join(', ');
        const texSymbols = symbols.replace(/ε/g, '$\\varepsilon$');

        if (t.from === t.to) {
          // Self-loop
          pathLines.push(`    (${fromState.label}) edge [loop above] node {${texSymbols}} ()`);
        } else {
          // Check if there's a reverse edge (bidirectional)
          const hasReverse = transitions.some(t2 => t2.from === t.to && t2.to === t.from);
          const bendOpt = hasReverse ? ' [bend left]' : '';
          pathLines.push(`    (${fromState.label}) edge${bendOpt} node {${texSymbols}} (${toState.label})`);
        }
      }
    }

    lines.push(pathLines.join('\n') + ';');
  }

  lines.push('\\end{tikzpicture}');
  return lines.join('\n');
}

export async function copyTikZ(states: State[], transitions: Transition[], mode: Mode): Promise<boolean> {
  const tikz = generateTikZ(states, transitions, mode);
  try {
    await navigator.clipboard.writeText(tikz);
    return true;
  } catch {
    return false;
  }
}
