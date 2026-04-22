import { useState } from 'react';
import { X, Download, FileText, CheckCircle2, Circle, Diamond } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Exercise } from '../hooks/useSprintState';

interface SprintSummaryProps {
  onClose: () => void;
  boardNodes: any[];
}

const typeLabels: Record<string, string> = {
  problem: '🔵 Problem',
  insight: '🟣 Insight',
  audience: '🟢 Audience',
  constraint: '🟡 Constraint',
  hmw: '💡 How Might We',
  rose: '🌹 Rose',
  thorn: '🌵 Thorn',
  bud: '🌱 Bud',
  competitor: '⚔️ Competitor',
  'journey-step': '👣 Journey Step',
  principle: '🧭 Principle',
  metric: '📊 Metric',
  tweet: '🐦 First Tweet',
  sticky: '📝 Note',
};

export default function SprintSummary({ onClose, boardNodes }: SprintSummaryProps) {
  const [copied, setCopied] = useState(false);

  // Group nodes by type
  const nodesByType: Record<string, any[]> = {};
  boardNodes.forEach(node => {
    const type = node.type || 'sticky';
    if (!nodesByType[type]) nodesByType[type] = [];
    nodesByType[type].push(node);
  });

  const generateMarkdown = () => {
    let md = `# Process Summary\n\n`;
    md += `_Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}_\n\n`;
    md += `---\n\n`;

    Object.keys(nodesByType).forEach(type => {
      md += `### ${typeLabels[type] || type}\n\n`;
      nodesByType[type].forEach(node => {
        md += `- **${node.data?.label || 'Untitled'}**: ${node.data?.details || ''}\n`;
      });
      md += '\n';
    });

    return md;
  };

  const handleExport = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `process-summary-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[var(--color-ink)]/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] bg-[var(--color-cream)] border border-[var(--color-border)] rounded-[2.5rem] shadow-[var(--shadow-modal)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-[var(--color-sky-light)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-sky)] text-[var(--color-cream)] flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-xl tracking-tight text-[var(--color-ink)]">Process Summary</h2>
              <p className="text-[10px] text-[var(--color-sky)] dark:text-sky-400 font-black uppercase tracking-widest mt-1">
                Synthesized insights from {boardNodes.length} items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[var(--color-cream)] border border-[var(--color-border)] hover:bg-[var(--color-cream-deep)] shadow-sm transition-all text-[var(--color-ink)]"
            >
              {copied ? '✓ Copied' : 'Copy MD'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[var(--color-ink)] text-[var(--color-cream)] border border-[var(--color-ink)] shadow-lg hover:bg-[var(--color-sky)] hover:-translate-y-0.5 transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onClose}
              className="ml-1 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--color-cream-deep)] transition-all border border-transparent hover:border-[var(--color-border)]"
            >
              <X className="w-5 h-5 text-[var(--color-ink-muted)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[var(--color-cream)] custom-scrollbar">
          <div className="space-y-10">
            <div className="flex items-center gap-3 mb-6">
              <Diamond className="w-5 h-5 text-[var(--color-sky)]" />
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[var(--color-sky)]">
                Knowledge Synthesis
              </h3>
            </div>

            {Object.keys(nodesByType).map(type => (
              nodesByType[type] && nodesByType[type].length > 0 && (
                <div key={type} className="space-y-4">
                  <div className="text-[10px] font-black text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-2 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-sky)]" />
                    {typeLabels[type] || type} <span className="opacity-50">({nodesByType[type].length})</span>
                  </div>
                  <div className="grid gap-3">
                    {nodesByType[type].map((node: any) => (
                      <div key={node.id} className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream-warm)] shadow-sm hover:border-[var(--color-sky)] hover:bg-[var(--color-sky-light)] transition-all group">
                        <div className="font-bold text-sm text-[var(--color-ink)] group-hover:text-[var(--color-sky)] transition-colors">{node.data?.label || 'Untitled'}</div>
                        {node.data?.details && (
                          <p className="text-[11px] text-[var(--color-ink-light)] mt-1.5 leading-relaxed font-medium"> {node.data.details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-[var(--color-cream-deep)]/50 border-t border-[var(--color-border)] text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-ink-muted)]">
                ProblemSpace Research Engine · {new Date().getFullYear()}
            </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
