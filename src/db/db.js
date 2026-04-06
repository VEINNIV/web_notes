/**
 * db.js — IndexedDB schema via Dexie.js
 *
 * v1 → original schema
 * v2 → adds Projects table; adds projectId to all tables;
 *       migration moves existing data to a "default" project.
 */

import Dexie from 'dexie';

const db = new Dexie('NoteFlowDB');

// ── Version 1 (kept for migration baseline) ───────────────────────────────
db.version(1).stores({
  notes:       'id, createdAt, updatedAt',
  canvasNodes: 'id',
  canvasEdges: 'id, source, target',
});

// ── Version 2 — Projects ──────────────────────────────────────────────────
db.version(2).stores({
  projects:    'id, createdAt',
  notes:       'id, projectId, createdAt, updatedAt',
  canvasNodes: 'id, projectId',
  canvasEdges: 'id, projectId, source, target',
}).upgrade(async (tx) => {
  // Create the default project that existing notes will belong to
  await tx.table('projects').add({
    id:        'default',
    name:      'My Notes',
    emoji:     '📝',
    color:     '#8b5cf6',
    createdAt: new Date().toISOString(),
  });

  // Assign all existing records to the default project
  await tx.table('notes').toCollection().modify({ projectId: 'default' });
  await tx.table('canvasNodes').toCollection().modify({ projectId: 'default' });
  await tx.table('canvasEdges').toCollection().modify({ projectId: 'default' });
});

export default db;
