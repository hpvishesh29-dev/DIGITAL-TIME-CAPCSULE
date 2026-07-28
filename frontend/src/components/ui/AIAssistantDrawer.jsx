import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Copy, Check, Trash2, Loader2, Sparkles } from 'lucide-react';
import { useMemory } from '../../context/MemoryContext';
import { api } from '../../services/api';

const generateMemoryStory = (memory) => {
  const prompts = [
    `This memory of "${memory.title}" captures a moment worth preserving. Take time to reflect on what makes it meaningful and the emotions it evokes.`,
    `"${memory.title}" - a moment frozen in time. What was going through your mind when this was captured? What makes it unique and worth cherishing?`,
    `Looking at "${memory.title}", think about the people involved, the place where it happened, and why this moment was worth preserving.`,
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
};

const Message = memo(({ msg }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [msg.text]);

  return (
    <div className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
          msg.role === 'user'
            ? 'bg-gradient-vibrant text-white rounded-br-md shadow-neon-indigo'
            : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
        {msg.role === 'assistant' && (
          <button
            onClick={handleCopy}
            className="mt-2 text-[10px] text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});

Message.displayName = 'Message';

export const AIAssistantDrawer = memo(() => {
  const { selectedMemory, isAIAssistantOpen, setIsAIAssistantOpen, memories } = useMemory();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (isAIAssistantOpen && selectedMemory && messages.length === 0) {
      const initialStory = generateMemoryStory(selectedMemory);
      setMessages([
        { role: 'assistant', text: initialStory },
      ]);
    }
  }, [isAIAssistantOpen, selectedMemory]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isGenerating]);

  const sendQuery = useCallback(async (queryText) => {
    if (!queryText || !queryText.trim()) return;

    const userMessage = queryText.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsGenerating(true);

    try {
      const data = await api.aiChat(userMessage, messages, memories);
      const aiReply = data?.response || "I've processed your query against your spatial time capsule vault.";
      setMessages((prev) => [...prev, { role: 'assistant', text: aiReply }]);
    } catch (error) {
      console.warn('Backend AI Chat fallback:', error);
      const fallbackReply = `I am Chrona AI. I have reviewed your ${memories.length} preserved time capsules. How can I help you reflect on your memories today?`;
      setMessages((prev) => [...prev, { role: 'assistant', text: fallbackReply }]);
    } finally {
      setIsGenerating(false);
    }
  }, [messages, memories]);

  const handleSendMessage = useCallback(() => {
    sendQuery(input);
  }, [input, sendQuery]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const handleClose = useCallback(() => {
    setIsAIAssistantOpen(false);
  }, [setIsAIAssistantOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const SUGGESTIONS = [
    "🔮 Summarize my preserved memories",
    "✨ Analyze my emotional patterns",
    "🌌 Give me a spatial life recap",
    "💡 Ideas for my next capsule"
  ];

  if (!isAIAssistantOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6"
        style={{
          background: 'rgba(5, 8, 16, 0.65)',
          backdropFilter: 'blur(12px)',
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:w-[400px] h-[75vh] sm:h-[600px] rounded-t-[28px] sm:rounded-[28px] glass-panel border border-white/20 shadow-glass-glow overflow-hidden flex flex-col bg-slate-900/95"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900/90 z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-vibrant flex items-center justify-center shadow-neon-indigo shrink-0">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">Chrona Gemini AI Assistant</h3>
                {selectedMemory ? (
                  <p className="text-[11px] text-cyan-300 font-medium mt-0.5 truncate max-w-[200px]">
                    {selectedMemory.title}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-mono">Spatial Vault Active</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Close AI Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center px-4 py-6">
                <Sparkles className="w-8 h-8 text-indigo-400 mb-3 animate-pulse" />
                <p className="text-slate-300 text-xs font-semibold mb-4">
                  {selectedMemory
                    ? `Reflecting on "${selectedMemory.title}"`
                    : 'Ask me anything about your time capsules, life recaps, or emotion patterns.'}
                </p>
                <div className="w-full space-y-2">
                  {SUGGESTIONS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendQuery(prompt)}
                      className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-white/15 text-slate-200 hover:text-white hover:border-cyan-400/60 hover:bg-slate-800 text-xs text-left font-medium transition-all shadow-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <Message key={idx} msg={msg} />
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-slate-950/80 text-slate-300 px-4 py-3 rounded-2xl rounded-bl-md border border-white/15 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span className="text-xs text-cyan-300 font-medium">Analyzing spatial vault...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 space-y-2 shrink-0 bg-slate-900/90 z-10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your memories..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-slate-950/90 text-white placeholder-slate-400 transition-all text-xs font-medium"
                disabled={isGenerating}
              />
              <button
                onClick={handleSendMessage}
                disabled={isGenerating || !input.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-vibrant text-white hover:shadow-neon-cyan transition-all disabled:opacity-50 flex items-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleClearChat}
              className="w-full px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 font-semibold"
            >
              <Trash2 className="w-3 h-3" />
              Clear Chat History
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

AIAssistantDrawer.displayName = 'AIAssistantDrawer';
