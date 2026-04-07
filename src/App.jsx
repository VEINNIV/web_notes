import React, { useState, useEffect } from 'react';
import { ensureDefaultProject, useProjectNoteCounts } from './hooks/useProjects';
import Sidebar from './components/sidebar/Sidebar';
import NoteCanvas from './components/canvas/NoteCanvas';
import KanbanView from './components/canvas/KanbanView';
import { Columns, Map } from 'lucide-react';

import db from './db/db';

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState(
    () => localStorage.getItem('noteflow_active_project') || 'default'
  );
  
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' or 'kanban'
  
  const noteCounts = useProjectNoteCounts();

  // Ensure default fallback exists on mount and auto-repair any orphaned nodes
  useEffect(() => {
    ensureDefaultProject();
    
    // Auto-repair script: restore lost projectIds to canvasNodes
    const repairOrphanedNodes = async () => {
      const allCanvasNodes = await db.canvasNodes.toArray();
      const orphaned = allCanvasNodes.filter(n => !n.projectId);
      if (orphaned.length > 0) {
        // Fallback to activeProjectId or 'default'
        const updates = orphaned.map(n => ({ ...n, projectId: activeProjectId || 'default' }));
        await db.canvasNodes.bulkPut(updates);
      }
    };
    repairOrphanedNodes();
  }, [activeProjectId]);

  const handleSelectProject = (id) => {
    setActiveProjectId(id);
    localStorage.setItem('noteflow_active_project', id);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar 
        activeProjectId={activeProjectId} 
        onSelectProject={handleSelectProject} 
        noteCounts={noteCounts}
      />
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* Floating View Toggle */}
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          display: 'flex', gap: 4, background: 'var(--surface)',
          padding: 6, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid var(--border)'
        }}>
          <button 
            style={{
              background: viewMode === 'canvas' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'canvas' ? '#fff' : 'var(--text-dim)',
              border: 'none', padding: '6px 12px', borderRadius: 8,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              fontWeight: 600, fontSize: 13
            }}
            onClick={() => setViewMode('canvas')}
          >
            <Map size={16} /> Canvas
          </button>
          <button 
            style={{
              background: viewMode === 'kanban' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'kanban' ? '#fff' : 'var(--text-dim)',
              border: 'none', padding: '6px 12px', borderRadius: 8,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              fontWeight: 600, fontSize: 13
            }}
            onClick={() => setViewMode('kanban')}
          >
            <Columns size={16} /> Kanban
          </button>
        </div>

        {viewMode === 'canvas' ? (
          <NoteCanvas projectId={activeProjectId} key={activeProjectId} />
        ) : (
          <KanbanView projectId={activeProjectId} key={`kb-${activeProjectId}`} />
        )}
      </main>
    </div>
  );
}
