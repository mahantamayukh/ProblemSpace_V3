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
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] bg-[var(--color-cream)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)] bg-[var(--color-sky-light)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg tracking-tight text-[var(--color-ink)]">Process Summary</h2>
              <p className="text-xs text-sky-700 dark:text-sky-400 font-medium tracking-wide">
                {boardNodes.length} items on board
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--color-cream)] border border-[var(--color-border)] hover:bg-[var(--color-cream-warm)] shadow-sm transition-all text-[var(--color-ink)]"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[var(--color-ink)] text-[var(--color-cream)] border border-[var(--color-ink)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export .md
            </button>
            <button
              onClick={onClose}
              className="ml-1 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-cream-warm)] transition-all"
            >
              <X className="w-4 h-4 text-[var(--color-ink-muted)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--color-cream)]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Diamond className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="font-semibold text-sm tracking-wide text-sky-600 dark:text-sky-400">
                Concepts Discovered
              </h3>
            </div>

            {Object.keys(nodesByType).map(type => (
              nodesByType[type] && nodesByType[type].length > 0 && (
                <div key={type} className="mt-5">
                  <div className="text-xs font-semibold text-[var(--color-ink-muted)] mb-3 ml-6 uppercase tracking-wider">
                    {typeLabels[type] || type} ({nodesByType[type].length})
                  </div>
                  <div className="space-y-2 ml-6">
                    {nodesByType[type].map((node: any) => (
                      <div key={node.id} className="text-xs p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-cream-warm)]">
                        <span className="font-semibold text-[var(--color-ink)]">{node.data?.label || 'Untitled'}</span>
                        {node.data?.details && (
                          <span className="text-[var(--color-ink-light)] mt-1 block leading-relaxed"> {node.data.details}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
