import React, { useState, useEffect } from 'react';
import { ensureDefaultProject, useProjectNoteCounts } from './hooks/useProjects';
import Sidebar from './components/sidebar/Sidebar';
import NoteCanvas from './components/canvas/NoteCanvas';

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState(
    () => localStorage.getItem('noteflow_active_project') || 'default'
  );
  
  const noteCounts = useProjectNoteCounts();

  // Ensure default fallback exists on mount
  useEffect(() => {
    ensureDefaultProject();
  }, []);

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
