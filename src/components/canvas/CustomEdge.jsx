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
import { getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';
import { X } from 'lucide-react';
import { deleteEdge } from '../../hooks/useNotes';
import styles from './CustomEdge.module.css';

export default function CustomEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  selected, label, data
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 16
  });

  const color = data?.color || '#8b5cf6';
  const filterId = `edge-glow-${id}`;

  return (
    <>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComponentTransfer in="blur" result="glow">
             <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer blurred glow (Active only) */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={6}
        opacity={selected ? 0.3 : 0}
        style={selected ? { filter: `url(#${filterId})` } : {}}
      />

      {/* Invisible interaction path for easy hovering */}
      <path
        d={edgePath}
        className={styles.interactionWrapper}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Main visible path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={selected || isHovered ? 2.5 : 1.5}
        opacity={selected || isHovered ? 1 : 0.6}
        className={styles.pathBase}
      />
      
      {(selected || isHovered) && (
        <EdgeLabelRenderer>
          <div
            className={styles.deleteBtn}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${label ? labelY - 24 : labelY}px)`,
              pointerEvents: 'all' // Double ensure React Flow lets us click it
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={async (e) => {
              e.stopPropagation();
              e.preventDefault();
              if (window.confirm("Are you sure you want to disconnect these notes?")) {
                 try { await deleteEdge(id); } catch(err) { console.error('Failed to delete edge', err); }
              }
            }}
          >
            <X size={14} strokeWidth={3} />
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Animated flow overlay (always visible but subtle) */}
      <path
        className={`${styles.flow} ${selected ? styles.flowSelected : ''}`}
        d={edgePath}
        fill="none"
        stroke={selected ? '#ffffff' : color}
      />

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
