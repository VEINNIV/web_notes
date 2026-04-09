/**
 * backup.js — JSON export & import helpers
 *
 * Export: serialises all Dexie tables (including projects) into a single
 *         JSON file and triggers a browser download — no server required.
 *
 * Import: reads a JSON file chosen by the user, validates the structure,
 *         clears the existing data, and bulk-inserts the restored records.
 *         Backwards-compatible with v1 backups that lack the projects key.
 */

import db from '../db/db';

/**
 * Export all data to a downloadable JSON file.
 * Reads all four tables in parallel, then triggers a download.
 */
export async function exportBackup() {
  const [projects, notes, canvasNodes, canvasEdges] = await Promise.all([
    db.projects.toArray(),
    db.notes.toArray(),
    db.canvasNodes.toArray(),
    db.canvasEdges.toArray(),
  ]);

  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    projects,
    notes,
    canvasNodes,
    canvasEdges,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `noteflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Gather statistics about the current database for the UI.
 * @returns {Promise<{ projects: number, notes: number, words: number }>}
 */
export async function getBackupStats() {
  const [projects, notes] = await Promise.all([
    db.projects.count(),
    db.notes.toArray(),
  ]);

  const words = notes.reduce((sum, n) => {
    const text = `${n.title || ''} ${n.content || ''}`.trim();
    return sum + (text ? text.split(/\s+/).length : 0);
  }, 0);

  return { projects, notes: notes.length, words };
}

/**
 * Import data from a JSON backup file.
 * Clears the existing DB and bulk-inserts the restored data.
 * Backwards-compatible: v1 backups (no projects key) are handled gracefully.
 *
 * @param {File} file - The .json file selected by the user
 * @returns {Promise<void>}
 * @throws {Error} if the file format is invalid
 */
export async function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.notes || !data.canvasNodes || !data.canvasEdges) {
          throw new Error('Invalid backup file: missing required fields.');
        }

        await db.transaction(
          'rw',
          db.projects, db.notes, db.canvasNodes, db.canvasEdges,
          async () => {
            await Promise.all([
              db.projects.clear(),
              db.notes.clear(),
              db.canvasNodes.clear(),
              db.canvasEdges.clear(),
            ]);

            const restores = [
              db.notes.bulkAdd(data.notes),
              db.canvasNodes.bulkAdd(data.canvasNodes),
              db.canvasEdges.bulkAdd(data.canvasEdges),
            ];

            if (data.projects?.length) {
              restores.push(db.projects.bulkAdd(data.projects));
            } else {
              restores.push(db.projects.add({
                id: 'default',
                name: 'My Notes',
                emoji: '📝',
                color: '#8b5cf6',
                createdAt: new Date().toISOString(),
              }));
            }

            await Promise.all(restores);
          }
        );

        resolve();
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsText(file);
  });
}
