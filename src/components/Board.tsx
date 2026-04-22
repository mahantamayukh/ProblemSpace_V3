import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  NodeResizer,
  ConnectionMode,
} from '@xyflow/react';
import { Network, Plus, FileText, Download, BoxSelect, Image as ImageIcon, Trash2, LayoutGrid, Undo2, Redo2, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '@xyflow/react/dist/style.css';
import { nodeTypes, ALL_NODE_TYPES, NODE_TYPE_LABELS } from './nodes/CustomNodes';
import dagre from 'dagre';
import { toPng, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import { useUndoRedo } from '../hooks/useUndoRedo';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 280;
const nodeHeight = 200;

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 150, // More horizontal space between nodes
    ranksep: 200, // More vertical space between layers
    marginx: 50,
    marginy: 50
  });

  nodes.forEach((node) => {
    // We use a slightly larger box for layout to ensure no overlaps
    dagreGraph.setNode(node.id, { width: nodeWidth + 40, height: nodeHeight + 40 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  const layoutedEdges = edges.map((edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return edge;

    const sourcePos = dagreGraph.node(edge.source);
    const targetPos = dagreGraph.node(edge.target);

    let sourceHandle = 's-bottom';
    let targetHandle = 't-top';

    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal relationship
      if (dx > 0) {
        sourceHandle = 's-right';
        targetHandle = 't-left';
      } else {
        sourceHandle = 's-left';
        targetHandle = 't-right';
      }
    } else {
      // Vertical relationship
      if (dy > 0) {
        sourceHandle = 's-bottom';
        targetHandle = 't-top';
      } else {
        sourceHandle = 's-top';
        targetHandle = 't-bottom';
      }
    }

    return {
      ...edge,
      sourceHandle,
      targetHandle
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

function BoardInner({ 
  newItems, 
  restoreState, 
  updatedNodes, 
  clearUpdatedNodes,
  updatedEdge, 
  clearUpdatedEdge,
  deletedNodeId, 
  deletedEdgeId, 
  onNodeClick, 
  onEdgeClick, 
  onEdgeConnect, 
  isDarkMode, 
  onSnapshot, 
  onShowSummary, 
  isNeuralView 
}: { 
  newItems: any, 
  restoreState?: { nodes: any[], edges: any[] }, 
  updatedNodes?: any[], 
  clearUpdatedNodes?: () => void,
  updatedEdge?: any, 
  clearUpdatedEdge?: () => void,
  deletedNodeId?: string, 
  deletedEdgeId?: string, 
  onNodeClick?: (node: any) => void, 
  onEdgeClick?: (edge: any) => void, 
  onEdgeConnect?: (connection: any) => void, 
  isDarkMode?: boolean, 
  onSnapshot?: (nodes: any[], edges: any[]) => void, 
  onShowSummary?: () => void, 
  isNeuralView?: boolean,
  universalApiKey?: string
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  const { undo, redo, canUndo, canRedo, takeSnapshot } = useUndoRedo(nodes, edges, setNodes as any, setEdges as any);

  // Local UI State
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle full state restore
  useEffect(() => {
    if (restoreState) {
      setNodes(restoreState.nodes || []);
      setEdges(restoreState.edges || []);
      setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
    }
  }, [restoreState, setNodes, setEdges, fitView]);

  // Emit snapshot when nodes or edges change - now handled explicitly by actions to avoid drag-lag
  const syncSnapshot = useCallback((nds: any[], eds: any[]) => {
    onSnapshot?.(nds, eds);
  }, [onSnapshot]);

  const onConnect = useCallback(
    (params: any) => {
      setEdges((eds) => {
        const targetId = `e-${params.source}-${params.target}`;
        if (eds.some(e => e.id === targetId || (e.source === params.source && e.target === params.target))) {
          return eds;
        }
        const nextEds = addEdge({ ...params, id: targetId, animated: true, interactionWidth: 40, data: { customColor: null }, style: { stroke: isDarkMode ? '#94a3b8' : '#cbd5e1', strokeWidth: 3 } }, eds);
        syncSnapshot(nodes, nextEds);
        if (onEdgeConnect) {
           setTimeout(() => onEdgeConnect(params), 0);
        }
        return nextEds;
      });
    },
    [setEdges, isDarkMode, syncSnapshot, nodes, onEdgeConnect],
  );

  useEffect(() => {
    if (deletedNodeId) {
      setNodes((nds) => nds.filter(n => n.id !== deletedNodeId));
      setEdges((eds) => eds.filter(e => e.source !== deletedNodeId && e.target !== deletedNodeId));
    }
  }, [deletedNodeId, setNodes, setEdges]);

  useEffect(() => {
    if (deletedEdgeId) {
      setEdges((eds) => eds.filter(e => e.id !== deletedEdgeId));
    }
  }, [deletedEdgeId, setEdges]);

  useEffect(() => {
    if (updatedNodes && updatedNodes.length > 0) {
      setNodes((nds) => {
        let nextNodes = [...nds];
        updatedNodes.forEach(update => {
          nextNodes = nextNodes.map(n => n.id === update.id ? { ...n, type: update.type || n.type, data: { ...n.data, ...update.data } } : n);
        });
        return nextNodes;
      });
      // Cleanup to prevent stale re-processing
      if (clearUpdatedNodes) {
        setTimeout(clearUpdatedNodes, 0);
      }
    }
  }, [updatedNodes, setNodes, clearUpdatedNodes]);

  useEffect(() => {
    if (updatedEdge) {
      setEdges((eds) => eds.map(e => {
        if (e.id === updatedEdge.id) {
          const newColor = updatedEdge.data.color !== undefined ? updatedEdge.data.color : e.data?.customColor;
          const newThickness = updatedEdge.data.thickness !== undefined ? updatedEdge.data.thickness : (e.data?.thickness || 3);
          const newDashed = updatedEdge.data.dashed !== undefined ? updatedEdge.data.dashed : (e.data?.dashed || false);
          return {
            ...e,
            label: updatedEdge.data.label !== undefined ? updatedEdge.data.label : e.label,
            type: updatedEdge.data.type !== undefined ? updatedEdge.data.type : e.type,
            animated: updatedEdge.data.animated !== undefined ? updatedEdge.data.animated : e.animated,
            interactionWidth: 40,
            data: { ...e.data, customColor: newColor, thickness: newThickness, dashed: newDashed },
            style: {
              ...e.style,
              stroke: newColor || (isDarkMode ? '#94a3b8' : '#cbd5e1'),
              strokeWidth: newThickness,
              strokeDasharray: newDashed ? '5,5' : 'none'
            }
          };
        }
        return e;
      }));
      // Cleanup
      if (clearUpdatedEdge) {
        setTimeout(clearUpdatedEdge, 0);
      }
    }
  }, [updatedEdge, setEdges, isDarkMode, clearUpdatedEdge]);

  // Context Menu Global Listeners
  useEffect(() => {
    const handleNodeDeleteAction = (e: any) => {
      takeSnapshot();
      const { id } = e.detail;
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    };

    const handleNodeDuplicateAction = (e: any) => {
      takeSnapshot();
      const { id } = e.detail;
      setNodes((nds) => {
        const originalNode = nds.find((n) => n.id === id);
        if (!originalNode) return nds;
        const newNode = {
          ...originalNode,
          id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          position: { x: originalNode.position.x + 40, y: originalNode.position.y + 40 },
          selected: false,
        };
        return [...nds, newNode];
      });
    };

    const handleNodeDataUpdate = () => {
      takeSnapshot();
    };

    window.addEventListener('node-delete-action', handleNodeDeleteAction);
    window.addEventListener('node-duplicate-action', handleNodeDuplicateAction);
    window.addEventListener('node-data-update', handleNodeDataUpdate);
    return () => {
      window.removeEventListener('node-delete-action', handleNodeDeleteAction);
      window.removeEventListener('node-duplicate-action', handleNodeDuplicateAction);
      window.removeEventListener('node-data-update', handleNodeDataUpdate);
    };
  }, [setNodes, setEdges, takeSnapshot]);

  useEffect(() => {
    if (!newItems) return;

    // We need the absolute latest nodes/edges to perform a layout
    // But since setNodes/setEdges is async, we combine them locally first
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    
    const existingIds = new Set(currentNodes.map(n => n.id));
    const addedNodes = (newItems.nodes || [])
      .filter((n: any) => !existingIds.has(n.id))
      .map((n: any) => ({
        id: n.id,
        type: n.type,
        position: { x: 0, y: 0 },
        data: { label: n.label, details: n.details }
      }));

    if (addedNodes.length === 0 && (!newItems.edges || newItems.edges.length === 0)) return;

    const existingEdgeIds = new Set(currentEdges.map(e => `${e.source}-${e.target}`));
    const addedEdges = (newItems.edges || [])
      .filter((e: any) => !existingEdgeIds.has(`${e.source}-${e.target}`))
      .map((e: any) => ({
        id: `e-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'default',
        animated: true,
        interactionWidth: 40,
        data: { customColor: null, thickness: 3, dashed: false },
        style: { stroke: isDarkMode ? '#94a3b8' : '#cbd5e1', strokeWidth: 3, strokeDasharray: 'none' }
      }));

    const finalNodes = [...currentNodes, ...addedNodes];
    const finalEdges = [...currentEdges, ...addedEdges];

    // Perform layout on the combined set
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      finalNodes,
      finalEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 100);

  }, [newItems, setNodes, setEdges, isDarkMode, fitView, getNodes, getEdges]);

  // Update existing edges when dark mode changes
  useEffect(() => {
    setEdges((eds) => eds.map(e => ({
      ...e,
      style: {
        ...e.style,
        stroke: e.data?.customColor || (isDarkMode ? '#94a3b8' : '#cbd5e1'),
        strokeWidth: e.data?.thickness || 3,
        strokeDasharray: e.data?.dashed ? '5,5' : 'none'
      }
    })));
  }, [isDarkMode, setEdges]);

  const handleAddSpecificNode = useCallback((type: string, presetLabel?: string) => {
    takeSnapshot();
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const newNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      position,
      data: { label: presetLabel || NODE_TYPE_LABELS[type] || 'New Node', details: 'Click to edit' },
    };
    setNodes((nds) => nds.concat(newNode));
    setShowNodePalette(false);
  }, [screenToFlowPosition, setNodes, takeSnapshot]);

  const handleSpawnEmpathyMap = useCallback(() => {
    takeSnapshot();
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const mapId = `empathy-map-${Date.now()}`;

    const newNodes = [
      { id: mapId, type: 'empathy-map-framework', position: { x: center.x - 400, y: center.y - 400 }, data: { title: 'User Persona Empathy Map' }, style: { width: 800, height: 800 } },

      // Inside sticky notes (Relative parent coordinates!)
      // SAYS (Top Left quadrant: 100x100)
      { id: `node-${Date.now()}-1`, type: 'empathy-says', position: { x: 50, y: 150 }, data: { label: '"I wish this was faster"', details: 'Direct user quote' }, parentId: mapId, extent: 'parent' },
      // THINKS (Top Right quadrant: 450x150)
      { id: `node-${Date.now()}-2`, type: 'empathy-thinks', position: { x: 450, y: 150 }, data: { label: 'Why is this so confusing?', details: 'Unspoken thought' }, parentId: mapId, extent: 'parent' },
      // DOES (Bottom Left quadrant: 50x550)
      { id: `node-${Date.now()}-3`, type: 'empathy-does', position: { x: 50, y: 550 }, data: { label: 'Refreshes page often', details: 'Observed behavior' }, parentId: mapId, extent: 'parent' },
      // FEELS (Bottom Right quadrant: 450x550)
      { id: `node-${Date.now()}-4`, type: 'empathy-feels', position: { x: 450, y: 550 }, data: { label: 'Frustrated / Impatient', details: 'Core emotion' }, parentId: mapId, extent: 'parent' }
    ];

    setNodes((nds) => [...nds, ...newNodes as any]);
    setShowNodePalette(false);
  }, [screenToFlowPosition, setNodes, takeSnapshot]);

  const handleClearBoard = useCallback(() => {
    if (window.confirm("Are you sure you want to clear the entire board?")) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const handleAddNode = useCallback(() => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const newNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'sticky',
      position,
      data: { label: 'New Note', details: 'Click to edit' },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, setNodes]);

  const handleAddGroup = useCallback(() => {
    takeSnapshot();
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const newGroup = {
      id: `group-${Date.now()}`,
      type: 'custom-group',
      position,
      style: { width: 500, height: 400 },
      data: { label: 'New Group Zone' },
      zIndex: -1,
      dragHandle: '.group-drag-handle',
    };
    setNodes((nds) => [{ ...newGroup }, ...nds]);
  }, [screenToFlowPosition, setNodes, isDarkMode]);

  const handleAutoLayout = useCallback(() => {
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          currentNodes,
          currentEdges
        );
        return layoutedEdges;
      });
      return getLayoutedElements(currentNodes, edges).nodes;
    });
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 50);
  }, [setNodes, setEdges, edges, fitView]);

  const handleExport = useCallback(async (format: 'png' | 'svg' | 'pdf') => {
    setShowExportMenu(false); // Close menu immediately
    const element = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!element) return;

    const currentNodes = getNodes();
    if (!currentNodes.length) {
      alert("Canvas is empty. Nothing to export.");
      setShowExportMenu(false);
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    currentNodes.forEach(n => {
      const x = n.position.x;
      const y = n.position.y;
      const w = (n.style?.width as number) || (n.measured?.width || 300);
      const h = (n.style?.height as number) || (n.measured?.height || 300);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    const padding = 100;
    const width = (maxX - minX) + padding * 2;
    const height = (maxY - minY) + padding * 2;

    const originalTransform = element.style.transform;
    element.style.transform = `translate(${-minX + padding}px, ${-minY + padding}px) scale(1)`;

    const options = {
      backgroundColor: isDarkMode ? '#1e1e1e' : '#FAF9F6',
      width,
      height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${-minX + padding}px, ${-minY + padding}px) scale(1)`,
      },
      filter: (node: HTMLElement) => {
        if (node?.classList && (
          node.classList.contains('react-flow__panel') ||
          node.classList.contains('react-flow__controls') ||
          node.classList.contains('react-flow__minimap')
        )) {
          return false;
        }
        return true;
      }
    };

    const downloadFile = (dataUrl: string, suffix: string) => {
      const a = document.createElement('a');
      a.download = `problemspace-board-${new Date().toISOString().slice(0, 10)}.${suffix}`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    try {
      if (format === 'svg') {
        const dataUrl = await toSvg(element, options);
        downloadFile(dataUrl, 'svg');
      } else {
        const dataUrl = await toPng(element, { ...options, pixelRatio: 2 });
        if (format === 'png') {
          downloadFile(dataUrl, 'png');
        } else if (format === 'pdf') {
          const pdf = new jsPDF({
            orientation: width > height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [width, height]
          });
          pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
          pdf.save(`problemspace-board-${new Date().toISOString().slice(0, 10)}.pdf`);
        }
      }
      setNotification({ message: `Successfully exported as ${format.toUpperCase()}`, type: 'success' });
    } catch (err) {
      console.error('Failed to export', err);
      setNotification({ message: 'Export failed. Check console for details.', type: 'error' });
    } finally {
      element.style.transform = originalTransform;
      setShowExportMenu(false);
    }
  }, [isDarkMode, getNodes]);

  const onPaneDoubleClick = useCallback((event: React.MouseEvent) => {
    takeSnapshot();
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'sticky',
      position,
      data: { label: '', details: '' },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, setNodes, takeSnapshot]);

  return (
    <div
      className={`w-full h-full transition-colors relative overflow-hidden ${isNeuralView ? 'bg-neutral-950' : 'bg-[var(--color-cream)]'}`}
      onDoubleClick={onPaneDoubleClick}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`absolute top-24 left-1/2 z-[200] px-4 py-2 rounded-xl shadow-lg border text-xs font-bold tracking-tight flex items-center gap-2 backdrop-blur-md
              ${notification.type === 'success' 
                ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                : 'bg-red-500/90 border-red-400 text-white'}`}
          >
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      {isNeuralView && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {/* Scanning line effect */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-sky-400/30 blur-sm animate-scan" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(14,165,233,0.05)_100%)]" />
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={() => {
          takeSnapshot();
          syncSnapshot(nodes, edges);
        }}
        onNodeClick={(_, node) => onNodeClick?.(node)}
        onEdgeClick={(_, edge) => onEdgeClick?.(edge)}
        onPaneClick={() => onNodeClick?.(null)}
        onPaneContextMenu={(e) => e.preventDefault()}
        onPaneScroll={(e) => e.preventDefault()}
        onSelectionChange={(params) => {
          if (params.nodes.length === 0) onNodeClick?.(null);
        }}
        zoomOnDoubleClick={false}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        snapToGrid={false}
        snapGrid={[20, 20]}
        fitView
        nodesDraggable={true}
        nodesConnectable={!isNeuralView}
        elementsSelectable={true}
        minZoom={0.05}
        maxZoom={4}
      >
        {isNeuralView && (
          <Panel position="top-right" className="m-6">
            <div className="bg-sky-500/10 backdrop-blur-xl border border-sky-400/30 p-4 rounded-xl shadow-lg flex flex-col gap-1 max-w-[300px]">
              <div className="flex items-center gap-2 text-sky-400">
                <Network className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider">Neural Memory</span>
              </div>
              <p className="text-[10px] text-sky-200/80 font-medium leading-relaxed mt-1">
                This graph stores my high-fidelity understanding of your problem space, preferences, and structural logic. It is optimized for token-efficient long-term context retention.
              </p>
            </div>
          </Panel>
        )}

        <Panel position="bottom-center" className="mb-6 z-50">
          <div className="flex items-center gap-1 p-1.5 bg-[var(--color-cream)] backdrop-blur-xl border border-[var(--color-border)] rounded-full shadow-lg">

            <div className="flex items-center">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2.5 text-[var(--color-ink-muted)] hover:text-blue-500 hover:bg-[var(--color-cream-warm)] disabled:opacity-30 disabled:hover:bg-transparent rounded-l-full transition-all"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-[var(--color-border)] opacity-50" />
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2.5 text-[var(--color-ink-muted)] hover:text-blue-500 hover:bg-[var(--color-cream-warm)] disabled:opacity-30 disabled:hover:bg-transparent rounded-r-full transition-all mr-1"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-5 bg-[var(--color-border)] opacity-50 mx-1" />

            {onShowSummary && (
              <div className="relative group flex">
                <button
                  onClick={() => onShowSummary()}
                  className="p-2.5 text-[var(--color-ink-muted)] hover:text-blue-500 hover:bg-[var(--color-cream-warm)] rounded-full transition-all"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all px-2.5 py-1 bg-[var(--color-ink)] text-[var(--color-cream)] text-[10px] font-medium tracking-wide rounded-lg pointer-events-none whitespace-nowrap origin-bottom opacity-0 group-hover:opacity-100 shadow-sm">
                  Process Summary
                </div>
              </div>
            )}

            <div className="relative flex">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2.5 text-[var(--color-ink-muted)] hover:text-purple-500 hover:bg-[var(--color-cream-warm)] rounded-full transition-all peer group"
              >
                <Download className="w-4 h-4" />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all px-2.5 py-1 bg-[var(--color-ink)] text-[var(--color-cream)] text-[10px] font-medium tracking-wide rounded-lg pointer-events-none whitespace-nowrap origin-bottom opacity-0 group-hover:opacity-100 shadow-sm">
                  Export Options
                </div>
              </button>

              {showExportMenu && (
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-48 bg-[var(--color-cream)] border border-[var(--color-border)] rounded-xl shadow-lg py-2 z-[100] flex flex-col focus:outline-none overflow-hidden">
                  <button onClick={() => handleExport('png')} className="px-4 py-2 text-xs font-medium text-left hover:bg-[var(--color-cream-warm)] hover:text-purple-600 transition-colors pointer-events-auto flex items-center justify-between">
                    Export PNG <span className="opacity-50 text-[10px]">Image</span>
                  </button>
                  <button onClick={() => handleExport('svg')} className="px-4 py-2 text-xs font-medium text-left hover:bg-[var(--color-cream-warm)] hover:text-orange-600 transition-colors pointer-events-auto flex items-center justify-between">
                    Export SVG <span className="opacity-50 text-[10px]">Vector</span>
                  </button>
                  <button onClick={() => handleExport('pdf')} className="px-4 py-2 text-xs font-medium text-left hover:bg-[var(--color-cream-warm)] hover:text-red-600 transition-colors pointer-events-auto flex items-center justify-between">
                    Export PDF <span className="opacity-50 text-[10px]">Doc</span>
                  </button>
                </div>
              )}
            </div>

            {!isNeuralView && (
              <>
                <div className="w-px h-5 bg-[var(--color-border)] opacity-50 mx-1" />
                <div className="relative group flex">
                  <button
                    onClick={handleAddGroup}
                    className="p-2.5 text-[var(--color-ink-muted)] hover:text-emerald-500 hover:bg-[var(--color-cream-warm)] rounded-full transition-all"
                  >
                    <BoxSelect className="w-4 h-4" />
                  </button>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all px-2.5 py-1 bg-[var(--color-ink)] text-[var(--color-cream)] text-[10px] font-medium tracking-wide rounded-lg pointer-events-none whitespace-nowrap origin-bottom opacity-0 group-hover:opacity-100 shadow-sm">
                    Add Group Box
                  </div>
                </div>
              </>
            )}

            {!isNeuralView && (
              <>
                <div className="w-px h-5 bg-[var(--color-border)] opacity-50 mx-1" />
                <div className="relative flex">
                  <button
                    onClick={() => setShowNodePalette(!showNodePalette)}
                    className="p-2.5 text-[var(--color-ink-muted)] hover:text-yellow-600 hover:bg-[var(--color-cream-warm)] rounded-full transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all px-2.5 py-1 bg-[var(--color-ink)] text-[var(--color-cream)] text-[10px] font-medium tracking-wide rounded-lg pointer-events-none whitespace-nowrap origin-bottom opacity-0 group-hover:opacity-100 shadow-sm">
                    Add Elements
                  </div>

                  {/* Node Palette Popover */}
                  {showNodePalette && (
                    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-64 max-h-96 overflow-y-auto bg-[var(--color-cream)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 p-3 grid grid-cols-2 gap-2 custom-scrollbar">
                      <div className="col-span-2 text-[10px] font-semibold text-[var(--color-ink-muted)] mt-1 px-1 tracking-wider uppercase">Shapes & Notes</div>
                      {ALL_NODE_TYPES.filter(t => !t.includes('empathy') && !t.includes('journey')).map(type => (
                        <button
                          key={type}
                          onClick={() => handleAddSpecificNode(type)}
                          className="text-left px-2.5 py-2 text-xs font-medium rounded-lg border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-cream-warm)] transition-all truncate text-[var(--color-ink)]"
                        >
                          {NODE_TYPE_LABELS[type] || type}
                        </button>
                      ))}

                      <div className="col-span-2 text-[10px] font-semibold text-[var(--color-ink-muted)] mt-3 mb-1 px-1 tracking-wider uppercase">Journey & Empathy</div>
                      <button
                        onClick={handleSpawnEmpathyMap}
                        className="p-3 bg-[var(--color-cream-warm)] border border-[var(--color-border)] hover:border-blue-300 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-[var(--color-ink)] hover:text-blue-600 group col-span-1 shadow-sm hover:shadow-md"
                        title="Spawn Empathy Map Template"
                      >
                        <LayoutGrid className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-center font-medium leading-tight">
                          Empathy Map
                        </span>
                      </button>
                      {ALL_NODE_TYPES.filter(t => (t.includes('empathy') || t.includes('journey')) && t !== 'empathy-map-framework').map(type => (
                        <button
                          key={type}
                          onClick={() => handleAddSpecificNode(type)}
                          className="text-left px-2.5 py-2 text-xs font-medium rounded-lg border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-cream-warm)] transition-all truncate text-[var(--color-ink)]"
                        >
                          {NODE_TYPE_LABELS[type] || type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {!isNeuralView && (
              <div className="relative group flex">
                <button
                  onClick={() => handleAddSpecificNode('image-node', 'Image Asset')}
                  className="p-2.5 text-[var(--color-ink-muted)] hover:text-pink-500 hover:bg-[var(--color-cream-warm)] rounded-full transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all px-2.5 py-1 bg-[var(--color-ink)] text-[var(--color-cream)] text-[10px] font-medium tracking-wide rounded-lg pointer-events-none whitespace-nowrap origin-bottom opacity-0 group-hover:opacity-100 shadow-sm">
                  Add Image Node
                </div>
              </div>
            )}

            <div className="w-px h-5 bg-[var(--color-border)] opacity-50 mx-1" />

            <div className="relative group flex">
              <button
                onClick={handleAutoLayout}
                className="p-2.5 text-[var(--color-ink-muted)] hover:text-orange-500 hover:bg-[var(--color-cream-warm)] rounded-full transition-all"
              >
                <Network className="w-4 h-4" />
              </button>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all px-2.5 py-1 bg-[var(--color-ink)] text-[var(--color-cream)] text-[10px] font-medium tracking-wide rounded-lg pointer-events-none whitespace-nowrap origin-bottom opacity-0 group-hover:opacity-100 shadow-sm">
                Auto Layout
              </div>
            </div>

            {!isNeuralView && (
              <div className="relative group flex">
                <button
                  onClick={handleClearBoard}
                  className="p-2.5 text-[var(--color-ink-muted)] hover:text-red-500 hover:bg-[var(--color-cream-warm)] rounded-full transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all px-2.5 py-1 bg-[var(--color-ink)] text-[var(--color-cream)] text-[10px] font-medium tracking-wide rounded-lg pointer-events-none whitespace-nowrap origin-bottom opacity-0 group-hover:opacity-100 shadow-sm">
                  Wipe Board
                </div>
              </div>
            )}
          </div>
        </Panel>

        <Controls className={`dark:border-neutral-700 bg-[var(--color-cream)] rounded-xl border border-[var(--color-border)] shadow-sm`} showInteractive={false} />
        <MiniMap
          style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#FAF9F6' }}
          nodeColor={isDarkMode ? '#333' : '#ebebeb'}
          maskColor={isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(230, 230, 230, 0.4)'}
          className="overflow-hidden rounded-xl border border-[var(--color-border)] shadow-sm"
        />
        <Background
          variant={isNeuralView ? BackgroundVariant.Lines : BackgroundVariant.Dots}
          gap={isNeuralView ? 40 : 16}
          size={1}
          color={isNeuralView ? '#1e293b' : '#cbd5e1'}
        />
      </ReactFlow>
    </div>
  );
}

export default function Board({
  onShowSummary,
  isNeuralView,
  universalApiKey,
  ...props
}: any) {
  return (
    <ReactFlowProvider>
      <BoardInner {...props} onShowSummary={onShowSummary} isNeuralView={isNeuralView} universalApiKey={universalApiKey} />
    </ReactFlowProvider>
  );
}
