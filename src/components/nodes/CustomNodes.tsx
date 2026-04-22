import { useState, useLayoutEffect, useRef } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Target, Lightbulb, User, AlertTriangle, StickyNote, HelpCircle, Flower2, AlertOctagon, Sprout, Swords, Footprints, Compass, BarChart3, MessageCircle, Map, Brain, Activity, Heart, MessageSquare, Image as ImageIcon, Copy, Trash2, Palette, Sparkles } from 'lucide-react';
import { ImageNode } from './ImageNode';
import { GroupNode } from './GroupNode';
import { EmpathyMapNode } from './EmpathyMapNode';
import { EmpathyNoteNode } from './EmpathyNoteNode';

const AutoResizeTextarea = ({ value, onBlur, className, placeholder, rows = 1, readOnly = false, onChange }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleInput = (e: any) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
    if (onChange) onChange(e);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onBlur={onBlur}
      onInput={handleInput}
      onChange={onChange || (() => {})}
      readOnly={readOnly}
      className={`${className} ${readOnly ? 'cursor-default' : ''}`}
      placeholder={placeholder}
      rows={rows}
    />
  );
};
import { NeuronIcon } from '../ui/NeuronIcon';

const nodeStyles = {
  problem: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: Target, iconColor: 'text-blue-600', darkBg: 'dark:bg-blue-950/40', darkText: 'dark:text-blue-300', darkIcon: 'dark:text-blue-400' },
  insight: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', icon: Lightbulb, iconColor: 'text-purple-600', darkBg: 'dark:bg-purple-950/40', darkText: 'dark:text-purple-300', darkIcon: 'dark:text-purple-400' },
  audience: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: User, iconColor: 'text-emerald-600', darkBg: 'dark:bg-emerald-950/40', darkText: 'dark:text-emerald-300', darkIcon: 'dark:text-emerald-400' },
  constraint: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: AlertTriangle, iconColor: 'text-amber-600', darkBg: 'dark:bg-amber-950/40', darkText: 'dark:text-amber-300', darkIcon: 'dark:text-amber-400' },
  sticky: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900', icon: StickyNote, iconColor: 'text-yellow-600', darkBg: 'dark:bg-yellow-950/40', darkText: 'dark:text-yellow-200', darkIcon: 'dark:text-yellow-400' },
  hmw: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-900', icon: HelpCircle, iconColor: 'text-cyan-600', darkBg: 'dark:bg-cyan-950/40', darkText: 'dark:text-cyan-300', darkIcon: 'dark:text-cyan-400' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', icon: Flower2, iconColor: 'text-rose-500', darkBg: 'dark:bg-rose-950/40', darkText: 'dark:text-rose-300', darkIcon: 'dark:text-rose-400' },
  thorn: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: AlertOctagon, iconColor: 'text-red-600', darkBg: 'dark:bg-red-950/40', darkText: 'dark:text-red-300', darkIcon: 'dark:text-red-400' },
  bud: { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-900', icon: Sprout, iconColor: 'text-lime-600', darkBg: 'dark:bg-lime-950/40', darkText: 'dark:text-lime-300', darkIcon: 'dark:text-lime-400' },
  competitor: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-900', icon: Swords, iconColor: 'text-slate-600', darkBg: 'dark:bg-slate-950/40', darkText: 'dark:text-slate-300', darkIcon: 'dark:text-slate-400' },
  'journey-step': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', icon: Footprints, iconColor: 'text-indigo-600', darkBg: 'dark:bg-indigo-950/40', darkText: 'dark:text-indigo-300', darkIcon: 'dark:text-indigo-400' },
  principle: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-900', icon: Compass, iconColor: 'text-teal-600', darkBg: 'dark:bg-teal-950/40', darkText: 'dark:text-teal-300', darkIcon: 'dark:text-teal-400' },
  metric: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', icon: BarChart3, iconColor: 'text-orange-600', darkBg: 'dark:bg-orange-950/40', darkText: 'dark:text-orange-300', darkIcon: 'dark:text-orange-400' },
  tweet: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-900', icon: MessageCircle, iconColor: 'text-sky-600', darkBg: 'dark:bg-sky-950/40', darkText: 'dark:text-sky-300', darkIcon: 'dark:text-sky-400' },
  failure: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-900', icon: AlertOctagon, iconColor: 'text-red-600', darkBg: 'dark:bg-red-950/40', darkText: 'dark:text-red-300', darkIcon: 'dark:text-red-400' },
  signal: { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-900', icon: Sparkles, iconColor: 'text-violet-600', darkBg: 'dark:bg-violet-950/40', darkText: 'dark:text-violet-300', darkIcon: 'dark:text-violet-400' },
  memory: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500', text: 'text-fuchsia-100', icon: NeuronIcon, iconColor: 'text-fuchsia-400', darkBg: 'dark:bg-fuchsia-950/40', darkText: 'dark:text-fuchsia-300', darkIcon: 'dark:text-fuchsia-400' },
};

const typeLabels: Record<string, string> = {
  problem: 'Problem',
  insight: 'Insight',
  audience: 'Audience',
  constraint: 'Constraint',
  sticky: 'Sticky Note',
  hmw: 'How Might We',
  rose: 'Rose',
  thorn: 'Thorn',
  bud: 'Bud',
  competitor: 'Competitor',
  'journey-step': 'Journey Step',
  principle: 'Principle',
  metric: 'Metric',
  tweet: 'First Tweet',
  'journey-header': 'Project/Journey Header',
  failure: 'Failure Mode',
  signal: 'Market Signal',
};

export function DetectiveNode({ id, data, type, selected }: any) {
  const style = nodeStyles[type as keyof typeof nodeStyles] || nodeStyles.insight;
  const Icon = style.icon;
  const customColor = data.customColor;
  const label = typeLabels[type] || type;

  const SWATCHES = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#64748b'];

  return (
    <>
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        className="flex gap-1.5 items-center p-1.5 bg-[var(--color-cream)] border border-[var(--color-border)] rounded-xl shadow-lg backdrop-blur-sm"
      >
        <div className="flex gap-1 items-center px-1 border-r border-[var(--color-border)] mr-1 pr-2">
          <Palette className="w-3.5 h-3.5 text-[var(--color-ink-muted)] mr-0.5" />
          {SWATCHES.map(color => (
            <button
              key={color}
              onClick={() => window.dispatchEvent(new CustomEvent('node-data-update', { detail: { id, data: { ...data, customColor: color } } }))}
              className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 hover:scale-125 transition-transform"
              style={{ backgroundColor: color }}
              title="Change Color"
            />
          ))}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('node-data-update', { detail: { id, data: { ...data, customColor: undefined } } }))}
            className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 hover:scale-125 transition-transform flex items-center justify-center bg-[var(--color-cream-warm)]"
            title="Reset Color"
          >
            <div className="w-full h-px bg-[var(--color-ink-muted)] rotate-45" />
          </button>
        </div>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('node-duplicate-action', { detail: { id } }))}
          className="p-1.5 text-[var(--color-ink-muted)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-[var(--color-cream-warm)] rounded-lg transition-all"
          title="Duplicate"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('node-delete-action', { detail: { id } }))}
          className="p-1.5 text-[var(--color-ink-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </NodeToolbar>

      <div
        className={`px-4 py-3 bg-[var(--color-cream)] dark:bg-[var(--color-cream)] border ${customColor ? '' : style.border} rounded-xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-800 w-64 cursor-pointer transition-all`}
        style={customColor ? { borderColor: customColor, backgroundColor: `${customColor}08` } : {}}
      >
        {/* Target Handles - All 4 Sides */}
        <Handle type="target" position={Position.Top} id="t-top" className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity z-30" />
        <Handle type="target" position={Position.Bottom} id="t-bottom" className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity z-30" />
        <Handle type="target" position={Position.Left} id="t-left" className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity z-30" />
        <Handle type="target" position={Position.Right} id="t-right" className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity z-30" />

        {/* Source Handles - All 4 Sides */}
        <Handle type="source" position={Position.Top} id="s-top" className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity z-20" />
        <Handle type="source" position={Position.Bottom} id="s-bottom" className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity z-20" />
        <Handle type="source" position={Position.Left} id="s-left" className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity z-20" />
        <Handle type="source" position={Position.Right} id="s-right" className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity z-20" />

        {/* Visible Interaction Points (The "Four Points" the user sees) */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-full z-10 pointer-events-none" />
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-full z-10 pointer-events-none" />
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-full z-10 pointer-events-none" />
        <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-full z-10 pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${customColor ? '' : style.bg} ${customColor ? '' : style.darkBg}`}
            style={customColor ? { backgroundColor: `${customColor}20` } : {}}
          >
            <Icon
              className={`w-3.5 h-3.5 ${customColor ? '' : `${style.iconColor} ${style.darkIcon}`}`}
              style={customColor ? { color: customColor } : {}}
            />
          </div>
          <div
            className={`text-[10px] font-semibold tracking-wide ${customColor ? '' : `${style.iconColor} ${style.darkText}`}`}
            style={customColor ? { color: customColor } : {}}
          >
            {label}
          </div>
        </div>

        <div className="font-semibold text-sm mb-1 text-[var(--color-ink)] nodrag">
          <AutoResizeTextarea
            value={data.label}
            onChange={(e: any) => window.dispatchEvent(new CustomEvent('node-data-update', { detail: { id, data: { ...data, label: e.target.value } } }))}
            className="w-full bg-transparent outline-none resize-none overflow-hidden placeholder:text-[var(--color-ink-muted)]"
            placeholder="Unnamed Node..."
          />
        </div>

        <div className="text-xs text-[var(--color-ink-light)] leading-relaxed nodrag">
          <AutoResizeTextarea
            value={data.details}
            onChange={(e: any) => window.dispatchEvent(new CustomEvent('node-data-update', { detail: { id, data: { ...data, details: e.target.value } } }))}
            className="w-full bg-transparent outline-none resize-none overflow-hidden placeholder:text-[var(--color-ink-muted)]"
            placeholder="Details..."
          />
        </div>
      </div>
    </>
  );
}

export function MemoryNode({ data }: any) {
  const style = nodeStyles.memory;
  const Icon = style.icon;

  return (
    <div
      className={`px-4 py-3 bg-neutral-900/40 backdrop-blur-md border border-fuchsia-500/60 rounded-xl shadow-[0_0_20px_rgba(192,38,211,0.15)] w-64 relative group overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent pointer-events-none rounded-xl" />
      
      {/* Decorative scanline */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-fuchsia-400/20 animate-pulse" />

      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg border border-fuchsia-500/40 flex items-center justify-center bg-fuchsia-950/50 relative">
          <Icon className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
          <div className="absolute inset-0 bg-fuchsia-500/20 animate-ping rounded-full scale-50 opacity-30" />
        </div>
        <div className="flex flex-col">
          <div className="text-[10px] font-semibold tracking-wide text-fuchsia-300">Neural Memory</div>
          <div className="text-[8px] font-medium text-fuchsia-400/60">Read-Only AI Context</div>
        </div>
      </div>

      <div className="font-semibold text-sm mb-1 text-white tracking-tight">
        <AutoResizeTextarea
          value={data.label}
          readOnly={true}
          className="w-full bg-transparent outline-none resize-none overflow-hidden text-fuchsia-50"
        />
      </div>

      <div className="text-[11px] text-fuchsia-200/70 font-medium leading-relaxed">
        <AutoResizeTextarea
          value={data.details}
          readOnly={true}
          className="w-full bg-transparent outline-none resize-none overflow-hidden"
        />
      </div>

      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

export const nodeTypes = {
  problem: (props: any) => <DetectiveNode {...props} type="problem" />,
  insight: (props: any) => <DetectiveNode {...props} type="insight" />,
  audience: (props: any) => <DetectiveNode {...props} type="audience" />,
  constraint: (props: any) => <DetectiveNode {...props} type="constraint" />,
  sticky: (props: any) => <DetectiveNode {...props} type="sticky" />,
  hmw: (props: any) => <DetectiveNode {...props} type="hmw" />,
  rose: (props: any) => <DetectiveNode {...props} type="rose" />,
  thorn: (props: any) => <DetectiveNode {...props} type="thorn" />,
  bud: (props: any) => <DetectiveNode {...props} type="bud" />,
  competitor: (props: any) => <DetectiveNode {...props} type="competitor" />,
  'journey-step': (props: any) => <DetectiveNode {...props} type="journey-step" />,
  principle: (props: any) => <DetectiveNode {...props} type="principle" />,
  metric: (props: any) => <DetectiveNode {...props} type="metric" />,
  tweet: (props: any) => <DetectiveNode {...props} type="tweet" />,
  'empathy-map-framework': (props: any) => <EmpathyMapNode {...props} />,
  'empathy-says': (props: any) => <EmpathyNoteNode {...props} type="empathy-says" />,
  'empathy-thinks': (props: any) => <EmpathyNoteNode {...props} type="empathy-thinks" />,
  'empathy-does': (props: any) => <EmpathyNoteNode {...props} type="empathy-does" />,
  'empathy-feels': (props: any) => <EmpathyNoteNode {...props} type="empathy-feels" />,
  'image-node': (props: any) => <ImageNode {...props} />,
  'custom-group': (props: any) => <GroupNode {...props} />,
  'memory': (props: any) => <MemoryNode {...props} />,
};

export const ALL_NODE_TYPES = Object.keys(nodeTypes);
export const NODE_TYPE_LABELS = typeLabels;
