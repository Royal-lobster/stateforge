import type { Production, Grammar, GrammarType, ParseTreeNode, CYKCell } from './types';

let _uid = 0;
function uid() { return `g_${Date.now()}_${_uid++}`; }

// ════════════════════════════════════════════════════
// ── Parsing grammar text ──
// ════════════════════════════════════════════════════

/**
 * Parse grammar text into productions.
 * Format: one production per line, e.g.
 *   S → aSb | ε
 *   S -> AB
 *   A → aA | a
 * Supports →, ->, ::=
 * | separates alternatives on same line
 * ε or eps for empty string
 */
export function parseGrammarText(text: string): Grammar {
  const productions: Production[] = [];
  let startSymbol = '';

  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.startsWith('//'));

  for (const line of lines) {
    // Split on arrow
    const arrowMatch = line.match(/^(\S+)\s*(?:→|->|::=)\s*(.+)$/);
    if (!arrowMatch) continue;

    const head = arrowMatch[1];
    if (!startSymbol) startSymbol = head;

    const alternatives = arrowMatch[2].split('|').map(a => a.trim());

    for (const alt of alternatives) {
      const body = tokenizeBody(alt);
      productions.push({ id: uid(), head, body });
    }
  }

  return { productions, startSymbol: startSymbol || 'S' };
}

function tokenizeBody(bodyStr: string): string[] {
  if (bodyStr === 'ε' || bodyStr === 'eps' || bodyStr === 'epsilon' || bodyStr === 'ϵ') {
    return ['ε'];
  }

  const tokens: string[] = [];
  let i = 0;
  while (i < bodyStr.length) {
    if (bodyStr[i] === ' ') { i++; continue; }
    // Multi-char non-terminals in angle brackets: <NT>
    if (bodyStr[i] === '<') {
      const end = bodyStr.indexOf('>', i);
      if (end !== -1) {
        tokens.push(bodyStr.slice(i + 1, end));
        i = end + 1;
        continue;
      }
    }
    // Single character
    tokens.push(bodyStr[i]);
    i++;
  }
  return tokens;
}

// ════════════════════════════════════════════════════
// ── Grammar classification ──
// ════════════════════════════════════════════════════

export function isNonTerminal(sym: string): boolean {
  return sym.length === 1 ? sym >= 'A' && sym <= 'Z' : /^[A-Z]/.test(sym);
}

export function isTerminal(sym: string): boolean {
  return sym === 'ε' || (!isNonTerminal(sym));
}

export function classifyGrammar(grammar: Grammar): GrammarType {
  if (grammar.productions.length === 0) return 'unknown';

  let isRegular = true;
  let isCF = true;
  let isCS = true;

  for (const p of grammar.productions) {
    // CF: head must be a single non-terminal (e.g. 'S', '<expr>')
    if (!isNonTerminal(p.head) || p.head.split(/\s+/).length !== 1) {
      isCF = false;
      isRegular = false;
    }

    const body = p.body.filter(s => s !== 'ε');

    // Regular: body is terminal + optional non-terminal (right-linear)
    // or just a terminal, or ε
    if (isRegular) {
      if (p.body.length === 1 && p.body[0] === 'ε') {
        // OK for regular (start symbol → ε)
      } else if (body.length === 1 && isTerminal(body[0])) {
        // OK
      } else if (body.length === 2 && isTerminal(body[0]) && isNonTerminal(body[1])) {
        // OK (right-linear)
      } else {
        isRegular = false;
      }
    }

    // CS: |head| ≤ |body| (except S → ε if S doesn't appear on RHS)
    if (isCS && !(p.body.length === 1 && p.body[0] === 'ε')) {
      const headLen = p.head.length;
      const bodyLen = body.length;
      if (bodyLen < headLen) isCS = false;
    }
  }

  if (isRegular) return 'regular';
  if (isCF) return 'context-free';
  if (isCS) return 'context-sensitive';
  return 'unrestricted';
}

export function getTerminals(grammar: Grammar): Set<string> {
  const terms = new Set<string>();
  for (const p of grammar.productions) {
    for (const sym of p.body) {
      if (isTerminal(sym) && sym !== 'ε') terms.add(sym);
    }
  }
  return terms;
}

export function getNonTerminals(grammar: Grammar): Set<string> {
  const nts = new Set<string>();
  for (const p of grammar.productions) {
    nts.add(p.head);
    for (const sym of p.body) {
      if (isNonTerminal(sym)) nts.add(sym);
    }
  }
  return nts;
}

