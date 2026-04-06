import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Sparkles, Plus, Trash2, Check } from 'lucide-react';
import { updateNote, deleteNote } from '../../hooks/useNotes';
import { generateId } from '../../utils/ids';
import TagPill from '../ui/TagPill';
import GeminiPanel from '../gemini/GeminiPanel';
import styles from './NoteEditor.module.css';

const COLOR_PRESETS = [
  '#8b5cf6', // violet
  '#ec4899', // rose
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#3b82f6', // sky
  '#10b981', // emerald
];

export default function NoteEditor({ note, onClose }) {
  const [showGemini, setShowGemini] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, [note?.id]);

  const persist = useCallback(
    (field, value) => updateNote(note.id, { [field]: value }),
    [note.id]
  );

  const handleDelete = useCallback(async () => {
    if (window.confirm('Delete this note? This cannot be undone.')) {
      onClose();
      await deleteNote(note.id);
    }
  }, [note.id, onClose]);

  const addChecklistItem = useCallback(() => {
    const newItem = { id: generateId(), text: '', done: false };
    persist('checklist', [...(note.checklist || []), newItem]);
  }, [note.checklist, persist]);

  const toggleChecklistItem = useCallback((itemId) => {
    const updated = note.checklist.map((i) => i.id === itemId ? { ...i, done: !i.done } : i);
    persist('checklist', updated);
  }, [note.checklist, persist]);

  const updateChecklistText = useCallback((itemId, text) => {
    const updated = note.checklist.map((i) => i.id === itemId ? { ...i, text } : i);
    persist('checklist', updated);
  }, [note.checklist, persist]);

  const removeChecklistItem = useCallback((itemId) => {
    persist('checklist', note.checklist.filter((i) => i.id !== itemId));
  }, [note.checklist, persist]);

  const handleTagKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/,$/, '');
      if (trimmed && !note.tags?.includes(trimmed)) persist('tags', [...(note.tags || []), trimmed]);
      setTagInput('');
    }
  }, [tagInput, note.tags, persist]);

  const removeTag = useCallback((tag) => persist('tags', note.tags.filter((t) => t !== tag)), [note.tags, persist]);

  if (!note) return null;

  return (
    <aside className={styles.panel} aria-label="Note editor">
      <div className={styles.header}>
        <input
          ref={titleRef}
          className={styles.titleInput}
          placeholder="Note title…"
          value={note.title}
          onChange={(e) => persist('title', e.target.value)}
        />
        <div className={styles.headerActions}>
          <button
            className={`${styles.iconBtn} ${showGemini ? styles.iconBtnActive : ''}`}
            onClick={() => setShowGemini((v) => !v)}
            title="Open AI assistant"
          >
            <Sparkles size={16} />
          </button>
          <button className={styles.iconBtn} onClick={onClose} title="Close editor">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className={styles.colorRow}>
        <span className={styles.label}>Color</span>
        <div className={styles.colorPicker}>
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              className={`${styles.colorSwatch} ${note.color === color ? styles.colorActive : ''}`}
              style={{ '--swatch': color }}
              onClick={() => persist('color', color)}
            />
          ))}
        </div>
      </div>

      <div className={styles.scroll}>
        {showGemini && <GeminiPanel note={note} onClose={() => setShowGemini(false)} />}

        <section className={styles.section}>
          <label className={styles.label}>Notes</label>
          <textarea
            className={styles.textarea}
            placeholder="Write anything…"
            value={note.content}
            onChange={(e) => persist('content', e.target.value)}
            rows={6}
          />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>Checklist</span>
            <button className={styles.addBtn} onClick={addChecklistItem}>
              <Plus size={13} /> Add item
            </button>
          </div>
          {note.checklist?.length > 0 && (
            <ul className={styles.checklist}>
              {note.checklist.map((item) => (
                <li key={item.id} className={styles.checklistItem}>
                  <button
                    className={`${styles.checkbox} ${item.done ? styles.checkboxDone : ''}`}
                    onClick={() => toggleChecklistItem(item.id)}
                  >
                    {item.done && <Check size={10} strokeWidth={3} />}
                  </button>
                  <input
                    className={`${styles.checkInput} ${item.done ? styles.checkInputDone : ''}`}
                    value={item.text}
                    placeholder="Item text…"
                    onChange={(e) => updateChecklistText(item.id, e.target.value)}
                  />
                  <button className={styles.itemDeleteBtn} onClick={() => removeChecklistItem(item.id)}>
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.section}>
          <label className={styles.label}>Tags</label>
          <div className={styles.tagRow}>
            {note.tags?.map((tag) => <TagPill key={tag} tag={tag} onRemove={removeTag} />)}
          </div>
          <input
            className={styles.inputField}
            placeholder="Add tag, press Enter…"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </section>

        <section className={styles.section}>
          <label className={styles.label}>Reminder</label>
          <input
            type="datetime-local"
            className={styles.inputField}
            value={note.reminder ? note.reminder.slice(0, 16) : ''}
            onChange={(e) => persist('reminder', e.target.value ? new Date(e.target.value).toISOString() : null)}
          />
          {note.reminder && (
            <button className={styles.clearBtn} onClick={() => persist('reminder', null)}>
              Clear reminder
            </button>
          )}
        </section>
        
        <div className={styles.footerActions}>
           <button className={styles.deleteNoteBtn} onClick={handleDelete}>
             <Trash2 size={14} /> Delete Note
           </button>
        </div>
      </div>
    </aside>
  );
}
