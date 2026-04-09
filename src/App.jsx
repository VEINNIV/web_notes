import React, { useState, useEffect, useCallback } from 'react';
import { ensureDefaultProject, useProjectNoteCounts } from './hooks/useProjects';
import Sidebar from './components/sidebar/Sidebar';
import NoteCanvas from './components/canvas/NoteCanvas';
import KanbanView from './components/canvas/KanbanView';
import KeyboardShortcutsModal from './components/ui/KeyboardShortcutsModal';
import { Columns, Map, Sun, Moon, Keyboard } from 'lucide-react';
import { useTheme } from './hooks/useTheme';

import db from './db/db';

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState(
    () => localStorage.getItem('noteflow_active_project') || 'default'
  );
  
  const [viewMode, setViewMode] = useState('canvas');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const noteCounts = useProjectNoteCounts();

  useEffect(() => {
    ensureDefaultProject();
    
    const repairOrphanedNodes = async () => {
      const allCanvasNodes = await db.canvasNodes.toArray();
      const orphaned = allCanvasNodes.filter(n => !n.projectId);
      if (orphaned.length > 0) {
        const updates = orphaned.map(n => ({ ...n, projectId: activeProjectId || 'default' }));
        await db.canvasNodes.bulkPut(updates);
      }
    };
    repairOrphanedNodes();
  }, [activeProjectId]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName.match(/INPUT|TEXTAREA|SELECT/i)) return;
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcuts(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSelectProject = useCallback((id) => {
    setActiveProjectId(id);
    localStorage.setItem('noteflow_active_project', id);
  }, []);

  const fabBtnStyle = (isActive) => ({
    background: isActive ? 'var(--accent)' : 'transparent',
    color: isActive ? '#fff' : 'var(--text-dim)',
    border: 'none', padding: '6px 12px', borderRadius: 8,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
    fontWeight: 600, fontSize: 13,
    transition: 'all 120ms cubic-bezier(0.16,1,0.3,1)',
  });

  const utilBtnStyle = {
    background: 'transparent', border: 'none', color: 'var(--text-dim)',
    cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    transition: 'all 120ms cubic-bezier(0.16,1,0.3,1)',
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar 
        activeProjectId={activeProjectId} 
        onSelectProject={handleSelectProject} 
        noteCounts={noteCounts}
      />
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* Bottom floating controls */}
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          display: 'flex', gap: 4, background: 'var(--surface)',
          padding: 6, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid var(--border)', alignItems: 'center',
        }}>
          <button style={fabBtnStyle(viewMode === 'canvas')} onClick={() => setViewMode('canvas')}
            aria-label="Canvas view" title="Canvas view">
            <Map size={16} /> Canvas
          </button>
          <button style={fabBtnStyle(viewMode === 'kanban')} onClick={() => setViewMode('kanban')}
            aria-label="Kanban view" title="Kanban view">
            <Columns size={16} /> Kanban
          </button>
          
          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
          
          <button style={utilBtnStyle} onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button style={utilBtnStyle} onClick={() => setShowShortcuts(true)}
            aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)">
            <Keyboard size={16} />
          </button>
        </div>

        {viewMode === 'canvas' ? (
          <NoteCanvas projectId={activeProjectId} key={activeProjectId} />
        ) : (
          <KanbanView projectId={activeProjectId} key={`kb-${activeProjectId}`} />
        )}
      </main>

      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
