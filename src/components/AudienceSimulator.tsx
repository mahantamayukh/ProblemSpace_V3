import { useState, useRef, useEffect } from 'react';
import { User, Send, Pin, X, BookmarkCheck, RotateCcw, MessageSquarePlus } from 'lucide-react';
import Markdown from 'react-markdown';
import { generatePersonaResponse } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';

interface Persona {
  id: string;
  label: string;
  details: string;
  personaProfile?: string;
  personaBehavior?: string;
}

export interface SavedInterview {
  id: string; // sessionId
  personaId: string;
  personaLabel: string;
  customLabel?: string;
  savedAt: string;
  messages: Array<{ id: string; role: 'user' | 'model'; text: string }>;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AudienceSimulatorProps {
  persona: Persona;
  boardContext: string;
  onClose: () => void;
  onPinInsight: (insightNode: any) => void;
  onBoardUpdate: (data: any) => void;
  onSaveInterview?: (interview: SavedInterview) => void;
  onResetPersona?: () => void;
  savedInterviewCount?: number;
  initialMessages?: Message[];
  initialSessionId?: string;
  initialLabel?: string;
  apiKey?: string;
  anthropicApiKey?: string;
  aiModel?: string;
  customBaseUrl?: string;
  customModelName?: string;
}

// Context-aware suggested questions
function buildSuggestedQuestions(persona: Persona, boardContext: string): string[] {
  const label = persona.label;
  const hasContext = boardContext && boardContext !== 'General creative exploration.';
  return [
    hasContext
      ? `Walk me through how you currently deal with this problem.`
      : `What's the biggest challenge you're facing right now?`,
    `What have you tried before that didn't work — and why?`,
    `On a scale of 1-10, how urgent is this for you, and why?`,
    `What would the perfect solution look like in your ideal world?`,
    `Who else in your life or team is affected by this?`,
    `What would make you immediately dismiss a solution?`,
    `How much time does this problem cost you each week?`,
  ];
}

export default function AudienceSimulator({
  persona,
  boardContext,
  onClose,
  onPinInsight,
  onBoardUpdate,
  onSaveInterview,
  onResetPersona,
  savedInterviewCount = 0,
  initialMessages,
  initialSessionId,
  initialLabel,
  apiKey,
  anthropicApiKey,
  aiModel = 'gemini-1.5-pro',
  customBaseUrl,
  customModelName
}: AudienceSimulatorProps) {

  const makeInitialMessages = (): Message[] => [
    {
      id: 'initial',
      role: 'model',
      text: `*(You are now speaking with ${persona.label}. They will respond in-character based on their profile.)*\n\nHi there. I'm ${persona.label}. What did you want to ask me?`,
    },
  ];

  const [messages, setMessages] = useState<Message[]>(() => initialMessages || makeInitialMessages());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Session management
  const [sessionId, setSessionId] = useState<string>(() => initialSessionId || Date.now().toString());
  const [customLabel, setCustomLabel] = useState<string>(() => initialLabel || `Interview - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = buildSuggestedQuestions(persona, boardContext);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const autoResizeTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 130) + 'px';
  };

  const handleSend = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isLoading) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setSaved(false);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const { text: responseText, newHistory } = await generatePersonaResponse(
        persona,
        boardContext,
        history,
        userText,
        onBoardUpdate,
        apiKey,
        aiModel,
        anthropicApiKey,
        undefined, // oauthToken
        customBaseUrl,
        customModelName
      );
      setHistory(newHistory);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: '*(Simulation error: Failed to generate response.)*'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePin = (text: string) => {
    const rawText = text.replace(/^\*\(.*?\)\*\s*/, '');
    onPinInsight({
      id: `insight-sim-${Date.now()}`,
      type: 'insight',
      position: { x: 0, y: 0 },
      data: {
        label: `Quote from ${persona.label}`,
        details: `"${rawText.substring(0, 150)}${rawText.length > 150 ? '...' : ''}"\n\n[SOURCE: Simulated Persona]`,
        source: 'simulation',
      },
    });
  };

  const handleSaveInterview = () => {
    if (!onSaveInterview) return;
    onSaveInterview({
      id: sessionId,
      personaId: persona.id,
      personaLabel: persona.label,
      customLabel: customLabel.trim(),
      savedAt: new Date().toISOString(),
      messages: [...messages],
    });
    setSaved(true);
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2500);
  };

  const handleNewConversation = () => {
    setMessages(makeInitialMessages());
    setHistory([]);
    setInput('');
    setSaved(false);
    setSessionId(Date.now().toString());
    setCustomLabel(`Interview - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const hasConversation = messages.length > 1;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg h-[75vh] min-h-[520px] relative z-10 flex flex-col bg-[var(--color-cream)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-sage-light)] flex items-start justify-between shrink-0 transition-colors rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Simulated Interview
                  </span>
                  {onResetPersona && (
                    <button
                      onClick={onResetPersona}
                      className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-[var(--color-ink)] transition-all"
                    >
                      (Reset Persona)
                    </button>
                  )}
                </div>
                {isEditingLabel ? (
                  <input
                    autoFocus
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    onBlur={() => setIsEditingLabel(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingLabel(false)}
                    className="font-semibold text-sm bg-[var(--color-cream)] border-b border-[var(--color-border)] focus:outline-none mt-0.5 rounded px-1"
                  />
                ) : (
                  <span
                    onClick={() => setIsEditingLabel(true)}
                    className="font-semibold text-sm text-[var(--color-ink)] leading-tight mt-0.5 cursor-pointer hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                  >
                    {customLabel} <span className="text-[10px] text-[var(--color-ink-muted)] font-normal">click to rename</span>
                  </span>
                )}
                <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 line-clamp-1 mt-0.5 italic">
                  Asking {persona.label}...
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 -mt-0.5">
              {savedInterviewCount > 0 && (
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                  {savedInterviewCount} saved
                </span>
              )}
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-cream-warm)] transition-all"
              >
                <X className="w-4 h-4 text-[var(--color-ink-muted)]" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--color-cream-warm)] transition-colors">
            {messages.map((msg, i) => (
              <div key={msg.id} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl ${msg.role === 'user'
                    ? 'bg-[var(--color-ink)] text-[var(--color-cream)] shadow-sm'
                    : 'bg-[var(--color-cream)] border border-[var(--color-border)] shadow-sm text-[var(--color-ink)]'
                    }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 text-sm dark:prose-invert">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}
                </div>
                {msg.role === 'model' && i > 0 && (
                  <button
                    onClick={() => handlePin(msg.text)}
                    className="flex items-center gap-1 mt-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-500 hover:text-emerald-800 transition-colors px-1"
                  >
                    <Pin className="w-3 h-3" /> Pin as Insight
                  </button>
                )}
              </div>
            ))}

            {/* Suggested questions */}
            {messages.length === 1 && !isLoading && (
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-medium text-[var(--color-ink-muted)]">
                  Suggested questions
                </p>
                <div className="flex flex-col gap-1.5">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-left text-xs font-medium text-[var(--color-ink-light)] p-2.5 border border-[var(--color-border)] rounded-xl hover:border-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all leading-snug"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-start">
                <div className="bg-[var(--color-cream)] border border-[var(--color-border)] p-3.5 flex items-center gap-2 rounded-2xl shadow-sm">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Save / New Conversation toolbar */}
          <AnimatePresence>
            {hasConversation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-cream)] flex items-center gap-2 shrink-0 overflow-hidden"
              >
                {onSaveInterview && (
                  <button
                    onClick={handleSaveInterview}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${saved
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-[var(--color-border)] bg-[var(--color-cream)] text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)] hover:shadow-sm'
                      }`}
                  >
                    <BookmarkCheck className="w-3 h-3" />
                    {saved ? 'Changes Saved!' : 'Save Progress'}
                  </button>
                )}
                <button
                  onClick={handleNewConversation}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)] hover:shadow-sm transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  New Conversation
                </button>
                <AnimatePresence>
                  {showSaveConfirm && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] font-medium text-emerald-500 ml-1"
                    >
                      ✓ Saved to sidebar
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-cream)] shrink-0 transition-colors rounded-b-2xl">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                rows={1}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResizeTextarea();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Ask ${persona.label} a question…`}
                className="w-full resize-none text-sm p-3 pr-12 border border-[var(--color-border)] rounded-xl bg-[var(--color-cream-warm)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all leading-relaxed"
                style={{ minHeight: '36px', maxHeight: '130px' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-lg shadow-sm hover:shadow-md hover:bg-emerald-600 transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 px-0.5">
              <span className="text-[10px] font-medium text-[var(--color-ink-muted)]">Shift+Enter for newline</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Simulated Research</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