// ════════════════════════════════════════════════════
// ── Grammar Transformations ──
// ════════════════════════════════════════════════════

export interface TransformStep {
  description: string;
  productions: Production[];
}

export interface TransformResult {
  grammar: Grammar;
  steps: TransformStep[];
}

// ── Remove ε-productions ──

export function removeEpsilonProductions(grammar: Grammar): TransformResult {
  const steps: TransformStep[] = [];
  let prods = grammar.productions.map(p => ({ ...p, body: [...p.body] }));

  // Find nullable non-terminals
  const nullable = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of prods) {
      if (!nullable.has(p.head) && p.body.every(s => s === 'ε' || nullable.has(s))) {
        nullable.add(p.head);
        changed = true;
      }
    }
  }

  if (nullable.size === 0) {
    return { grammar, steps: [{ description: 'No ε-productions found', productions: [...prods] }] };
  }

  steps.push({
    description: `Nullable non-terminals: {${[...nullable].join(', ')}}`,
    productions: prods.map(p => ({ ...p })),
  });

  // Remove ε-productions and add alternatives
  const newProds: Production[] = [];
  for (const p of prods) {
    if (p.body.length === 1 && p.body[0] === 'ε') continue; // skip ε-productions

    // Generate all combinations where nullable symbols are optionally removed
    const nullablePositions = p.body
      .map((s, i) => nullable.has(s) ? i : -1)
      .filter(i => i !== -1);

    const combos = 1 << nullablePositions.length;
    for (let mask = 0; mask < combos; mask++) {
      const newBody = p.body.filter((_, i) => {
        const npIdx = nullablePositions.indexOf(i);
        if (npIdx === -1) return true;
        return !((mask >> npIdx) & 1);
      });
      if (newBody.length === 0) continue; // don't add empty body
      // Check if this production already exists
      const bodyStr = newBody.join(' ');
      if (!newProds.some(np => np.head === p.head && np.body.join(' ') === bodyStr)) {
        newProds.push({ id: uid(), head: p.head, body: newBody });
      }
    }
  }

  // If start was nullable, add S → ε back
  if (nullable.has(grammar.startSymbol)) {
    newProds.push({ id: uid(), head: grammar.startSymbol, body: ['ε'] });
  }

  steps.push({
    description: `Removed ε-productions, added ${newProds.length - prods.length + nullable.size} new alternatives`,
    productions: newProds.map(p => ({ ...p })),
  });

  return { grammar: { productions: newProds, startSymbol: grammar.startSymbol }, steps };
}

// ── Remove unit productions ──

export function removeUnitProductions(grammar: Grammar): TransformResult {
  const steps: TransformStep[] = [];
  let prods = grammar.productions.map(p => ({ ...p, body: [...p.body] }));

  // Find unit pairs: (A, B) where A =>* B through unit productions
  const nts = getNonTerminals(grammar);
  const unitPairs = new Set<string>();

  // Initialize: (A, A) for all A
  for (const nt of nts) unitPairs.add(`${nt}|${nt}`);

  // If A → B is a unit production, add (A, B)
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of prods) {
      if (p.body.length === 1 && isNonTerminal(p.body[0])) {
        for (const pair of [...unitPairs]) {
          const [a, b] = pair.split('|');
          if (b === p.head) {
            const newPair = `${a}|${p.body[0]}`;
            if (!unitPairs.has(newPair)) {
              unitPairs.add(newPair);
              changed = true;
            }
          }
        }
      }
    }
  }

  const unitProds = prods.filter(p => p.body.length === 1 && isNonTerminal(p.body[0]));
  if (unitProds.length === 0) {
    return { grammar, steps: [{ description: 'No unit productions found', productions: prods }] };
  }

  steps.push({
    description: `Found ${unitProds.length} unit production(s): ${unitProds.map(p => `${p.head} → ${p.body[0]}`).join(', ')}`,
    productions: prods.map(p => ({ ...p })),
  });

  // Build new productions
  const newProds: Production[] = [];
  for (const pair of unitPairs) {
    const [a, b] = pair.split('|');
    for (const p of prods) {
      if (p.head === b && !(p.body.length === 1 && isNonTerminal(p.body[0]))) {
        const bodyStr = p.body.join(' ');
        if (!newProds.some(np => np.head === a && np.body.join(' ') === bodyStr)) {
          newProds.push({ id: uid(), head: a, body: [...p.body] });
        }
      }
    }
  }

  steps.push({
    description: `Replaced unit productions with ${newProds.length} direct productions`,
    productions: newProds.map(p => ({ ...p })),
  });

  return { grammar: { productions: newProds, startSymbol: grammar.startSymbol }, steps };
}

