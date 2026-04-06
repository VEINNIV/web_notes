/**
 * CustomEdge.jsx — Beautiful bezier connection between notes.
 *
 * Uses a gradient stroke that fades from the accent color at the source
 * to a softer hue at the target. On hover/select, the path gets a
 * smooth animated dash-flow effect.
 *
 * Double-click to set a label.
 */

import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import styles from './CustomEdge.module.css';

export default function CustomEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  selected, label, markerEnd,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      {/* Glow layer (thicker, blurred by CSS filter) */}
      <path
        className={`${styles.glow} ${selected ? styles.glowSelected : ''}`}
        d={edgePath}
        fill="none"
      />

      {/* Main visible path */}
      <path
        id={id}
        className={`${styles.path} ${selected ? styles.pathSelected : ''}`}
        d={edgePath}
        fill="none"
        markerEnd={markerEnd}
      />

      {/* Animated flow overlay (visible on select) */}
      {selected && (
        <path
          className={styles.flow}
          d={edgePath}
          fill="none"
        />
      )}

      {/* Edge label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            className={styles.label}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
