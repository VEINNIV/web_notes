/**
 * TagPill.jsx — Reusable coloured tag badge
 *
 * Displays a tag name with a subtle background tinted by the tag's hash.
 * Optional `onRemove` prop adds an × button (used in the editor).
 */

import React, { useMemo } from 'react';
import styles from './TagPill.module.css';

/** Deterministic HSL colour from a string — ensures tags always look the same. */
function tagColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 65%)`;
}

/**
 * @param {Object} props
 * @param {string}   props.tag       - The tag text
 * @param {Function} [props.onRemove] - If provided, shows an × button
 * @param {Function} [props.onClick]  - Click handler (e.g. filter by tag)
 */
export default function TagPill({ tag, onRemove, onClick }) {
  const color = useMemo(() => tagColor(tag), [tag]);

  return (
    <span
      className={styles.pill}
      style={{ '--tag-color': color }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {tag}
      {onRemove && (
        <button
          className={styles.remove}
          onClick={(e) => { e.stopPropagation(); onRemove(tag); }}
          aria-label={`Remove tag ${tag}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
