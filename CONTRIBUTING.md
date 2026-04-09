# Contributing to NoteFlow

Thank you for considering contributing to NoteFlow! This document provides guidelines and instructions.

## Development Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/<your-username>/noteflow.git
   cd noteflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Lint your code**
   ```bash
   npm run lint
   ```

## Project Structure

```
src/
├── components/
│   ├── canvas/       # NoteCanvas, KanbanView, CustomEdge
│   ├── editor/       # NoteEditor panel
│   ├── gemini/       # AI assistant panel
│   ├── nodes/        # Custom React Flow node types
│   ├── sidebar/      # Project navigation sidebar
│   ├── toolbar/      # Top toolbar with search & settings
│   └── ui/           # Shared UI components (TagPill, ErrorBoundary, etc.)
├── db/               # Dexie (IndexedDB) schema & migrations
├── hooks/            # React hooks (useNotes, useProjects, useTheme, etc.)
├── services/         # External API integrations (Gemini)
├── styles/           # Global CSS design tokens
└── utils/            # Helpers (IDs, backup)
```

## Guidelines

### Code Style

- **No TypeScript** — the project uses plain JavaScript with JSDoc comments
- **CSS Modules** — each component has a co-located `.module.css` file
- **Design tokens** — use CSS custom properties from `global.css` instead of hardcoding colors/sizes
- **Functional components** — prefer React hooks over class components

### Commits

- Use clear, descriptive commit messages
- Reference issue numbers where applicable
- Keep commits atomic — one logical change per commit

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes with clear commits
3. Ensure `npm run lint` passes
4. Ensure `npm run build` succeeds
5. Open a PR with a clear description of changes

### What We're Looking For

- Bug fixes with clear reproduction steps
- Performance improvements
- Accessibility enhancements
- New features that align with the project vision (offline-first, visual, minimal)
- Documentation improvements

### What to Avoid

- Adding heavy runtime dependencies without discussion
- Breaking changes to the IndexedDB schema without migration
- Removing offline-first capability

## Reporting Issues

- Use GitHub Issues
- Include browser version, OS, and steps to reproduce
- Screenshots are helpful for UI issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
