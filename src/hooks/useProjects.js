/**
 * useProjects.js — CRUD and live queries for the Projects table.
 *
 * Each project is an isolated workspace with its own set of notes,
 * canvas positions, and edges. Switching projects shows a completely
 * different canvas.
 */

import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import { generateId } from '../utils/ids';

/** Returns all projects sorted by creation date (oldest first). */
export function useAllProjects() {
  return useLiveQuery(
    () => db.projects.orderBy('createdAt').toArray(),
    [],
    []
  );
}

/** Returns note counts per project as a Map<projectId, count>. */
export function useProjectNoteCounts() {
  return useLiveQuery(async () => {
    const notes = await db.notes.toArray();
    const counts = new Map();
    for (const n of notes) {
      counts.set(n.projectId, (counts.get(n.projectId) || 0) + 1);
    }
    return counts;
  }, [], new Map());
}

/**
 * Create a new project.
 * @param {string} name  - Project display name
 * @param {string} emoji - Single emoji identifier
 * @returns {Promise<string>} New project ID
 */
export async function createProject(name, emoji = '📁') {
  const id = generateId();
  await db.projects.add({
    id,
    name: name.trim() || 'New Project',
    emoji,
    color: '#8b5cf6',
    createdAt: new Date().toISOString(),
  });
  return id;
}

/**
 * Rename or change the emoji of a project.
 * @param {string} id
 * @param {{ name?: string, emoji?: string }} changes
 */
export async function updateProject(id, changes) {
  await db.projects.update(id, changes);
}

/**
 * Delete a project and all associated data (notes, positions, edges).
 * @param {string} id
 */
export async function deleteProject(id) {
  await db.transaction('rw', db.projects, db.notes, db.canvasNodes, db.canvasEdges, async () => {
    await db.projects.delete(id);
    await db.notes.where('projectId').equals(id).delete();
    await db.canvasNodes.where('projectId').equals(id).delete();
    await db.canvasEdges.where('projectId').equals(id).delete();
  });
}

/**
 * Ensure the default project exists (runs once on app start).
 * If the DB was freshly created (no migration), we create it manually.
 */
export async function ensureDefaultProject() {
  const count = await db.projects.count();
  if (count === 0) {
    await db.projects.add({
      id:        'default',
      name:      'My Notes',
      emoji:     '📝',
      color:     '#8b5cf6',
      createdAt: new Date().toISOString(),
    });
  }
}
