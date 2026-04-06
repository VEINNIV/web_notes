/**
 * ReminderBadge.jsx — Reminder indicator shown on note cards.
 *
 * Overdue reminders are shown in red.
 * Upcoming reminders show the date in a muted style.
 */

import React from 'react';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import styles from './ReminderBadge.module.css';

/**
 * @param {Object}  props
 * @param {string}  props.reminder  - ISO date string
 * @param {boolean} props.overdue   - Whether the reminder has passed
 */
export default function ReminderBadge({ reminder, overdue }) {
  if (!reminder) return null;

  const date = new Date(reminder);
  const label = format(date, 'MMM d, HH:mm');

  return (
    <span className={`${styles.badge} ${overdue ? styles.overdue : ''}`}>
      <Bell size={10} strokeWidth={2} />
      {label}
    </span>
  );
}
