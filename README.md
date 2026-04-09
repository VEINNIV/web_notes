<div align="center">

# NoteFlow

### A Visual, Offline-First Knowledge Workspace

*Infinite canvas mind mapping meets structured project management — powered by AI.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-8b5cf6?style=for-the-badge&logo=vercel&logoColor=white)](https://web-notes-drab.vercel.app/)

![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB-green?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-Ready-f59e0b?style=flat-square)

</div>

---

## Overview

NoteFlow is an open-source personal knowledge management system designed for thinkers, researchers, and students. It combines an infinite canvas for spatial note organization with a structured Kanban workflow — all running entirely in your browser with zero cloud dependency.

### Why NoteFlow?

- **No account required** — works instantly, data stays in your browser
- **Zero latency** — IndexedDB means no network calls, ever
- **Visual thinking** — arrange, connect, and navigate notes spatially
- **AI-enhanced** — optional Gemini integration for summarization, quizzing, and expansion
- **Dark mode** — beautiful light and dark themes with system preference detection

---

## Features

### Infinite Canvas

An expansive, dot-grid canvas powered by React Flow for limitless spatial organization. Create notes by double-clicking anywhere, connect ideas with animated edges, and zoom in with cinematic focus transitions.

- Drag-and-drop note positioning with snap-to-grid
- Resizable note cards with live markdown preview
- Animated custom edges with glow effects that inherit note colors
- Mini-map and zoom controls for navigation
- Focus mode — zoom into any note with a single click

### Kanban Board

Toggle between spatial Canvas view and a structured Kanban board. Notes automatically categorize into **To Do**, **In Progress**, and **Done** columns based on their status field.

### Rich Note Editor

Each note supports:
- **Markdown content** with live preview
- **Checklists** with progress tracking
- **Tags** with deterministic color generation
- **Reminders** with overdue detection
- **Color coding** with 6 accent presets

### AI Assistant (Gemini)

Optional Google Gemini integration provides three AI modes:
- **Summarize** — condenses a note into concise bullet points
- **Quiz Me** — generates study questions from your notes
- **Expand** — adds relevant context and detail

> API key is stored locally in `localStorage` — never sent to any server except Google's Gemini API.

### Project Workspaces

Organize your notes into isolated project workspaces:
- Each project has its own canvas, notes, and connections
- Drag-and-drop project reordering in the sidebar
- Pin important projects to the top
- Per-project note counts

### Dark & Light Themes

Beautiful warm editorial design system with full dark mode support. Automatically detects system preference with manual toggle override.

### Data Ownership

- **Offline-first** — all data stored in IndexedDB via Dexie.js
- **Full backup** — export/import all projects, notes, and canvas layout as JSON
- **No telemetry** — zero tracking, zero analytics
- **PWA-ready** — installable as a standalone app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **UI Framework** | [React 19](https://react.dev/) |
| **Build Tool** | [Vite 8](https://vite.dev/) |
| **Canvas Engine** | [React Flow (@xyflow/react)](https://reactflow.dev/) |
| **Database** | [Dexie.js](https://dexie.org/) (IndexedDB) |
| **Drag & Drop** | [@dnd-kit](https://dndkit.com/) |
| **AI Integration** | [Google Gemini](https://ai.google.dev/) (optional) |
| **Markdown** | [React-Markdown](https://github.com/remarkjs/react-markdown) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Styling** | CSS Modules + Custom Design Tokens |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/noteflow.git
cd noteflow

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

### Gemini AI Setup (Optional)

1. Get a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Open the app → click the **Settings** gear icon in the toolbar
3. Paste your API key and click **Save**

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React 19 + Vite 8                   │
├──────────┬──────────┬───────────┬──────────┬────────────┤
│ Sidebar  │  Canvas  │  Kanban   │  Editor  │   Toolbar  │
│ Projects │ ReactFlow│  Columns  │ Markdown │  Search    │
│ DnD-kit  │  Nodes   │  Status   │ Checklist│  Backup    │
│          │  Edges   │           │  Tags    │  Settings  │
├──────────┴──────────┴───────────┴──────────┴────────────┤
│              Hooks: useNotes, useProjects, useTheme     │
├─────────────────────────────────────────────────────────┤
│         Dexie.js — IndexedDB (NoteFlowDB)               │
│    Tables: projects | notes | canvasNodes | canvasEdges  │
└─────────────────────────────────────────────────────────┘
         ↕ (optional)
   Google Gemini API (summarize / quiz / expand)
```

---

## Project Structure

```
src/
├── components/
│   ├── canvas/         # NoteCanvas, KanbanView, CustomEdge
│   ├── editor/         # NoteEditor panel (markdown, checklist, tags)
│   ├── gemini/         # AI assistant panel
│   ├── nodes/          # Custom React Flow note node
│   ├── sidebar/        # Project navigation with DnD
│   ├── toolbar/        # Top toolbar (search, backup, settings)
│   └── ui/             # ErrorBoundary, Notifications, TagPill, etc.
├── db/                 # Dexie schema with versioned migrations
├── hooks/              # useNotes, useProjects, useTheme, useReminders
├── services/           # Gemini API integration
├── styles/             # Global CSS design system (light + dark tokens)
└── utils/              # ID generation, backup/restore helpers
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | Create a new note |
| `Double-click` | Create note at cursor position |
| `?` | Show keyboard shortcuts |
| `Delete` | Remove selected node/edge |
| `Esc` | Close editor or modal |
| `Ctrl+Z` | Undo |

---

## Design Philosophy

NoteFlow follows the **"Minimalist Archivist"** aesthetic:

1. **Warm Editorial Palette** — cream whites and soft violets in light mode; deep charcoal tones in dark mode
2. **Spatial Hierarchy** — depth through layered shadows and subtle borders, not visual noise
3. **Tactile Feedback** — micro-animations on every interaction (hover, focus, drag)
4. **Typography First** — Inter font family with carefully tuned sizes and weights
5. **Accessibility** — focus-visible outlines, ARIA labels, reduced-motion support

---

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on the development workflow, coding standards, and pull request process.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with React, IndexedDB, and a love for visual thinking.**

</div>
