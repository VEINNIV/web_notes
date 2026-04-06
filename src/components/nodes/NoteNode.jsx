/**
 * NoteNode.jsx — Custom React Flow node representing a single note.
 */

import React, { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { formatDistanceToNow } from 'date-fns';
import { FileEdit } from 'lucide-react';
import TagPill from '../ui/TagPill';
import ReminderBadge from '../ui/ReminderBadge';
import styles from './NoteNode.module.css';

const MAX_VISIBLE_TAGS = 3;

export default function NoteNode({ data, selected }) {
  const { note, onOpen, isOverdue } = data;

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
    onOpen?.(note.id);
  }, [note.id, onOpen]);

  return (
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

      <div className={styles.accent} />

      <div className={styles.body}>
        <div className={styles.header}>
           <p className={`${styles.title} ${!note.title ? styles.placeholder : ''}`}>
             {note.title || 'Untitled note'}
           </p>
           {note.content && <FileEdit className={styles.editIcon} size={14} />}
        </div>
        
        {note.content && (
          <p className={styles.preview}>
            {note.content.split('\n')[0].slice(0, 70)}
            {note.content.length > 70 ? '...' : ''}
          </p>
        )}

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
  );
}
