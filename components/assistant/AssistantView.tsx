'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Share2,
  Bookmark,
  RotateCcw,
  Check,
  Bot,
  User,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { ChatMessage, ConversationItem } from '@/types';
import { DatabaseService } from '@/services/databaseService';
import { HelpfulFeedback } from '@/components/common/HelpfulFeedback';

interface AssistantViewProps {
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  initialQuery,
  onClearInitialQuery,
}) => {
  const { user, userProfile, recordUsage } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! Oli otyanno? I am **Mpa Help** 🇺🇬. How can I assist you with everyday life today? You can ask me to draft letters, review your monthly budget, write a WhatsApp business advert, create a CV, or translate into Luganda.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    // Check usage limits
    const allowed = await recordUsage('Ask Mpa Help');
    if (!allowed) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: queryText,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          conversationHistory: newHistory.filter((m) => m.id !== 'welcome'),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer.');
      }

      const botMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...newHistory, botMsg];
      setMessages(finalMessages);

      // Auto-save conversation state
      const conversationId = 'conv_' + (user?.uid || 'guest') + '_active';
      await DatabaseService.saveConversation({
        conversationId,
        userId: user?.uid || userProfile?.userId || 'guest',
        title: queryText.slice(0, 50),
        category: 'Ask Mpa Help',
        messages: finalMessages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run initial query if passed from Home
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      const timer = setTimeout(() => {
        handleSend(initialQuery.trim());
        if (onClearInitialQuery) onClearInitialQuery();
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);


  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);


  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Mpa Help 🇺🇬 Response',
          text,
        });
      } catch (e) {
        // User cancelled or not supported
        navigator.clipboard.writeText(text);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard for sharing!');
    }
  };

  const handleSaveDocument = async (msg: ChatMessage) => {
    try {
      const docItem = {
        documentId: 'doc_' + Date.now(),
        userId: user?.uid || userProfile?.userId || 'guest',
        type: 'general_message',
        title: msg.content.slice(0, 45) + '...',
        content: msg.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await DatabaseService.saveDocument(docItem);
      setSavedId(msg.id);
      setTimeout(() => setSavedId(null), 2500);
    } catch (e) {
      console.error(e);
      alert('Could not save document right now.');
    }
  };

  const handleRegenerate = () => {
    // Find last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      handleSend(lastUserMessage.content);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear current conversation?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Chat cleared. How can I help you today? Oli otyanno?',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white leading-tight">
              Ask Mpa Help
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Practical everyday AI assistant for Uganda
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition text-xs flex items-center gap-1"
          title="Clear Conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs mt-1">
                  M
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-xs ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 rounded-bl-xs'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Assistant Controls: Copy, Share, Save, Regenerate, Feedback */}
                {!isUser && msg.id !== 'welcome' && (
                  <div className="mt-2 space-y-2 w-full">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleShare(msg.content)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                        title="Share with WhatsApp / contacts"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => handleSaveDocument(msg)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                        title="Save to Saved Content"
                      >
                        {savedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3 h-3" />
                            <span>Save</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleRegenerate}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                        title="Regenerate answer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Regenerate</span>
                      </button>
                    </div>

                    {/* Feedback Rating */}
                    <HelpfulFeedback featureName="Ask Mpa Help" contextTitle={msg.content.slice(0, 30)} />
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0 font-bold text-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-stone-500 dark:text-stone-400 p-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl px-4 py-2.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 font-medium">Mpa Help is thinking...</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="pt-2 shrink-0">
        <div className="relative flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 focus-within:border-emerald-600 shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or request..."
            disabled={loading}
            className="flex-1 px-3 py-2.5 text-xs sm:text-sm bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-xs transition"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
