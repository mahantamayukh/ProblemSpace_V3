# ProblemSpace

<div align="center">
  <img width="1200" height="475" alt="ProblemSpace Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  <p align="center">
    <strong>A high-fidelity, node-based workspace for collaborative problem-solving and AI-driven synthesis.</strong>
  </p>
</div>

---

## 🚀 Overview

**ProblemSpace** is a next-generation canvas for thinking. It moves beyond linear note-taking into a spatial, node-based environment where complex problems are mapped, connected, and synthesized. Powered by a multi-provider AI architecture (BYOK), ProblemSpace helps you transform fragmented signals into cohesive strategies.

## ✨ Key Features

- **Node-Based Synthesis**: Map out complex problem spaces using an intuitive graph interface. Connect ideas, evidence, and constraints to visualize the bigger picture.
- **AI Intelligence Hub**: Integrated with **Google Gemini** and **Anthropic Claude**. Use the "Bring Your Own Key" (BYOK) model to power your synthesis with the latest LLMs.
- **Neural Memory**: A persistent context system that tracks your line of thought across the canvas, ensuring that AI insights are always grounded in your specific project data.
- **Audience Simulator**: Test your solutions against diverse personas. Simulate feedback and anticipate challenges before they arise.
- **Sprint Management**: Structured workflows to move from problem definition to final summary, with built-in export capabilities (PDF/Image).
- **Premium Aesthetics**: A meticulously crafted UI featuring minimalist design, smooth Framer Motion animations, and a focus on visual clarity.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Graph Engine**: [XYFlow (React Flow)](https://reactflow.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **AI Integration**: [@google/genai](https://www.npmjs.com/package/@google/genai)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [Lucide React](https://lucide.dev/)
- **Graphics**: [Three.js](https://threejs.org/) (React Three Fiber)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- An API Key for [Google Gemini](https://aistudio.google.com/) or [Anthropic Claude](https://console.anthropic.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ProblemSpace.git
   cd ProblemSpace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🧠 Design Philosophy

ProblemSpace is built on the principle of **Aesthetic Minimalism**. We believe that a clean, focused workspace reduces cognitive load and allows for deeper thinking. Every interaction is designed to feel fluid and responsive, making the process of problem-solving as engaging as the solution itself.

## 📄 License

This project is licensed under the MIT License.