// ── Remove useless symbols ──

export function removeUselessSymbols(grammar: Grammar): TransformResult {
  const steps: TransformStep[] = [];
  let prods = grammar.productions.map(p => ({ ...p, body: [...p.body] }));

  // Step 1: Find generating symbols (can derive terminal string)
  const generating = new Set<string>();
  // All terminals are generating
  for (const p of prods) {
    for (const s of p.body) {
      if (isTerminal(s)) generating.add(s);
    }
  }
  generating.add('ε');

  let changed = true;
  while (changed) {
    changed = false;
    for (const p of prods) {
      if (!generating.has(p.head) && p.body.every(s => generating.has(s))) {
        generating.add(p.head);
        changed = true;
      }
    }
  }

  // Remove productions with non-generating symbols
  const afterGen = prods.filter(p =>
    generating.has(p.head) && p.body.every(s => generating.has(s))
  );

  const removedGen = prods.length - afterGen.length;
  if (removedGen > 0) {
    steps.push({
      description: `Removed ${removedGen} production(s) with non-generating symbols`,
      productions: afterGen.map(p => ({ ...p })),
    });
  }

  // Step 2: Find reachable symbols from start
  const reachable = new Set<string>();
  reachable.add(grammar.startSymbol);
  changed = true;
  while (changed) {
    changed = false;
    for (const p of afterGen) {
      if (reachable.has(p.head)) {
        for (const s of p.body) {
          if (!reachable.has(s) && s !== 'ε') {
            reachable.add(s);
            changed = true;
          }
        }
      }
    }
  }

  const afterReach = afterGen.filter(p =>
    reachable.has(p.head) && p.body.every(s => s === 'ε' || reachable.has(s))
  );

  const removedReach = afterGen.length - afterReach.length;
  if (removedReach > 0) {
    steps.push({
      description: `Removed ${removedReach} production(s) with unreachable symbols`,
      productions: afterReach.map(p => ({ ...p })),
    });
  }

  if (removedGen === 0 && removedReach === 0) {
    steps.push({ description: 'No useless symbols found', productions: prods });
  }

  return { grammar: { productions: afterReach, startSymbol: grammar.startSymbol }, steps };
}

// ── Convert to Chomsky Normal Form (CNF) ──

