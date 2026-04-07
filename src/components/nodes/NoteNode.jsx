/**
 * NoteNode.jsx — Custom React Flow node representing a single note.
 */

import React, { useCallback } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { formatDistanceToNow } from 'date-fns';
import { Settings2, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TagPill from '../ui/TagPill';
import ReminderBadge from '../ui/ReminderBadge';
import { updateNote } from '../../hooks/useNotes';
import styles from './NoteNode.module.css';

const MAX_VISIBLE_TAGS = 3;

export default function NoteNode({ data, selected }) {
  const { note, onOpen, isOverdue, onFocus } = data;
  
  const [localTitle, setLocalTitle] = React.useState(note.title || '');
  const [localContent, setLocalContent] = React.useState(note.content || '');
  const [isEditingContent, setIsEditingContent] = React.useState(false);

  React.useEffect(() => {
    setLocalTitle(note.title || '');
    setLocalContent(note.content || '');
  }, [note.title, note.content]);

  const handleBlur = React.useCallback(() => {
    if (localTitle !== (note.title || '') || localContent !== (note.content || '')) {
      updateNote(note.id, { title: localTitle.trim(), content: localContent.trim() });
    }
  }, [localTitle, localContent, note.id, note.title, note.content]);

  const checklistTotal = note.checklist?.length ?? 0;
  const checklistDone = note.checklist?.filter((i) => i.done).length ?? 0;
  const checklistPct = checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0;

  const visibleTags = note.tags?.slice(0, MAX_VISIBLE_TAGS) ?? [];
  const extraTagCount = (note.tags?.length ?? 0) - MAX_VISIBLE_TAGS;

  const timeAgo = note.updatedAt 
    ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    : 'just now';

  const handleClick = useCallback((e) => {
    if (e.target.classList.contains('react-flow__handle')) return;
  }, []);

  const handleOpenSettings = useCallback((e) => {
    e.stopPropagation();
    onOpen?.(note.id);
  }, [note.id, onOpen]);

  const handleFocus = useCallback((e) => {
    e.stopPropagation();
    onFocus?.(note.id);
  }, [note.id, onFocus]);

  return (
    <>
      <NodeResizer 
        minWidth={200} 
        minHeight={120} 
        isVisible={selected} 
        lineClassName={styles.resizeLine} 
        handleClassName={styles.resizeHandle}
      />
      <div
        className={`${styles.node} ${selected ? styles.selected : ''}`}
        style={{ '--card-accent': note.color || '#8b5cf6' }}
        onClick={handleClick}
        role="button"
      >
        <Handle type="target" position={Position.Top} className={styles.handle} />
        <Handle type="source" position={Position.Bottom} className={styles.handle} />
        <Handle type="target" position={Position.Left} className={styles.handle} />
        <Handle type="source" position={Position.Right} className={styles.handle} />

        {/* Aesthetic Highlight Tape */}
        <div className={styles.tapeHighlight} />

        <div className={styles.body}>
        <div className={styles.header}>
           <input 
             className={`${styles.titleInput} nodrag`}
             placeholder="Untitled note..."
             value={localTitle}
             onChange={e => setLocalTitle(e.target.value)}
             onBlur={handleBlur}
           />
           <div className={styles.headerActions}>
             <button className={styles.settingsBtn} onClick={handleFocus} title="Focus Mode">
               <Eye size={14} />
             </button>
             <button className={styles.settingsBtn} onClick={handleOpenSettings} title="Open details">
               <Settings2 size={14} />
             </button>
           </div>
        </div>
        
        <div className={styles.previewContainer}>
          {isEditingContent ? (
            <textarea 
              autoFocus
              className={`${styles.contentInput} nodrag`}
              placeholder="Type your notes here... (Markdown supported)"
              value={localContent}
              onChange={e => setLocalContent(e.target.value)}
              onBlur={() => { handleBlur(); setIsEditingContent(false); }}
            />
          ) : (
            <div 
              className={styles.markdownWrapper} 
              onClick={(e) => { e.stopPropagation(); setIsEditingContent(true); }}
            >
              {localContent ? (
                <ReactMarkdown>{localContent}</ReactMarkdown>
              ) : (
                <span className={styles.markdownPlaceholder}>Type your notes here...</span>
              )}
            </div>
          )}
        </div>

        {checklistTotal > 0 && (
          <div className={styles.progressRow}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${checklistPct}%` }}
              />
            </div>
            <span className={styles.progressLabel}>
              {checklistDone}/{checklistTotal}
            </span>
          </div>
        )}

        <div className={styles.metaRow}>
           <span className={styles.timeAgo}>{timeAgo}</span>
        </div>

        {(visibleTags.length > 0 || note.reminder) && (
          <div className={styles.footer}>
            <div className={styles.tags}>
              {visibleTags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
              {extraTagCount > 0 && (
                <span className={styles.extraTags}>+{extraTagCount}</span>
              )}
            </div>
            {note.reminder && (
              <ReminderBadge reminder={note.reminder} overdue={isOverdue} />
            )}
          </div>
        )}
      </div>
    </div>
  </>
  );
}
