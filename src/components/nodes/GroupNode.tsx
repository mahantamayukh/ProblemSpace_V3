import { NodeResizer } from '@xyflow/react';
import { BoxSelect } from 'lucide-react';
import { useState } from 'react';

export function GroupNode({ data, selected, id }: any) {
  return (
    <>
      <NodeResizer 
        color="#3b82f6" 
        isVisible={selected} 
        minWidth={200} 
        minHeight={150} 
        handleStyle={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid white' }}
        lineStyle={{ borderWidth: 2 }}
      />
      
      <div className="w-full h-full bg-blue-500/5 dark:bg-blue-400/5 border-2 border-dashed border-blue-500/50 dark:border-blue-400/50 rounded-xl relative flex flex-col transition-colors group group-drag-handle">
        
        {/* Draggable Header */}
        <div className="h-10 w-full bg-blue-500/20 dark:bg-blue-400/20 border-b-2 border-dashed border-blue-500/50 dark:border-blue-400/50 flex flex-shrink-0 items-center px-3 cursor-grab active:cursor-grabbing rounded-t-lg group-drag-handle">
          <BoxSelect className="w-4 h-4 text-blue-700 dark:text-blue-300 mr-2" />
          <input 
            type="text" 
            value={data.label || 'Group Zone'} 
            onChange={(e) => {
              window.dispatchEvent(new CustomEvent('node-data-update', {
                detail: { id, data: { ...data, label: e.target.value } }
              }));
            }}
            className="text-xs font-bold uppercase tracking-widest bg-transparent border-none focus:outline-none flex-1 text-blue-900 dark:text-blue-100 placeholder-blue-500/50"
            placeholder="Name this group..."
          />
        </div>
        
      </div>
    </>
  );
}
