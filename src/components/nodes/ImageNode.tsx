import { Handle, Position } from '@xyflow/react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useState, useRef } from 'react';

export function ImageNode({ data, id }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const customEvent = new CustomEvent('node-data-update', {
          detail: { id, data: { ...data, imageUrl: event.target?.result as string } }
        });
        window.dispatchEvent(customEvent);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`relative bg-[var(--color-cream)] border border-[var(--color-border)] rounded-xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-800 flex flex-col group transition-all`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: data.width || 300, minHeight: 150 }}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-full focus:ring-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 before:absolute before:w-[80px] before:h-[60px] before:-top-8 before:-left-[30px] before:content-['']" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-full focus:ring-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 before:absolute before:w-[80px] before:h-[60px] before:-bottom-8 before:-left-[30px] before:content-['']" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-full focus:ring-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 before:absolute before:w-[60px] before:h-[80px] before:-left-8 before:-top-[30px] before:content-['']" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 border border-[var(--color-border)] bg-[var(--color-cream)] rounded-full focus:ring-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 before:absolute before:w-[60px] before:h-[80px] before:-right-8 before:-top-[30px] before:content-['']" />

      {/* Header */}
      <div className="flex items-center gap-2 p-2.5 border-b border-[var(--color-border)] bg-[var(--color-cream-warm)] rounded-t-xl">
        <ImageIcon className="w-3.5 h-3.5 text-[var(--color-ink-muted)]" />
        <input
          type="text"
          value={data.label || 'Image Asset'}
          onChange={(e) => {
            window.dispatchEvent(new CustomEvent('node-data-update', {
              detail: { id, data: { ...data, label: e.target.value } }
            }));
          }}
          className="text-xs font-semibold bg-transparent border-none focus:outline-none flex-1 text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]"
          placeholder="Image Title..."
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col relative w-full h-full min-h-[150px]">
        {data.imageUrl ? (
          <div className="relative w-full flex-1 flex items-center justify-center p-2">
            <img src={data.imageUrl} alt={data.label || "Asset"} className="max-w-full max-h-full object-contain pointer-events-none rounded-lg" />

            {/* Upload Hover Overlay */}
            {isHovered && (
              <div
                className="absolute inset-0 bg-[var(--color-ink)]/40 flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px] rounded-b-xl"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-7 h-7 text-white mb-2" />
                <span className="text-white text-xs font-medium">Replace Image</span>
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex-1 flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-[var(--color-cream-warm)] transition-colors rounded-b-xl"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-7 h-7 text-[var(--color-ink-muted)] mb-2" />
            <span className="text-[var(--color-ink-muted)] text-xs font-medium text-center">Click to Upload Image</span>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
    </div>
  );
}
