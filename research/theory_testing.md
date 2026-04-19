# Theory Testing: ProblemSpace AI Metrics

This document serves as the official ledger for validating the "Neural Memory" architecture and its impact on performance, cost, and accuracy.

---

## 🧪 Test Case 01: Token Density Hypothesis
**Status**: [PENDING VALIDATION]

### 1. The Hypothesis
The **Neural Memory Canvas** (Structured Graph) is significantly more token-efficient than **Standard Context** (Linear Prose History). We hypothesize a minimum **-60% reduction** in context window bloat during extended strategic mapping sessions.

### 2. Projected Metrics (The Baseline)

| Metric | Standard Context (Prose) | Neural Memory (Structured) | Δ Change |
| :--- | :--- | :--- | :--- |
| **Initial Context Load** | 1,500 - 3,000 tokens | 400 - 800 tokens | **-70%** |
| **Growth per 10 Turns** | +3,000 tokens (Linear) | +200 tokens (Synthesized) | **-93%** |
| **Long-Term Retrieval** | Low (Lossy/Forgetful) | High (Exact/Structural) | **+200%** |
| **Contextual Accuracy** | Degrades over time | Stabilizes/Improves | **Precision ↑** |

---

## 🔬 Upcoming Validation Experiments

### Experiment: Real-Time Token Monitor (P1)
**Goal**: Move from "Projected Estimates" to "Real Usage Data."
- **Implementation**: Hook into the Gemini API `usageMetadata` to capture `promptTokenCount` and `candidatesTokenCount`.
- **UI**: Visual "Efficiency HUD" in the Neural View.
- **Success Criteria**: If `MemoryPromptSize` / `EquivalentHistorySize` is < 0.5, the hypothesis is confirmed.

### Experiment: Cross-Board Logic Persistence (P2)
**Goal**: Verify that switching canvases does not break the AI's "Deep Context."
- **Success Criteria**: AI can reference a node from "Welcome Workspace" while generating content for "Canvas 2" using only its Neural Memory graph.

---

## 📝 Researcher Log

> [!NOTE]
> **Observation (2026-04-06)**: User has requested this document to separate "Theory" from "Active Code." The current numbers are **projections** based on tokenization math (Prose vs. JSON). Hard validation via API usage metadata is the next logical step.