export function toCNF(grammar: Grammar): TransformResult {
  const allSteps: TransformStep[] = [];

  // Step 1: Remove ε-productions
  let result = removeEpsilonProductions(grammar);
  allSteps.push(...result.steps.map(s => ({ ...s, description: `[ε-removal] ${s.description}` })));

  // Step 2: Remove unit productions
  result = removeUnitProductions(result.grammar);
  allSteps.push(...result.steps.map(s => ({ ...s, description: `[Unit-removal] ${s.description}` })));

  // Step 3: Remove useless symbols
  result = removeUselessSymbols(result.grammar);
  allSteps.push(...result.steps.map(s => ({ ...s, description: `[Useless-removal] ${s.description}` })));

  let prods = result.grammar.productions.map(p => ({ ...p, body: [...p.body] }));
  const startSymbol = result.grammar.startSymbol;

  // Step 4: Replace terminals in bodies of length > 1 with new non-terminals
  const termToNT = new Map<string, string>();
  let ntCounter = 0;
  const usedNTs = new Set(prods.map(p => p.head));

  function freshNT(): string {
    let name: string;
    do {
      name = ntCounter < 26
        ? String.fromCharCode(65 + ntCounter) + '₁'
        : `T${ntCounter}`;
      ntCounter++;
    } while (usedNTs.has(name));
    usedNTs.add(name);
    return name;
  }

  const termProds: Production[] = [];
  for (const p of prods) {
    if (p.body.length <= 1) continue; // skip A → a or A → ε
    for (let i = 0; i < p.body.length; i++) {
      const sym = p.body[i];
      if (isTerminal(sym) && sym !== 'ε') {
        if (!termToNT.has(sym)) {
          const nt = freshNT();
          termToNT.set(sym, nt);
          termProds.push({ id: uid(), head: nt, body: [sym] });
        }
        p.body[i] = termToNT.get(sym)!;
      }
    }
  }
  prods.push(...termProds);

  if (termProds.length > 0) {
    allSteps.push({
      description: `[TERM] Replaced ${termProds.length} terminal(s) with new non-terminals`,
      productions: prods.map(p => ({ ...p, body: [...p.body] })),
    });
  }

  // Step 5: Break long productions into binary
  const binProds: Production[] = [];
  const newProds: Production[] = [];

  for (const p of prods) {
    if (p.body.length <= 2) {
      newProds.push(p);
      continue;
    }
    // Break A → B1 B2 ... Bn into A → B1 X1, X1 → B2 X2, ...
    let current = p.head;
    for (let i = 0; i < p.body.length - 2; i++) {
      const next = freshNT();
      newProds.push({ id: uid(), head: current, body: [p.body[i], next] });
      current = next;
    }
    newProds.push({
      id: uid(),
      head: current,
      body: [p.body[p.body.length - 2], p.body[p.body.length - 1]],
    });
    binProds.push(p);
  }

  if (binProds.length > 0) {
    allSteps.push({
      description: `[BIN] Broke ${binProds.length} long production(s) into binary form`,
      productions: newProds.map(p => ({ ...p, body: [...p.body] })),
    });
  }

  // Add S → ε back if it was in the original
  const hadStartEps = grammar.productions.some(
    p => p.head === grammar.startSymbol && p.body.length === 1 && p.body[0] === 'ε'
  );
  if (hadStartEps && !newProds.some(p => p.head === startSymbol && p.body.length === 1 && p.body[0] === 'ε')) {
    newProds.push({ id: uid(), head: startSymbol, body: ['ε'] });
  }

  allSteps.push({
    description: `CNF complete: ${newProds.length} productions`,
    productions: newProds.map(p => ({ ...p })),
  });

  return { grammar: { productions: newProds, startSymbol }, steps: allSteps };
}

// ── Convert to Greibach Normal Form (GNF) ──

