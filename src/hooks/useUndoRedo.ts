import { useCallback, useEffect, useState } from 'react';
import { Edge, Node } from '@xyflow/react';

interface UseUndoRedoOptions {
  maxHistorySize: number;
}

type HistoryItem = {
  nodes: Node[];
  edges: Edge[];
};

export function useUndoRedo(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void,
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void,
  options: UseUndoRedoOptions = { maxHistorySize: 50 }
) {
  const [past, setPast] = useState<HistoryItem[]>([]);
  const [future, setFuture] = useState<HistoryItem[]>([]);

  // We need to prevent recording state changes that were triggered by undo/redo themselves
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);

  const takeSnapshot = useCallback(() => {
    // Save current state into past
    setPast((p) => {
      const newPast = [...p, { nodes: [...nodes], edges: [...edges] }];
      if (newPast.length > options.maxHistorySize) {
        return newPast.slice(newPast.length - options.maxHistorySize);
      }
      return newPast;
    });
    // Clear future
    setFuture([]);
  }, [nodes, edges, options.maxHistorySize]);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    setIsUndoRedoAction(true);
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, p.length - 1));
    setFuture((f) => [{ nodes: [...nodes], edges: [...edges] }, ...f]);

    setNodes(previous.nodes);
    setEdges(previous.edges);

    // Reset lock after react finishes rendering
    setTimeout(() => setIsUndoRedoAction(false), 50);
  }, [past, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    setIsUndoRedoAction(true);
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, { nodes: [...nodes], edges: [...edges] }]);

    setNodes(next.nodes);
    setEdges(next.edges);

    setTimeout(() => setIsUndoRedoAction(false), 50);
  }, [future, nodes, edges, setNodes, setEdges]);

  // Hook into keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        if (event.shiftKey) {
          event.preventDefault();
          redo();
        } else {
          event.preventDefault();
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    takeSnapshot,
    isUndoRedoAction
  };
}
