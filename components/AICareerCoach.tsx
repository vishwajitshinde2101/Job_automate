import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Send, Trash2, Loader2, User, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchWithTimeout, API_BASE_URL } from '../src/utils/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTION_CHIPS = [
  'How do I transition to a Data Science role?',
  'What skills do I need as a Senior Java Developer?',
  'How should I prepare for technical interviews?',
  'Help me plan a 6-month career roadmap',
  'How to negotiate salary for a new offer?',
  'What are the most in-demand tech skills in 2025?',
  'How to improve my LinkedIn profile?',
  'Which certifications should I pursue for cloud?',
];

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

const renderContent = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line → spacer
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
      i++;
      continue;
    }

    // Heading: ### or ## or #
    const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      elements.push(
        <p key={i} className="font-bold text-white mt-1">
          {renderInline(headingMatch[2])}
        </p>
      );
      i++;
      continue;
    }

    // Bullet: starts with - or •
    if (/^[-•]\s/.test(line)) {
      const bullets: string[] = [];
      while (i < lines.length && /^[-•]\s/.test(lines[i])) {
        bullets.push(lines[i].replace(/^[-•]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1 my-1">
          {bullets.map((b, bi) => (
            <li key={bi} className="flex gap-2 items-start">
              <span className="text-neon-purple mt-0.5 flex-shrink-0">•</span>
              <span>{renderInline(b)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list: 1. 2. 3.
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1 my-1 list-none">
          {items.map((item, ii) => (
            <li key={ii} className="flex gap-2 items-start">
              <span className="text-neon-purple font-semibold flex-shrink-0 min-w-[16px]">{ii + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
};

const renderInline = (text: string): React.ReactNode => {
  // Handle **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono text-neon-blue">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

// ─── Component ───────────────────────────────────────────────────────────────

const AICareerCoach: React.FC = () => {
  const { user } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Derive display name
  const rawName: string = (user as any).username || (user as any).firstName || (user as any).email?.split('@')[0] || 'there';
  const firstName = rawName.split(' ')[0];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  }, [input]);

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token') || '';

      const response = await fetchWithTimeout(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          userName: rawName,
          userConfig: (user as any).config || null,
        }),
        timeout: 60000,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(data.error || 'No reply received');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)', minHeight: '560px' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple/20 to-purple-700/20 border border-neon-purple/30 flex items-center justify-center shadow-lg shadow-neon-purple/10">
              <BrainCircuit className="w-5 h-5 text-neon-purple" />
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-dark-900" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">AI Career Coach</h2>
            <p className="text-xs text-gray-400">Personalized tech career guidance</p>
          </div>
        </div>

        {hasMessages && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-400 text-xs transition-colors rounded-lg hover:bg-red-400/5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear chat
          </button>
        )}
      </div>

      {/* ── Messages area ── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 bg-dark-900 border border-white/10 rounded-2xl overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      >
        {!hasMessages ? (
          /* ── Welcome / Empty state ── */
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10">
            {/* Avatar */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple/25 to-purple-700/25 border border-neon-purple/30 flex items-center justify-center shadow-xl shadow-neon-purple/15">
                <BrainCircuit className="w-10 h-10 text-neon-purple" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-neon-blue/40 to-neon-purple/40 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Hey {firstName}! 👋
            </h3>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed mb-1">
              I'm your <span className="text-neon-purple font-semibold">AI Career Coach</span> — here to guide you through every step of your tech career.
            </p>
            <p className="text-gray-500 text-xs max-w-sm mb-7">
              Ask me anything — career planning, skill gaps, interview prep, resume tips, salary advice, and more.
            </p>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="px-3 py-2 bg-dark-800 border border-white/10 rounded-xl text-gray-300 text-xs hover:border-neon-purple/40 hover:bg-neon-purple/5 hover:text-white transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Chat messages ── */
          <div className="p-4 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-neon-purple/20 to-purple-700/20 border border-neon-purple/30'
                      : 'bg-neon-blue/10 border border-neon-blue/20'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <BrainCircuit className="w-4 h-4 text-neon-purple" />
                  ) : (
                    <User className="w-4 h-4 text-neon-blue" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[78%] px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-neon-blue/10 border border-neon-blue/20 text-gray-100 rounded-2xl rounded-tr-sm'
                      : 'bg-dark-800 border border-white/10 text-gray-200 rounded-2xl rounded-tl-sm'
                  }`}
                >
                  <div className="space-y-1.5">
                    {msg.role === 'assistant' ? renderContent(msg.content) : <p className="leading-relaxed">{msg.content}</p>}
                  </div>
                  <p className="text-[10px] mt-2 opacity-30 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-neon-purple/20 to-purple-700/20 border border-neon-purple/30">
                  <BrainCircuit className="w-4 h-4 text-neon-purple" />
                </div>
                <div className="bg-dark-800 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 rounded-full bg-neon-purple/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-neon-purple/70 animate-bounce" style={{ animationDelay: '160ms' }} />
                    <span className="w-2 h-2 rounded-full bg-neon-purple/70 animate-bounce" style={{ animationDelay: '320ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input area ── */}
      <div className="mt-3 flex-shrink-0">
        <div className="bg-dark-800 border border-white/10 rounded-2xl px-4 py-3 flex items-end gap-3 focus-within:border-neon-purple/40 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your Career Coach anything… (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent text-white text-sm resize-none focus:outline-none placeholder-gray-600 leading-relaxed"
            style={{ maxHeight: '128px', overflowY: 'auto', scrollbarWidth: 'none' }}
            disabled={isTyping}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-xl bg-neon-purple flex items-center justify-center text-white hover:bg-purple-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-1.5">
          Enter to send &nbsp;·&nbsp; Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AICareerCoach;
