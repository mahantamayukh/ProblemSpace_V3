# UI / UX Recommendations for ProblemSpace

ProblemSpace has a modern, brutalist/high-contrast aesthetic. To make this feel like a premium, enterprise-grade design tool, the UX needs to be polished, specifically around canvas interactions and panel management.

## 1. Canvas Interaction & Tooling UX
- **Recommendation:** Currently, adding nodes relies on AI chats or double-clicking, and auto-layout takes over aggressively. You should add a **Floating Toolbar** (similar to Miro or FigJam) at the bottom or left of the canvas. This toolbar should allow users to explicitly drag-and-drop specific node types (`Problem`, `Insight`, `Journey Step`) onto exact locations on the board.
- **Why:** This shifts control back to the user when they want to manually construct diagrams without chatting.

## 2. Contextual / Inline Editing menus
- **Recommendation:** When a user clicks a node or an edge, a large side panel slides out, shifting the central canvas and moving the user's visual focus away from the graph. Implement **Contextual Floating Menus** directly above the selected node/edge context instead. Let users double-click to edit text directly inline on the canvas.
- **Why:** Reduces eye-travel horizontally across the screen and feels much more like a native canvas application. Keep the side panel for AI chat only.

## 3. Responsive Chat Panels & Layout
- **Recommendation:** The left chat panel is fixed width (`lg:w-[400px]`). On smaller screens or crowded laptops, users might want more space for the board. Add a drag-handle to resize the sidebar, or a simple collapse button to hide it completely when they are purely focused on moving nodes around.
- **Why:** Gives power users control over their screen real estate.

## 4. Accessibility and Color Enhancements
- **Recommendation:** The brutally high-contrast borders are a stylistic choice, but some node colors in `colorVariants` against a white/dark background may fail WCAG contrast thresholds (e.g., yellow background with white text). Ensure text inside colored nodes always contrast-checks dynamically based on the background color. Additionally, support keyboard focus states natively on canvas interactive elements.
- **Why:** Usability in professional settings requires standard accessibility compliance.

## 5. Mini-map and Navigation Overhaul
- **Recommendation:** The React Flow MiniMap is currently always visible. Add the ability to toggle it. Furthermore, add a "Zoom to Fit" button or shortcut (like `Shift + 1` in Figma) explicitly visible in the UI rather than hiding it behind double-clicks or panels. Add panning cursors (hand icon) when holding the Spacebar.
- **Why:** These are industry standard navigation patterns for infinite canvas tools that users will expect intuitively.

## 6. Onboarding and Guided Tours
- **Recommendation:** When a user lands and clicks "Start Process," they are thrown immediately into a blank board. Implement a quick overlay tour (e.g., using `driver.js`) highlighting the Framework selector, the Chat box, and how to manipulate the board.
- **Why:** Greatly reduces the learning curve and "blank canvas anxiety" for first-time users.
