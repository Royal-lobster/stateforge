# Pumping lemma game

An interactive game for exploring the pumping lemma for regular and context-free languages. Access it from the **PUMP** button in the toolbar or via the command palette (<kbd>⌘K</kbd> then "Pumping Lemma Game").

## Regular pumping lemma

The game plays out the adversarial proof structure of the pumping lemma. You (the player) are trying to prove that a language is not regular by finding a string that cannot be pumped.

### Game flow

1. **Select a language:** Choose from preset non-regular languages: { 0ⁿ1ⁿ | n ≥ 0 }, { ww | w ∈ {a,b}* }, { aⁿbⁿcⁿ | n ≥ 0 }, or { aᵖ | p is prime }.

2. **System picks p:** The system (adversary) chooses a pumping length p.

3. **Pick a string:** You choose a string s in the language with |s| ≥ p. The game suggests valid strings you can use.

4. **System picks decomposition:** The system decomposes s = xyz where |xy| ≤ p and |y| ≥ 1. It tries to find a decomposition that survives pumping.

5. **Pick i:** You choose a pump count i (0, 1, 2, ...) and the game checks whether xyⁱz is still in the language.

6. **Result:** If xyⁱz is not in the language, you win (the language is not regular). If the system found a surviving decomposition, it wins that round.

### Decomposition visualization

The string is displayed with each segment (x, y, z) shown in a distinct color: x in purple, y in cyan, z in amber. The pumped string xyⁱz is shown below with the repeated y segment highlighted.

## Context-free pumping lemma

Works the same way but with the context-free pumping lemma. The decomposition is s = uvxyz where |vxy| ≤ p and |vy| ≥ 1, and the game pumps uvⁱxyⁱz.

→ **Languages:** { aⁿbⁿcⁿ | n ≥ 0 } and { ww | w ∈ {a,b}* }

→ **Decomposition colors:** u (purple), v (cyan), x (amber), y (green), z (pink)

→ **5-part split:** The visualization shows all five segments of the decomposition with their colors

Switch between regular and context-free modes using the tabs at the top of the game panel.
