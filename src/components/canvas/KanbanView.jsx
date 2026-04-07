import React, { useState } from 'react';
import { useAllNotes, updateNote } from '../../hooks/useNotes';
import { Plus } from 'lucide-react';
import styles from './KanbanView.module.css';
import NoteEditor from '../editor/NoteEditor';
import TagPill from '../ui/TagPill';

const COLUMNS = [
  { id: 'To Do', label: 'To Do', color: '#8b5cf6' },
  { id: 'In Progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'Done', label: 'Done', color: '#10b981' }
];

export default function KanbanView({ projectId }) {
  const notes = useAllNotes(projectId) || [];
  const [openNoteId, setOpenNoteId] = useState(null);

  const openNote = openNoteId ? notes.find(n => n.id === openNoteId) : null;

  const handleStatusChange = (note, newStatus) => {
    updateNote(note.id, { status: newStatus });
  };

  return (
    <div className={styles.kanbanContainer}>
      {COLUMNS.map(col => {
        // Assume missing status means 'To Do'
        const columnNotes = notes.filter(n => (n.status || 'To Do') === col.id);
        
        return (
          <div key={col.id} className={styles.column}>
            <div className={styles.colHeader} style={{ borderColor: col.color }}>
               <h3 className={styles.colTitle}>{col.label}</h3>
               <span className={styles.colCount}>{columnNotes.length}</span>
            </div>
            
            <div className={styles.colBody}>
              {columnNotes.map(note => (
                <div key={note.id} className={styles.card} onClick={() => setOpenNoteId(note.id)} style={{ '--card-accent': note.color || '#8b5cf6'}}>
                   <div className={styles.cardHighlight} />
                   <h4 className={styles.cardTitle}>{note.title || 'Untitled note'}</h4>
                   <p className={styles.cardPreview}>{note.content || '...'}</p>
                   {note.tags?.length > 0 && (
                     <div className={styles.tags}>
                        {note.tags.map(t => <TagPill key={t} tag={t} />)}
                     </div>
                   )}
                   <div className={styles.statusSelectWrapper} onClick={e => e.stopPropagation()}>
                     <select 
                       className={styles.statusSelect}
                       value={col.id} 
                       onChange={e => handleStatusChange(note, e.target.value)}
                     >
                       {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                     </select>
                   </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {openNote && <NoteEditor note={openNote} onClose={() => setOpenNoteId(null)} />}
    </div>
  );
}
