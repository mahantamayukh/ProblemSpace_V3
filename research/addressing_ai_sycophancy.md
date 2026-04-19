# Addressing AI Sycophancy: Building Authentic Personas

This document outlines the technical strategy used in ProblemSpace to mitigate **AI Sycophancy**—the tendency of AI models to agree with user biases to be "helpful"—within the **Audience Simulator**.

## 🛑 The Core Problem
In standard AI roleplays, the model often defaults to a "Helpful Assistant" persona. This causes:
- **Confirmation Bias**: The AI validates every idea the user pitches.
- **False Positives**: The user believes they've found a "Product-Market Fit" that doesn't exist in reality.
- **Investor Deception**: The simulator becomes a "Yes-Man" tool for pitch decks rather than a rigorous discovery engine.

---

## 🛠️ The Technical Solution: "Critical Authenticity"

We've injected a layer of behavioral friction into the `generatePersonaResponse` architecture to force realism over helpfulness.

### 1. The Anti-Sycophancy Directive
We have explicitly instructed the AI that **agreement is NOT the goal**. 
- **Rule**: If a value proposition is weak, the persona must respond with **Indifference**, **Confusion**, or **Constructive Criticism**.
- **Impact**: The user is forced to refine their idea until it genuinely resonates with a skeptical human.

### 2. Status Quo Bias (Behavioral Friction)
Most real-world failure happens because users simply **don't want to change**.
- **Rule**: The persona is mandated to defend their current habits.
- **Mandate**: *"Convince me why I should switch from what I use now."*
- **Impact**: This forces the user to find a "10x better" solution rather than an "incremental" one.

### 3. The "Hard Interview" Constraint
We have reframed the interaction from a "Chat" to a **"Stress Test."**
- **Rule**: No "Investor Fluff."
- **Focus**: The persona is protective of its **Time** and **Money**.
- **Impact**: If the project doesn't solve a visceral pain point, the AI will say "No."

---

## 🔬 How this benefits the Discovery Process

By turning the Audience Simulator into a "Grumpy Skeptic," we provide **High-Accuracy Discovery**:

| Component | Standard AI Persona | ProblemSpace Authentic Persona |
| :--- | :--- | :--- |
| **User Bias** | Supported & Validated | **Challenged & Stress-Tested** |
| **Response Style** | Polite / Helpful | **Skeptical / Realistic** |
| **Discovery Value** | Low (Confirmation) | **High (Friction Detection)** |
| **Failing Fast** | No (Encourages growth) | **Yes (Catches bad ideas early)** |

> [!IMPORTANT]
> **Conclusion**: The "Neural Logic" of the Audience Simulator is now a filter for **Signal**, not a generator of **Noise**. If your problem survives an interview in ProblemSpace, it is a genuine indicator of a real-world opportunity.
