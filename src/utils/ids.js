/**
 * ids.js — Unique ID generation
 *
 * Wraps nanoid to generate short, URL-safe unique IDs for notes and edges.
 * Using a fixed size of 12 gives ~17 billion IDs before a 1% collision chance.
 */

import { nanoid } from 'nanoid';

/** Generate a new unique ID (12 characters). */
export const generateId = () => nanoid(12);
