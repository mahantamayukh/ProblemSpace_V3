import { useLayoutEffect, useRef } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Palette, Trash2, Copy, MessageSquare, Brain, Activity, Heart } from 'lucide-react';

const AutoResizeTextarea = ({ value, onBlur, className, placeholder, rows = 1, onChange }: any) => {
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
      className={className}
      placeholder={placeholder}
      rows={rows}
    />
  );
};

const typeConfig: Record<string, { color: string; darkColor: string; bg: string; icon: any }> = {
  'empathy-says': { color: 'text-blue-700', darkColor: 'dark:text-blue-300', bg: 'bg-blue-600', icon: MessageSquare },
  'empathy-thinks': { color: 'text-purple-700', darkColor: 'dark:text-purple-300', bg: 'bg-purple-600', icon: Brain },
  'empathy-does': { color: 'text-green-700', darkColor: 'dark:text-green-300', bg: 'bg-green-600', icon: Activity },
  'empathy-feels': { color: 'text-rose-700', darkColor: 'dark:text-rose-300', bg: 'bg-rose-600', icon: Heart },
};

export function EmpathyNoteNode({ id, data, type, selected }: any) {
  const customColor = data.customColor;
  const config = typeConfig[type] || typeConfig['empathy-says'];
  const Icon = config.icon;

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
        className="w-40 aspect-square p-3 shadow-sm hover:shadow-md hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-800 cursor-pointer relative border-l-3 rounded-xl flex flex-col transition-all bg-[var(--color-cream)]"
        style={{
          backgroundColor: customColor ? `${customColor}10` : undefined,
          borderColor: customColor || undefined,
          borderLeftColor: customColor || undefined,
        }}
      >
        <div className={`absolute inset-0 opacity-[0.06] pointer-events-none rounded-xl ${customColor ? '' : config.bg}`} />
        <div className={`absolute top-0 bottom-0 left-0 w-0.5 rounded-l-xl ${customColor ? '' : config.bg.replace('100', '400')} opacity-50`} style={{ backgroundColor: customColor }} />

        <Icon className={`w-3.5 h-3.5 mb-2 ${customColor ? 'text-[var(--color-ink)]' : `${config.color} ${config.darkColor}`}`} style={{ color: customColor }} />

        <div className="font-semibold text-xs leading-tight mb-1 text-[var(--color-ink)] z-10 flex-1 nodrag">
          <AutoResizeTextarea
            value={data.label}
            onChange={(e: any) => window.dispatchEvent(new CustomEvent('node-data-update', { detail: { id, data: { ...data, label: e.target.value } } }))}
            className="w-full h-full bg-transparent outline-none resize-none overflow-hidden placeholder:text-[var(--color-ink-muted)] font-semibold"
            placeholder="Text..."
          />
        </div>

        <div className="text-[10px] text-[var(--color-ink-light)] z-10 nodrag mt-auto">
          <AutoResizeTextarea
            value={data.details}
            onChange={(e: any) => window.dispatchEvent(new CustomEvent('node-data-update', { detail: { id, data: { ...data, details: e.target.value } } }))}
            className="w-full bg-transparent outline-none resize-none overflow-hidden placeholder:text-[var(--color-ink-muted)]"
            placeholder="Details..."
          />
        </div>

        <Handle type="target" position={Position.Top} className="w-3 h-3 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-full focus:ring-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 before:absolute before:w-[80px] before:h-[60px] before:-top-8 before:-left-[30px] before:content-['']" />
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-full focus:ring-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 before:absolute before:w-[80px] before:h-[60px] before:-bottom-8 before:-left-[30px] before:content-['']" />
      </div>
    </>
  );
}
