/**
 * backup.js — JSON export & import helpers
 *
 * Export: serialises all Dexie tables into a single JSON file and triggers
 *         a browser download — no server required.
 *
 * Import: reads a JSON file chosen by the user, validates the structure,
 *         clears the existing data, and bulk-inserts the restored records.
 *
 * The backup format is:
 * {
 *   version: 1,
 *   exportedAt: "<ISO datetime>",
 *   notes: [...],
 *   canvasNodes: [...],
 *   canvasEdges: [...]
 * }
 */

import db from '../db/db';

/**
 * Export all data to a downloadable JSON file.
 * Reads all three tables in parallel, then triggers a <a> click.
 */
export async function exportBackup() {
  const [notes, canvasNodes, canvasEdges] = await Promise.all([
    db.notes.toArray(),
    db.canvasNodes.toArray(),
    db.canvasEdges.toArray(),
  ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
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
 * Import data from a JSON backup file.
 * Clears the existing DB and bulk-inserts the restored data.
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

        // Basic validation — ensure the expected keys exist
        if (!data.notes || !data.canvasNodes || !data.canvasEdges) {
          throw new Error('Invalid backup file: missing required fields.');
        }

        // Wipe existing data, then bulk-insert restored data — all in one transaction
        await db.transaction('rw', db.notes, db.canvasNodes, db.canvasEdges, async () => {
          await Promise.all([
            db.notes.clear(),
            db.canvasNodes.clear(),
            db.canvasEdges.clear(),
          ]);
          await Promise.all([
            db.notes.bulkAdd(data.notes),
            db.canvasNodes.bulkAdd(data.canvasNodes),
            db.canvasEdges.bulkAdd(data.canvasEdges),
          ]);
        });

        resolve();
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsText(file);
  });
}
