import { Handle, Position, NodeResizer } from '@xyflow/react';

export function EmpathyMapNode({ id, selected, data }: any) {
  return (
    <>
      <NodeResizer
        color="#818cf8"
        isVisible={selected}
        minWidth={400}
        minHeight={400}
        handleStyle={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--color-border)' }}
      />
      <div className="w-full h-full bg-[var(--color-cream)] border border-[var(--color-border)] shadow-md flex flex-col overflow-hidden rounded-2xl">

        {/* Grabbable Header */}
        <div className="group-drag-handle bg-[var(--color-ink)] text-[var(--color-cream)] p-3 font-semibold tracking-tight text-center cursor-grab active:cursor-grabbing rounded-t-2xl">
          {data.title || "Empathy Map Framework"}
        </div>

        {/* 2x2 Grid Background */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 relative pointer-events-none">
          {/* Vertical Divider */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--color-border)] -translate-x-1/2" />
          {/* Horizontal Divider */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--color-border)] -translate-y-1/2" />

          {/* SAYS */}
          <div className="p-4 flex flex-col opacity-90">
            <div className="font-semibold text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 w-max px-3 py-1 border border-blue-200 dark:border-blue-700 rounded-lg">
              SAYS (Quotes & Words)
            </div>
          </div>
          {/* THINKS */}
          <div className="p-4 flex flex-col opacity-90">
            <div className="font-semibold text-sm text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/40 w-max px-3 py-1 border border-purple-200 dark:border-purple-700 rounded-lg">
              THINKS (Thoughts & Beliefs)
            </div>
          </div>
          {/* DOES */}
          <div className="p-4 flex flex-col opacity-90">
            <div className="font-semibold text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/40 w-max px-3 py-1 border border-green-200 dark:border-green-700 rounded-lg">
              DOES (Actions & Behaviors)
            </div>
          </div>
          {/* FEELS */}
          <div className="p-4 flex flex-col opacity-90">
            <div className="font-semibold text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/40 w-max px-3 py-1 border border-rose-200 dark:border-rose-700 rounded-lg">
              FEELS (Emotions & Worries)
            </div>
          </div>
        </div>

        {/* Global Connection Handles */}
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[var(--color-cream)] border border-[var(--color-border)] rounded-full transition-all hover:scale-150 z-50" />
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[var(--color-ink)] border border-[var(--color-cream)] rounded-full transition-all hover:scale-150 z-50" />
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[var(--color-cream)] border border-[var(--color-border)] rounded-full transition-all hover:scale-150 z-50" />
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[var(--color-ink)] border border-[var(--color-cream)] rounded-full transition-all hover:scale-150 z-50" />
      </div>
    </>
  );
}