export function toGNF(grammar: Grammar): TransformResult {
  // First convert to CNF, then transform to GNF
  const cnfResult = toCNF(grammar);
  const allSteps = [...cnfResult.steps.map(s => ({ ...s, description: `[pre-GNF] ${s.description}` }))];

  let prods = cnfResult.grammar.productions.map(p => ({ ...p, body: [...p.body] }));
  const startSymbol = cnfResult.grammar.startSymbol;

  // Collect all non-terminals and order them
  function collectNTs() {
    const s = new Set<string>();
    for (const p of prods) {
      s.add(p.head);
      for (const sym of p.body) if (isNonTerminal(sym)) s.add(sym);
    }
    return [...s].sort();
  }

  let nts = collectNTs();

  // Phase 1: Forward pass — ensure A_i → A_j γ only when j > i, remove left recursion
  for (let i = 0; i < nts.length; i++) {
    // Substitute lower-ordered NTs
    for (let j = 0; j < i; j++) {
      const toReplace = prods.filter(p => p.head === nts[i] && p.body.length > 0 && p.body[0] === nts[j]);
      const replacements: Production[] = [];
      for (const p of toReplace) {
        const rest = p.body.slice(1);
        const ajProds = prods.filter(pp => pp.head === nts[j]);
        for (const ajp of ajProds) {
          const newBody = ajp.body[0] === 'ε' ? [...rest] : [...ajp.body, ...rest];
          if (newBody.length === 0) continue;
          replacements.push({ id: uid(), head: nts[i], body: newBody });
        }
      }
      prods = prods.filter(p => !toReplace.includes(p));
      prods.push(...replacements);
    }

    // Remove left recursion for A_i
    const recursive = prods.filter(p => p.head === nts[i] && p.body.length > 0 && p.body[0] === nts[i]);
    if (recursive.length > 0) {
      const nonRecursive = prods.filter(p => p.head === nts[i] && (p.body.length === 0 || p.body[0] !== nts[i]));
      const newNT = `${nts[i]}'`;
      const newProds: Production[] = [];

      for (const p of nonRecursive) {
        const body = p.body[0] === 'ε' ? [newNT] : [...p.body, newNT];
        newProds.push({ id: uid(), head: nts[i], body });
        // Also keep original without the new NT appended
        newProds.push({ id: uid(), head: nts[i], body: [...p.body] });
      }
      for (const p of recursive) {
        const alpha = p.body.slice(1);
        newProds.push({ id: uid(), head: newNT, body: [...alpha, newNT] });
        newProds.push({ id: uid(), head: newNT, body: [...alpha] });
      }

      prods = prods.filter(p => p.head !== nts[i]);
      prods.push(...newProds);
    }
  }

  allSteps.push({
    description: `[GNF] Forward pass: left recursion removed (${prods.length} productions)`,
    productions: prods.map(p => ({ ...p })),
  });

  // Phase 2: Back-substitution — process from highest to lowest
  // After forward pass, A_n starts with a terminal (highest-ordered NT).
  // Substitute backwards so all productions start with a terminal.
  nts = collectNTs();
  for (let i = nts.length - 2; i >= 0; i--) {
    const toFix = prods.filter(p => p.head === nts[i] && p.body.length > 0 && isNonTerminal(p.body[0]));
    const replacements: Production[] = [];
    for (const p of toFix) {
      const leadNT = p.body[0];
      const rest = p.body.slice(1);
      const leadProds = prods.filter(pp => pp.head === leadNT);
      for (const lp of leadProds) {
        if (lp.body[0] === 'ε') {
          if (rest.length > 0) replacements.push({ id: uid(), head: nts[i], body: [...rest] });
        } else {
          replacements.push({ id: uid(), head: nts[i], body: [...lp.body, ...rest] });
        }
      }
    }
    prods = prods.filter(p => !toFix.includes(p));
    prods.push(...replacements);
  }

  // Also fix primed NTs (from left recursion removal)
  const primedNTs = nts.filter(nt => nt.endsWith("'"));
  for (const pnt of primedNTs) {
    const toFix = prods.filter(p => p.head === pnt && p.body.length > 0 && isNonTerminal(p.body[0]));
    const replacements: Production[] = [];
    for (const p of toFix) {
      const leadNT = p.body[0];
      const rest = p.body.slice(1);
      const leadProds = prods.filter(pp => pp.head === leadNT && pp.body.length > 0 && !isNonTerminal(pp.body[0]));
      for (const lp of leadProds) {
        replacements.push({ id: uid(), head: pnt, body: [...lp.body, ...rest] });
      }
    }
    if (replacements.length > 0) {
      prods = prods.filter(p => !toFix.includes(p));
      prods.push(...replacements);
    }
  }

  // Remove duplicate productions
  const seen = new Set<string>();
  prods = prods.filter(p => {
    const key = `${p.head}→${p.body.join(' ')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Keep S → ε if the original grammar had it
  const hadStartEps = grammar.productions.some(
    p => p.head === grammar.startSymbol && p.body.length === 1 && p.body[0] === 'ε'
  );
  if (hadStartEps && !prods.some(p => p.head === startSymbol && p.body.length === 1 && p.body[0] === 'ε')) {
    prods.push({ id: uid(), head: startSymbol, body: ['ε'] });
  }

  allSteps.push({
    description: `[GNF] Back-substitution complete: ${prods.length} productions`,
    productions: prods.map(p => ({ ...p })),
  });

  return { grammar: { productions: prods, startSymbol }, steps: allSteps };
}

// ════════════════════════════════════════════════════
// ── CYK Parser ──
// ════════════════════════════════════════════════════

export interface CYKResult {
  accepted: boolean;
  table: CYKCell[][];
  steps: { row: number; col: number; description: string }[];
  parseTree: ParseTreeNode | null;
}

export function cykParse(grammarInput: Grammar, input: string): CYKResult {
  // Auto-convert to CNF if needed
  const isCNF = grammarInput.productions.every(p =>
    (p.body.length === 2 && isNonTerminal(p.body[0]) && isNonTerminal(p.body[1])) ||
    (p.body.length === 1 && isTerminal(p.body[0]) && p.body[0] !== 'ε') ||
    (p.body.length === 1 && p.body[0] === 'ε' && p.head === grammarInput.startSymbol)
  );
  const grammar = isCNF ? grammarInput : toCNF(grammarInput).grammar;

  const n = input.length;
  const steps: { row: number; col: number; description: string }[] = [];

  if (n === 0) {
    // Check if start symbol derives ε
    const accepts = grammar.productions.some(
      p => p.head === grammar.startSymbol && p.body.length === 1 && p.body[0] === 'ε'
    );
    return {
      accepted: accepts,
      table: [],
      steps: [{ row: 0, col: 0, description: accepts ? 'S → ε exists, accepted' : 'S → ε not found, rejected' }],
      parseTree: accepts ? { symbol: grammar.startSymbol, children: [{ symbol: 'ε', children: [], isTerminal: true }], isTerminal: false } : null,
    };
  }

  // table[l][i] = set of non-terminals that derive input[i..i+l]
  const table: CYKCell[][] = [];
  // backtrack[l][i][NT] = { production, split? } for tree reconstruction
  const back: Map<string, { prod: Production; split?: number }>[][] = [];

  for (let l = 0; l < n; l++) {
    table[l] = [];
    back[l] = [];
    for (let i = 0; i < n - l; i++) {
      table[l][i] = { nonTerminals: [], row: l, col: i };
      back[l][i] = new Map();
    }
  }

  // Fill length-1 (base case)
  for (let i = 0; i < n; i++) {
    const ch = input[i];
    for (const p of grammar.productions) {
      if (p.body.length === 1 && p.body[0] === ch) {
        if (!table[0][i].nonTerminals.includes(p.head)) {
          table[0][i].nonTerminals.push(p.head);
          back[0][i].set(p.head, { prod: p });
        }
      }
    }
    steps.push({
      row: 0, col: i,
      description: `[${i}] '${ch}': {${table[0][i].nonTerminals.join(', ') || '∅'}}`,
    });
  }

  // Fill length 2..n
  for (let l = 1; l < n; l++) {
    for (let i = 0; i < n - l; i++) {
      for (let k = 0; k < l; k++) {
        const leftCell = table[k][i];
        const rightCell = table[l - k - 1][i + k + 1];
        for (const p of grammar.productions) {
          if (p.body.length === 2) {
            const [B, C] = p.body;
            if (leftCell.nonTerminals.includes(B) && rightCell.nonTerminals.includes(C)) {
              if (!table[l][i].nonTerminals.includes(p.head)) {
                table[l][i].nonTerminals.push(p.head);
                back[l][i].set(p.head, { prod: p, split: k });
              }
            }
          }
        }
      }
      steps.push({
        row: l, col: i,
        description: `[${i}..${i + l}] '${input.slice(i, i + l + 1)}': {${table[l][i].nonTerminals.join(', ') || '∅'}}`,
      });
    }
  }

  const accepted = table[n - 1][0].nonTerminals.includes(grammar.startSymbol);

  // Build parse tree via backtracking
  function buildTree(nt: string, l: number, i: number): ParseTreeNode | null {
    const entry = back[l]?.[i]?.get(nt);
    if (!entry) return null;

    if (l === 0) {
      return {
        symbol: nt,
        children: [{ symbol: entry.prod.body[0], children: [], isTerminal: true }],
        isTerminal: false,
      };
    }

    const k = entry.split!;
    const [B, C] = entry.prod.body;
    const leftChild = buildTree(B, k, i);
    const rightChild = buildTree(C, l - k - 1, i + k + 1);

    if (!leftChild || !rightChild) return null;

    return { symbol: nt, children: [leftChild, rightChild], isTerminal: false };
  }

  const parseTree = accepted ? buildTree(grammar.startSymbol, n - 1, 0) : null;

  return { accepted, table, steps, parseTree };
}

// ════════════════════════════════════════════════════
// ── LL(1) Parser ──
// ════════════════════════════════════════════════════

export interface LL1Result {
  firstSets: Map<string, Set<string>>;
  followSets: Map<string, Set<string>>;
  parseTable: Map<string, Map<string, Production>>;
  conflicts: string[];
  parseSteps: { stack: string[]; remaining: string; action: string }[];
  accepted: boolean;
  parseTree: ParseTreeNode | null;
}

export function computeFirst(grammar: Grammar): Map<string, Set<string>> {
  const first = new Map<string, Set<string>>();
  const nts = getNonTerminals(grammar);
  const terms = getTerminals(grammar);

  for (const t of terms) first.set(t, new Set([t]));
  first.set('ε', new Set(['ε']));
  for (const nt of nts) first.set(nt, new Set());

  let changed = true;
  while (changed) {
    changed = false;
    for (const p of grammar.productions) {
      const before = first.get(p.head)!.size;

      if (p.body.length === 1 && p.body[0] === 'ε') {
        first.get(p.head)!.add('ε');
      } else {
        let allNullable = true;
        for (const sym of p.body) {
          if (sym === 'ε') continue;
          const symFirst = first.get(sym) ?? new Set();
          for (const s of symFirst) {
            if (s !== 'ε') first.get(p.head)!.add(s);
          }
          if (!symFirst.has('ε')) { allNullable = false; break; }
        }
        if (allNullable) first.get(p.head)!.add('ε');
      }

      if (first.get(p.head)!.size > before) changed = true;
    }
  }

  return first;
}

export function computeFollow(grammar: Grammar, first: Map<string, Set<string>>): Map<string, Set<string>> {
  const follow = new Map<string, Set<string>>();
  const nts = getNonTerminals(grammar);

  for (const nt of nts) follow.set(nt, new Set());
  follow.get(grammar.startSymbol)!.add('$');

  let changed = true;
  while (changed) {
    changed = false;
    for (const p of grammar.productions) {
      for (let i = 0; i < p.body.length; i++) {
        const sym = p.body[i];
        if (!isNonTerminal(sym)) continue;

        const before = follow.get(sym)!.size;

        // Look at what follows sym in this production
        let allFollowNull = true;
        for (let j = i + 1; j < p.body.length; j++) {
          const nextSym = p.body[j];
          const nextFirst = first.get(nextSym) ?? new Set();
          for (const s of nextFirst) {
            if (s !== 'ε') follow.get(sym)!.add(s);
          }
          if (!nextFirst.has('ε')) { allFollowNull = false; break; }
        }

        if (allFollowNull || i === p.body.length - 1) {
          const headFollow = follow.get(p.head) ?? new Set();
          for (const s of headFollow) follow.get(sym)!.add(s);
        }

        if (follow.get(sym)!.size > before) changed = true;
      }
    }
  }

  return follow;
}

function firstOfString(symbols: string[], first: Map<string, Set<string>>): Set<string> {
  const result = new Set<string>();
  let allNullable = true;
  for (const sym of symbols) {
    if (sym === 'ε') continue;
    const symFirst = first.get(sym) ?? new Set();
    for (const s of symFirst) {
      if (s !== 'ε') result.add(s);
    }
    if (!symFirst.has('ε')) { allNullable = false; break; }
  }
  if (allNullable) result.add('ε');
  return result;
}

export function ll1Parse(grammar: Grammar, input: string): LL1Result {
  const firstSets = computeFirst(grammar);
  const followSets = computeFollow(grammar, firstSets);

  // Build parse table
  const parseTable = new Map<string, Map<string, Production>>();
  const conflicts: string[] = [];
  const nts = getNonTerminals(grammar);

  for (const nt of nts) parseTable.set(nt, new Map());

  for (const p of grammar.productions) {
    const bodyFirst = p.body.length === 1 && p.body[0] === 'ε'
      ? new Set(['ε'])
      : firstOfString(p.body, firstSets);

    for (const t of bodyFirst) {
      if (t === 'ε') continue;
      const existing = parseTable.get(p.head)!.get(t);
      if (existing) {
        conflicts.push(`Conflict at [${p.head}, ${t}]: ${p.head}→${existing.body.join('')} vs ${p.head}→${p.body.join('')}`);
      } else {
        parseTable.get(p.head)!.set(t, p);
      }
    }

    if (bodyFirst.has('ε')) {
      const headFollow = followSets.get(p.head) ?? new Set();
      for (const t of headFollow) {
        const existing = parseTable.get(p.head)!.get(t);
        if (existing) {
          conflicts.push(`Conflict at [${p.head}, ${t}]: ${p.head}→${existing.body.join('')} vs ${p.head}→${p.body.join('')}`);
        } else {
          parseTable.get(p.head)!.set(t, p);
        }
      }
    }
  }

  // Parse the input
  const parseSteps: { stack: string[]; remaining: string; action: string }[] = [];
  const stack = ['$', grammar.startSymbol];
  const inputArr = [...input, '$'];
  let pos = 0;
  let accepted = true;

  // For parse tree building
  interface TreeStackEntry { node: ParseTreeNode; }
  const treeStack: (TreeStackEntry | null)[] = [null]; // $ placeholder
  const rootNode: ParseTreeNode = { symbol: grammar.startSymbol, children: [], isTerminal: false };
  treeStack.push({ node: rootNode });

  const maxSteps = 500;
  let stepCount = 0;

  while (stack.length > 0 && stepCount < maxSteps) {
    stepCount++;
    const top = stack[stack.length - 1];
    const current = inputArr[pos];

    parseSteps.push({
      stack: [...stack],
      remaining: inputArr.slice(pos).join(''),
      action: '',
    });

    if (top === '$' && current === '$') {
      parseSteps[parseSteps.length - 1].action = 'Accept!';
      break;
    }

    if (top === '$' || current === undefined) {
      parseSteps[parseSteps.length - 1].action = 'Error: unexpected end';
      accepted = false;
      break;
    }

    if (isTerminal(top) || top === '$') {
      if (top === current) {
        stack.pop();
        const treeEntry = treeStack.pop();
        pos++;
        parseSteps[parseSteps.length - 1].action = `Match '${top}'`;
      } else {
        parseSteps[parseSteps.length - 1].action = `Error: expected '${top}', got '${current}'`;
        accepted = false;
        break;
      }
    } else {
      // Non-terminal
      const prod = parseTable.get(top)?.get(current);
      if (!prod) {
        parseSteps[parseSteps.length - 1].action = `Error: no rule for [${top}, ${current}]`;
        accepted = false;
        break;
      }

      stack.pop();
      const parentEntry = treeStack.pop();

      parseSteps[parseSteps.length - 1].action = `${prod.head} → ${prod.body.join(' ')}`;

      if (prod.body.length === 1 && prod.body[0] === 'ε') {
        if (parentEntry) {
          parentEntry.node.children.push({ symbol: 'ε', children: [], isTerminal: true });
        }
      } else {
        const childNodes: ParseTreeNode[] = prod.body.map(s => ({
          symbol: s,
          children: [],
          isTerminal: isTerminal(s),
        }));

        if (parentEntry) {
          parentEntry.node.children = childNodes;
        }

        // Push in reverse order
        for (let i = prod.body.length - 1; i >= 0; i--) {
          stack.push(prod.body[i]);
          treeStack.push({ node: childNodes[i] });
        }
      }
    }
  }

  if (stepCount >= maxSteps) accepted = false;

  return {
    firstSets,
    followSets,
    parseTable,
    conflicts,
    parseSteps,
    accepted,
    parseTree: accepted ? rootNode : null,
  };
}

// ════════════════════════════════════════════════════
// ── Brute force parser ──
// ════════════════════════════════════════════════════

export function bruteForceParse(grammar: Grammar, input: string, maxDepth = 15): { accepted: boolean; derivation: string[] } {
  // BFS derivation using token arrays (supports multi-char non-terminals)
  const targetTokens = input ? input.split('') : [];

  type Form = string[]; // array of symbols (terminals + non-terminals)
  const formKey = (f: Form) => f.join('\x00');
  const formStr = (f: Form) => f.length === 0 ? 'ε' : f.join('');

  const startForm: Form = [grammar.startSymbol];
  const queue: { form: Form; steps: string[] }[] = [
    { form: startForm, steps: [formStr(startForm)] },
  ];
  const visited = new Set<string>();
  visited.add(formKey(startForm));

  while (queue.length > 0) {
    const { form, steps } = queue.shift()!;

    // Check if form matches target (all terminals)
    const allTerminal = form.every(s => isTerminal(s) && s !== 'ε');
    const formTerminals = form.filter(s => s !== 'ε');
    if (allTerminal && formTerminals.join('') === input) {
      return { accepted: true, derivation: steps };
    }
    if (form.length === 0 && input === '') {
      return { accepted: true, derivation: steps };
    }

    if (steps.length > maxDepth) continue;
    // Prune: too many terminal symbols already
    const termCount = form.filter(s => isTerminal(s) && s !== 'ε').length;
    if (termCount > input.length + 5) continue;

    // Find leftmost non-terminal
    const ntIdx = form.findIndex(s => isNonTerminal(s));
    if (ntIdx === -1) continue; // all terminals, didn't match

    const ntSym = form[ntIdx];

    for (const p of grammar.productions) {
      if (p.head !== ntSym) continue;
      const replacement = p.body[0] === 'ε' ? [] : [...p.body];
      const newForm: Form = [...form.slice(0, ntIdx), ...replacement, ...form.slice(ntIdx + 1)];
      const key = formKey(newForm);

      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ form: newForm, steps: [...steps, formStr(newForm)] });
      }
    }
  }

  return { accepted: false, derivation: [] };
}
