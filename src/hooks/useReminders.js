/**
 * useReminders.js — Derives overdue reminder IDs from live note data.
 */

import { useMemo } from 'react';
import { useAllNotes } from './useNotes';

export function useOverdueReminders(projectId) {
  const notes = useAllNotes(projectId);
  const now   = new Date();

  return useMemo(() => {
    const overdueIds = new Set();
    if (!notes) return overdueIds;
    for (const note of notes) {
      if (note.reminder && new Date(note.reminder) < now) overdueIds.add(note.id);
    }
    return overdueIds;
  }, [notes]);
}
