/**
 * NoteCanvas.jsx — Scoped by projectId
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useReactFlow, ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import NoteNode from '../nodes/NoteNode';
import CustomEdge from './CustomEdge';
import NoteEditor from '../editor/NoteEditor';
import Toolbar from '../toolbar/Toolbar';

import {
  useAllNotes, useCanvasNodes, useCanvasEdges,
  createNote, updateNodePositions, deleteNote,
  addEdge as dbAddEdge, deleteEdge as dbDeleteEdge, updateEdge as dbUpdateEdge,
} from '../../hooks/useNotes';
import { useOverdueReminders } from '../../hooks/useReminders';

import styles from './NoteCanvas.module.css';

const nodeTypes = { note: NoteNode };
const edgeTypes = { custom: CustomEdge };

function CanvasInner({ projectId }) {
  const { screenToFlowPosition, fitView } = useReactFlow();

  const notes = useAllNotes(projectId);
  const canvasNodes = useCanvasNodes(projectId);
  const canvasEdges = useCanvasEdges(projectId);
  const overdueIds = useOverdueReminders(projectId);

  const [openNoteId, setOpenNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const openNote = useMemo(
    () => (openNoteId ? notes?.find((n) => n.id === openNoteId) : null),
    [openNoteId, notes]
  );

  const rfNodes = useMemo(() => {
    if (!notes || !canvasNodes) return [];
    const posMap = new Map(canvasNodes.map((cn) => [cn.id, cn]));
    
    return notes
      .filter((n) => posMap.has(n.id))
      .map((note) => {
        const cn = posMap.get(note.id);
        const isMatch = !searchQuery || note.title.toLowerCase().includes(searchQuery.toLowerCase()) || note.content?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return {
          id: note.id,
          type: 'note',
          position: cn.position,
          style: {
             width: cn.width || undefined,
             height: cn.height || undefined,
             opacity: isMatch ? 1 : 0.2,
             transition: cn.width ? 'opacity 0.2s ease' : 'opacity 0.2s ease, width 0s',
          },
          data: {
            note,
            isOverdue: overdueIds.has(note.id),
            onOpen: setOpenNoteId,
            onFocus: (id) => {
              const node = posMap.get(id);
              if (node) {
                 fitView({ nodes: [{ id }], duration: 800, maxZoom: 1.5 });
              }
            }
          }
        };
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, canvasNodes, overdueIds, searchQuery]);

  const rfEdges = useMemo(() => {
    if (!canvasEdges || !notes) return [];
    const noteColors = new Map(notes.map(n => [n.id, n.color]));
    return canvasEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || '',
      type: 'custom',
      data: { color: noteColors.get(e.source) || '#8b5cf6' }
    }));
  }, [canvasEdges, notes]);

  // FitView when nodes first load for a project
  useEffect(() => {
    if (rfNodes.length > 0) {
      setTimeout(() => fitView({ padding: 0.3, maxZoom: 1, duration: 800 }), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Don't trigger 'N' if user is typing in an input/textarea
      if (e.target.tagName.match(/INPUT|TEXTAREA/i)) return;
      
      if (e.key === 'n' || e.key === 'N') {
        const id = await createNote(projectId);
        setTimeout(() => setOpenNoteId(id), 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectId]);


  const onNodesChange = useCallback(
    async (changes) => {
      // Find position and dimensions updates (triggered by NodeResizer)
      const positionChanges = changes.filter((c) => c.type === 'position' && c.position);
      const dimensionChanges = changes.filter((c) => c.type === 'dimensions' && c.dimensions);

      const updatesMap = new Map();
      const applyUpdate = (id, fields) => {
         if (!updatesMap.has(id)) updatesMap.set(id, { id });
         Object.assign(updatesMap.get(id), fields);
      };

      positionChanges.forEach(c => applyUpdate(c.id, { position: c.position }));
      dimensionChanges.forEach(c => applyUpdate(c.id, { width: c.dimensions.width, height: c.dimensions.height }));

      if (updatesMap.size > 0) {
        await updateNodePositions(Array.from(updatesMap.values()));
      }
      
      const deletions = changes.filter((c) => c.type === 'remove');
      if (deletions.length > 0) {
         if (window.confirm("Are you sure you want to delete this note from the canvas? This cannot be undone.")) {
            // Note: deleteNote must be imported from useNotes
            for (const d of deletions) {
               await deleteNote(d.id);
            }
         }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId]
  );

  const onEdgesChange = useCallback(async (changes) => {
    const deletions = changes.filter((c) => c.type === 'remove');
    if (deletions.length > 0) {
      if (window.confirm("Are you sure you want to delete this connection?")) {
        for (const d of deletions) await dbDeleteEdge(d.id);
      }
    }
  }, []);

  const onConnect = useCallback(async (connection) => {
    await dbAddEdge(connection, projectId);
  }, [projectId]);

  const onPaneDoubleClick = useCallback(async (event) => {
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const id = await createNote(projectId, position);
    setOpenNoteId(id);
  }, [screenToFlowPosition, projectId]);

  const onEdgeDoubleClick = useCallback(async (event, edge) => {
    const label = window.prompt('Edge label (leave blank to remove):', edge.label || '');
    if (label !== null) await dbUpdateEdge(edge.id, { label: label.trim() });
  }, []);

  const handleAddNote = useCallback(async () => {
    const id = await createNote(projectId);
    setOpenNoteId(id);
  }, [projectId]);

  return (
    <div
      className={styles.canvas}
      onDoubleClick={(e) => {
        if (e.target.classList.contains('react-flow__pane')) onPaneDoubleClick(e);
      }}
    >
      <Toolbar 
         onAddNote={handleAddNote} 
         onFitView={() => fitView({ padding: 0.3, maxZoom: 1, duration: 800 })}
         onSearch={setSearchQuery} 
      />

      {notes?.length === 0 && (
         <div className={styles.emptyState}>
            Double-click or press <strong>N</strong> to add your first note
         </div>
      )}

      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeDoubleClick={onEdgeDoubleClick}
        colorMode="light"
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant="dots" gap={24} size={1} color="var(--text)" style={{opacity: 0.04}} />
        <Controls />
        <MiniMap zoomable pannable 
           nodeColor={(n) => n.data?.note?.color || '#8b5cf6'} 
           maskColor="rgba(250, 248, 245, 0.7)"
        />
      </ReactFlow>

      {openNote && <NoteEditor note={openNote} onClose={() => setOpenNoteId(null)} />}
    </div>
  );
}

export default function NoteCanvas({ projectId }) {
  if (!projectId) return null;
  return (
    <ReactFlowProvider>
      <CanvasInner projectId={projectId} />
    </ReactFlowProvider>
  );
}
