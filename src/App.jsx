import React, { useState, useEffect } from 'react';
import { ensureDefaultProject, useProjectNoteCounts } from './hooks/useProjects';
import Sidebar from './components/sidebar/Sidebar';
import NoteCanvas from './components/canvas/NoteCanvas';

import db from './db/db';

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState(
    () => localStorage.getItem('noteflow_active_project') || 'default'
  );
  
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
      <main style={{ flex: 1, position: 'relative' }}>
        <NoteCanvas projectId={activeProjectId} key={activeProjectId} />
      </main>
    </div>
  );
}
