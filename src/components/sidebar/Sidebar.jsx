import React, { useState } from 'react';
import { Plus, GripVertical, MoreVertical, Edit2, Trash2, ArrowUpToLine, Folder, FileText } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import styles from './Sidebar.module.css';
import { useAllProjects, createProject, updateProject, deleteProject } from '../../hooks/useProjects';
import { useNotification } from '../../hooks/useNotification';

function SortableProjectItem({ proj, count, isActive, onSelectProject, onUpdate, onDelete, onPinToTop }) {
  const [showMenu, setShowMenu] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: proj.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: showMenu ? 50 : (isDragging ? 40 : 0),
    opacity: isDragging ? 0.7 : 1,
  };

  const handleRename = (e) => {
    e.stopPropagation();
    const newName = prompt('New project name:', proj.name);
    if (newName && newName.trim()) {
      onUpdate(proj.id, { name: newName.trim() });
    }
    setShowMenu(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    const check = prompt(`Type "I'm sure" to delete project "${proj.name}"`);
    if (check === "I'm sure") {
      onDelete(proj.id);
    } else if (check !== null) {
      alert("Validation failed. Project not deleted.");
    }
    setShowMenu(false);
  };

  const handleTogglePin = (e) => {
    e.stopPropagation();
    onPinToTop(proj.id, !proj.pinned);
    setShowMenu(false);
  };

  return (
    <>
      {proj.isFirstPinned && <div className={styles.sectionHeader}>PINNED</div>}
      {proj.isFirstUnpinned && <div className={styles.sectionHeader} style={{marginTop: '16px'}}>PROJECTS</div>}
      <li ref={setNodeRef} style={style} className={styles.projectItemWrapper}>
      <button 
        className={`${styles.projectBtn} ${isActive ? styles.active : ''}`}
        onClick={() => onSelectProject(proj.id)}
      >
        <div {...attributes} {...listeners} className={styles.dragHandle}>
          <GripVertical size={14} className={styles.dragIcon} />
        </div>
        <span className={styles.icon}><Folder size={14} color="var(--accent)" /></span>
        <span className={styles.name}>{proj.name}</span>
        {proj.pinned && <ArrowUpToLine size={12} className={styles.pinnedIcon} style={{marginRight: 4, color: 'var(--accent)'}} />}
        <span className={styles.count}>{count}</span>
        
        <div className={styles.menuWrapper}>
          <div 
             className={styles.menuTrigger} 
             onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
          >
            <MoreVertical size={14} />
          </div>
          
          {showMenu && (
            <div className={styles.contextMenu}>
              <div className={styles.contextOverlay} onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className={styles.contextMenuInner}>
                <div onClick={handleTogglePin} className={styles.contextMenuItem}>
                   <ArrowUpToLine size={14} /> {proj.pinned ? 'Unpin' : 'Pin to top'}
                </div>
                <div onClick={handleRename} className={styles.contextMenuItem}>
                   <Edit2 size={14} /> Rename
                </div>
                <div onClick={handleDelete} className={`${styles.contextMenuItem} ${styles.dangerText}`}>
                   <Trash2 size={14} /> Delete
                </div>
              </div>
            </div>
          )}
        </div>
      </button>
    </li>
    </>
  );
}

export default function Sidebar({ activeProjectId, onSelectProject, noteCounts }) {
  const projects = useAllProjects();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const addToast = useNotification();
  
  const [localOrder, setLocalOrder] = useState(null);

  const localProjects = React.useMemo(() => {
    const source = localOrder || projects || [];
    return [...source].sort((a, b) => {
      if (a.pinned === b.pinned) return (a.order || 0) - (b.order || 0);
      return a.pinned ? -1 : 1;
    });
  }, [projects, localOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = localProjects.findIndex(p => p.id === active.id);
      const newIndex = localProjects.findIndex(p => p.id === over.id);
      
      const newOrder = arrayMove(localProjects, oldIndex, newIndex);
      setLocalOrder(newOrder);
      
      // Persist new ordering and potential pin-state change to DB
      newOrder.forEach((proj, idx) => {
        // If it was dragged above/below boundaries, just save the order
        // Updating pinned automatically based on drag boundary is complex, so we just update order for now.
        updateProject(proj.id, { order: idx });
      });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) { setAdding(false); return; }
    
    const randomEmoji = '📁';
    
    try {
      const id = await createProject(newName, randomEmoji);
      // Give the new project an order at the very end
      await updateProject(id, { order: localProjects.length });
      setNewName('');
      setAdding(false);
      onSelectProject(id);
      addToast('Project created', 'success');
    } catch {
      addToast('Failed to create project', 'error');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const isSure = window.confirm(
      "Are you absolutely sure you want to delete this project? All associated notes and mind maps will be permanently lost."
    );
    if (!isSure) return;
    
    try {
      await deleteProject(id);
      addToast('Project deleted', 'success');
      if (activeProjectId === id) {
         onSelectProject('default');
      }
    } catch {
      addToast('Failed to delete project', 'error');
    }
  };

  const handleUpdate = async (id, changes) => {
    try {
      await updateProject(id, changes);
    } catch {
      addToast('Update failed', 'error');
    }
  };

  const handlePinToTop = async (id, isPinned) => {
    try {
      await updateProject(id, { pinned: isPinned });
      addToast(isPinned ? 'Project pinned to top' : 'Project unpinned', 'success');
    } catch {
      addToast('Pin failed', 'error');
    }
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
        <div style={{display:'flex', justifyContent:'space-between', padding:'8px 12px', marginTop: 8}}>
          <button className={styles.addButton} onClick={() => setAdding(true)} title="New Project" style={{marginLeft:'auto'}}>
            <Plus size={14} />
          </button>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <ul className={styles.projectList}>
            <SortableContext 
              items={localProjects.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {localProjects.map((proj, idx) => {
                const isFirstPinned = proj.pinned && (idx === 0 || !localProjects[idx - 1].pinned);
                const isFirstUnpinned = !proj.pinned && (idx === 0 || localProjects[idx - 1].pinned);
                const enrichedProj = { ...proj, isFirstPinned, isFirstUnpinned };
                
                return (
                  <SortableProjectItem 
                    key={proj.id} 
                    proj={enrichedProj} 
                    count={noteCounts?.get(proj.id) || 0}
                    isActive={proj.id === activeProjectId}
                    onSelectProject={onSelectProject}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onPinToTop={handlePinToTop}
                  />
                )
              })}
            </SortableContext>
          </ul>
        </DndContext>

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
        <div className={styles.statsRow}>
          <span className={styles.statItem}>
            <Folder size={12} /> {localProjects.length} projects
          </span>
          <span className={styles.statItem}>
            <FileText size={12} /> {Array.from(noteCounts?.values() || []).reduce((a, b) => a + b, 0)} notes
          </span>
        </div>
      </div>
    </aside>
  );
}
