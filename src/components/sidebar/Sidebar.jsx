/**
 * Sidebar.jsx — Project navigation panel.
 */

import React, { useState } from 'react';
import { Plus, Folder, Settings, MoreVertical } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAllProjects, createProject } from '../../hooks/useProjects';

export default function Sidebar({ activeProjectId, onSelectProject, noteCounts }) {
  const projects = useAllProjects();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) { setAdding(false); return; }
    
    // Pick a random emoji to be fun
    const emojis = ['🚀', '🧠', '💼', '🎨', '📝', '✨', '⚡️', '🌍'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const id = await createProject(newName, randomEmoji);
    setNewName('');
    setAdding(false);
    onSelectProject(id);
  };

  if (!projects) return <aside className={styles.sidebar}></aside>;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}></div>
          <span>NoteFlow</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>PROJECTS</span>
          <button className={styles.addButton} onClick={() => setAdding(true)} title="New Project">
            <Plus size={14} />
          </button>
        </div>

        <ul className={styles.projectList}>
          {projects.map(proj => {
            const count = noteCounts?.get(proj.id) || 0;
            const isActive = proj.id === activeProjectId;
            
            return (
              <li key={proj.id}>
                <button 
                  className={`${styles.projectBtn} ${isActive ? styles.active : ''}`}
                  onClick={() => onSelectProject(proj.id)}
                >
                  <span className={styles.icon}>{proj.emoji}</span>
                  <span className={styles.name}>{proj.name}</span>
                  <span className={styles.count}>{count}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {adding && (
          <form className={styles.addForm} onSubmit={handleCreate}>
            <input
              autoFocus
              type="text"
              placeholder="Project name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => { if (!newName.trim()) setAdding(false); }}
            />
          </form>
        )}
      </div>
      
      <div className={styles.footer}>
        <div className={styles.userSection}>
           <div className={styles.avatar}>A</div>
           <span>Workspace</span>
        </div>
      </div>
    </aside>
  );
}
