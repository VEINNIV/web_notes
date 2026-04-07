# NoteFlow — Premium Knowledge Workspace

NoteFlow is a sophisticated, open-source personal knowledge management system designed for thinkers, researchers, and students. Built with an editorial aesthetic and a focus on visual hierarchy, it seamlessly bridges the gap between structured project management and fluid zihin haritası (mind mapping).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)
![IndexedDB](https://img.shields.io/badge/Database-IndexedDB%20(Dexie)-green)

## ✨ Features

### 🧠 Modern Mind Mapping (Canvas)
*   **Infinite Canvas:** An expansive, dot-grid canvas powered by `@xyflow/react` for limitless brainstorming.
*   **Aesthetic Connectors:** Dynamic, smooth-step edges that inherit source note colors and feature "flow" animations.
*   **Inline Editing:** Edit note titles and content directly on the canvas without opening a single sidebar.
*   **Focus Mode:** Instantly zoom into a specific node with a smooth, cinematic transition to eliminate distractions.

### 📋 Hybrid Kanban View
*   **Automatic Synchronization:** Toggle between a spatial Canvas view and a structured Kanban board.
*   **Progress Tracking:** Notes are automatically categorized into *To Do*, *In Progress*, and *Done* columns based on their status.

### 📝 Editorial Writing Experience
*   **Markdown Support:** Write beautiful notes using standard Markdown syntax (bold, lists, links) with instant preview on blur.
*   **Glassmorphic UI:** A premium "Editorial Notebook" design system utilizing advanced CSS `backdrop-filter` and `color-mix` functions.
*   **Smart Sidebars:** Manage project-specific tags, checklists, and reminders within a blurred glass floating panel.

### 🛡️ Safety & Productivity
*   **Offline-First:** All data is stored locally in your browser using **Dexie.js (IndexedDB)**. No cloud, no lag, total privacy.
*   **Safe Deletion:** Multi-layered confirmation dialogs prevent accidental data loss for projects, nodes, and connections.
*   **Project Management:** Organize workspaces with isolated projects, drag-and-drop reordering, and priority pinning.

## 🚀 Tech Stack

- **Core:** React 19 + Vite
- **Canvas Engine:** [React Flow (@xyflow/react)](https://reactflow.dev/)
- **State & Storage:** [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Drag & Drop:** [@dnd-kit](https://dndkit.com/)
- **Icons:** [Lucide-React](https://lucide.dev/)
- **Markdown:** React-Markdown
- **Styling:** Vanilla CSS (Advanced Design System)

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/noteflow.git
   cd noteflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🎨 Design Philosophy

NoteFlow follows the **"Minimalist Archivist"** aesthetic. It prioritizes:
1. **Legibility:** Clean Inter/Outfit typography.
2. **Tactile Feedback:** Subtle hover effects and micro-animations.
3. **Depth:** Layered glassmorphism to show hierarchy without clutter.

---

Designed for the modern web. License: MIT.
