# Refactoring and Improvements for Existing Features

The current implementation of ProblemSpace is functional, but there are several architectural and functional areas that need immediate improvement to ensure scalability and a bug-free experience.

## 1. Board State Persistence
- **Current State:** The `useSprintState` hook saves the sprint workflow metadata to `localStorage`, but the actual nodes and edges on the React Flow board are lost if the user refreshes the page.
- **Improvement:** Implement a unified state synchronization where `boardItems` (nodes and edges) are persisting to `localStorage` alongside the sprint phase. When the app loads, it should hydrate the `Board` component with the saved nodes.

## 2. Global State Management Refactoring
- **Current State:** `App.tsx` has grown to over 600 lines, managing chat history, node focus, edge focus, framer-motion UI state, and Gemini API calls all in one massive monolithic component.
- **Improvement:** Adopt a state management library like **Zustand** or **Redux Toolkit**, or strictly organize state into separate contexts (e.g., `ChatContext`, `BoardContext`, `UIContext`). Extract the side panels (Node Focus, Edge Focus) into separate component files.

## 3. Context Window Management for AI
- **Current State:** Every message adds to the `history` array passed to Gemini. In a long session, this will quickly exceed token limits or become excessively expensive, causing API crashes.
- **Improvement:** Implement sliding window context management. Retain the system instruction and the most recent N turns, or implement a background routine that periodically asks the LLM to summarize older conversation history into a condensed "session summary" string.

## 4. Layout Engine Optimization
- **Current State:** The Dagre layout (`getLayoutedElements` in `Board.tsx`) runs automatically on new items. However, standard horizontal/vertical trees don't always look good for complex iterative loops (like journey mapping where things circle back).
- **Improvement:** Upgrade to [elkjs](https://github.com/kieler/elkjs) which provides much more powerful and customizable layout algorithms specifically designed for complex graphs, or allow users to "lock" node positions to prevent the auto-layout from ruining their manual organizations.

## 5. Error Handling and Resilience
- **Current State:** If Gemini fails, a generic "Sorry, I encountered an error" message is injected into the chat. Network interruptions or token limits aren't handled gracefully.
- **Improvement:** Add proper UI toast notifications (e.g., using `sonner` or `react-hot-toast`). Catch specific error types (e.g., API key missing, rate limits) and provide actionable feedback. Add a "Regenerate Response" button for failed AI calls.

## 6. AI Output Sanitization
- **Current State:** The AI is instructed via prompt engineering to return JSON structures for `addBoardItems`. Occasionally, LLMs hallucinate the JSON structure or wrap it in unexpected markdown block syntax.
- **Improvement:** Ensure you are using "Structured Outputs" / "JSON Mode" strictly through the Gemini API config so the format is strictly typed and guaranteed, reducing frontend parsing crashes.
