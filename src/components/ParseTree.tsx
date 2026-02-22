'use client';

import { useState, useMemo, useCallback } from 'react';
import type { ParseTreeNode } from '@/types';

// ── Layout constants ──
const NODE_H = 24;
const NODE_PAD_X = 12;
const LEVEL_GAP = 44;
const SIBLING_GAP = 8;
const FONT_SIZE = 11;
const CHAR_WIDTH = 6.8; // approximate monospace char width at 11px

interface LayoutNode {
  id: string;
  symbol: string;
  isTerminal: boolean;
  x: number;
  y: number;
  w: number;
  children: LayoutNode[];
  collapsed: boolean;
}

let _layoutId = 0;

function computeLayout(
  node: ParseTreeNode,
  depth: number,
  collapsedSet: Set<string>,
  idPrefix: string = '',
): LayoutNode {
  const id = `${idPrefix}${_layoutId++}`;
  const textW = node.symbol.length * CHAR_WIDTH + (node.isTerminal ? 2 * CHAR_WIDTH : 0); // quotes for terminals
  const w = Math.max(textW + NODE_PAD_X * 2, 32);
  const collapsed = collapsedSet.has(id);

  const children: LayoutNode[] = [];
  if (!collapsed && !node.isTerminal) {
    for (let i = 0; i < node.children.length; i++) {
      children.push(computeLayout(node.children[i], depth + 1, collapsedSet, idPrefix));
    }
  }

  return { id, symbol: node.symbol, isTerminal: node.isTerminal, x: 0, y: depth * LEVEL_GAP, w, children, collapsed };
}

/** Returns subtree width */
function assignX(node: LayoutNode, startX: number): number {
  if (node.children.length === 0) {
    node.x = startX;
    return node.w;
  }

  let cursor = startX;
  const childWidths: number[] = [];
  for (const child of node.children) {
    const cw = assignX(child, cursor);
    childWidths.push(cw);
    cursor += cw + SIBLING_GAP;
  }
  const totalChildrenW = cursor - SIBLING_GAP - startX;

  // Center parent over children
  const childrenCenter = startX + totalChildrenW / 2;
  node.x = childrenCenter - node.w / 2;

  // If parent node is wider than children, shift children
  if (node.w > totalChildrenW) {
    const shift = (node.w - totalChildrenW) / 2;
    shiftSubtree(node.children, shift);
    node.x = startX;
    return node.w;
  }

  return Math.max(totalChildrenW, node.w);
}

function shiftSubtree(nodes: LayoutNode[], dx: number) {
  for (const n of nodes) {
    n.x += dx;
    shiftSubtree(n.children, dx);
  }
}

function collectAll(node: LayoutNode, out: LayoutNode[] = []): LayoutNode[] {
  out.push(node);
  for (const c of node.children) collectAll(c, out);
  return out;
}

function maxDepth(node: LayoutNode): number {
  if (node.children.length === 0) return node.y;
  return Math.max(node.y, ...node.children.map(maxDepth));
}

export default function ParseTreeView({ node }: { node: ParseTreeNode }) {
  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setCollapsedSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const { root, totalW, totalH } = useMemo(() => {
    _layoutId = 0;
    const root = computeLayout(node, 0, collapsedSet);
    const totalW = assignX(root, 0);
    const totalH = maxDepth(root) + NODE_H + 8;
    return { root, totalW, totalH };
  }, [node, collapsedSet]);

  const allNodes = useMemo(() => collectAll(root), [root]);

  const PAD = 16;
  const svgW = totalW + PAD * 2;
  const svgH = totalH + PAD * 2;

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[300px] bg-[var(--bg-surface-sunken)] border border-[var(--color-border)]">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="block"
      >
        <g transform={`translate(${PAD}, ${PAD})`}>
          {/* Lines */}
          {allNodes.map(n =>
            n.children.map((c, i) => (
              <line
                key={`${n.id}-${i}`}
                x1={n.x + n.w / 2}
                y1={n.y + NODE_H}
                x2={c.x + c.w / 2}
                y2={c.y}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
            ))
          )}

          {/* Nodes */}
          {allNodes.map(n => (
            <g
              key={n.id}
              transform={`translate(${n.x}, ${n.y})`}
              onClick={() => !n.isTerminal && n.children.length >= 0 && toggle(n.id)}
              style={{ cursor: n.isTerminal ? 'default' : 'pointer' }}
            >
              <rect
                width={n.w}
                height={NODE_H}
                fill="var(--bg-surface)"
                stroke={n.isTerminal ? 'var(--color-text-dim)' : 'var(--color-accent)'}
                strokeWidth={1}
              />
              <text
                x={n.w / 2}
                y={NODE_H / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="monospace"
                fontSize={FONT_SIZE}
                fill={n.isTerminal ? 'var(--color-text)' : 'var(--color-accent)'}
              >
                {n.isTerminal ? (n.symbol === 'ε' ? 'ε' : `'${n.symbol}'`) : n.symbol}
              </text>
              {/* Collapse indicator */}
              {!n.isTerminal && n.collapsed && (
                <text
                  x={n.w - 6}
                  y={NODE_H / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="monospace"
                  fontSize={9}
                  fill="var(--color-text-dim)"
                >
                  +
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
