/**
 * useNotes.js — Note + canvas CRUD with project scoping.
 *
 * All read operations are filtered by `projectId` so each project
 * has a completely independent canvas. Smart grid positioning ensures
 * new notes don't stack on top of each other.
 */

import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import { generateId } from '../utils/ids';

// ─── READ (live, project-scoped) ─────────────────────────────────────────────

export function useAllNotes(projectId) {
  return useLiveQuery(
    async () => {
      if (!projectId) return [];
      const notes = await db.notes.where('projectId').equals(projectId).toArray();
      return notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    [projectId],
    []
  );
}

export function useCanvasNodes(projectId) {
  return useLiveQuery(
    () => projectId ? db.canvasNodes.where('projectId').equals(projectId).toArray() : [],
    [projectId],
    []
  );
}

export function useCanvasEdges(projectId) {
  return useLiveQuery(
    () => projectId ? db.canvasEdges.where('projectId').equals(projectId).toArray() : [],
    [projectId],
    []
  );
}

// ─── SMART POSITIONING ────────────────────────────────────────────────────────

/**
 * Returns a clean grid position for the next new note in a project.
 * Arranges notes in rows of 3, each 300×220px apart, with slight jitter
 * so they don't appear perfectly mechanical.
 *
 * @param {string} projectId
 * @param {{ x: number, y: number } | null} clickPosition - If provided, use click position
 */
export async function getNextPosition(projectId, clickPosition = null) {
  if (clickPosition) return clickPosition;

  const nodes = await db.canvasNodes.where('projectId').equals(projectId).toArray();
  const count = nodes.length;
  const cols  = 3;
  const col   = count % cols;
  const row   = Math.floor(count / cols);
  const jitter = () => (Math.random() - 0.5) * 16;

  return {
    x: col * 300 + 60 + jitter(),
    y: row * 220 + 60 + jitter(),
  };
}

// ─── NOTE CRUD ────────────────────────────────────────────────────────────────

/**
 * Create a new note and its canvas node in the given project.
 *
 * @param {string} projectId
 * @param {{ x: number, y: number } | null} position - null = auto grid placement
 * @returns {Promise<string>} New note ID
 */
export async function createNote(projectId, position = null) {
  const id  = generateId();
  const now = new Date().toISOString();
  const pos = await getNextPosition(projectId, position);

  await db.notes.add({
    id, projectId,
    title: '', content: '',
    checklist: [], tags: [],
    reminder: null,
    color: '#8b5cf6',
    createdAt: now, updatedAt: now,
  });

  await db.canvasNodes.add({ id, projectId, position: pos, type: 'note' });

  return id;
}

export async function updateNote(id, changes) {
  await db.notes.update(id, { ...changes, updatedAt: new Date().toISOString() });
}

/**
 * Delete a note, its canvas position, and all connected edges.
 * Only called explicitly from the editor (no keyboard shortcut).
 */
export async function deleteNote(id) {
  await db.transaction('rw', db.notes, db.canvasNodes, db.canvasEdges, async () => {
    await db.notes.delete(id);
    await db.canvasNodes.delete(id);
    await db.canvasEdges.where('source').equals(id).delete();
    await db.canvasEdges.where('target').equals(id).delete();
  });
}

// ─── CANVAS POSITION ─────────────────────────────────────────────────────────

export async function updateNodePositions(nodeUpdates) {
  await db.canvasNodes.bulkPut(nodeUpdates);
}

// ─── EDGE CRUD ────────────────────────────────────────────────────────────────

export async function addEdge(params, projectId) {
  const id = generateId();
  await db.canvasEdges.add({
    id, projectId,
    source:       params.source,
    target:       params.target,
    sourceHandle: params.sourceHandle || null,
    targetHandle: params.targetHandle || null,
    label:        '',
  });
  return id;
}

export async function updateEdge(id, changes) {
  await db.canvasEdges.update(id, changes);
}

export async function deleteEdge(id) {
  await db.canvasEdges.delete(id);
}
