import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  Building2,
  Compass,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiCareerAssistantView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello ${user?.fullName || 'Alex'}! I'm your CareerBridge AI Copilot powered by Google Gemini. I have direct context on your ${profile?.degree || 'computer science coursework'}, projects, and active Google & Microsoft openings. How can I help accelerate your search today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    'Which Google opportunities am I eligible for right now?',
    'How can I prepare for a Microsoft Azure Systems interview?',
    'Draft a personalized note to Dr. Sarah Lin at DeepMind',
    'What skills should I learn to boost my resume ATS score past 95?',
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text }));
      const res = await api.chatCareerAssistant({
        message: textToSend,
        history,
      });

      const assistantMsg: Message = {
        id: `msg_asst_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an issue connecting to the AI model. Based on your profile, you are a strong match for Google SWE Intern 2027 and Microsoft AI Fellowship! Check out the Opportunities tab for verified requirements.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-7.5rem)] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">CareerBridge AI Copilot</h2>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Grounded in CMU coursework, projects, and verified Big Tech job requirements
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('opportunities')}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Compass className="h-3.5 w-3.5 text-blue-600" />
          <span>View Verified Jobs</span>
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-tr from-slate-900 to-slate-700 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-sky-400" />}
            </div>

            <div
              className={`group relative max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none font-sans'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              <div
                className={`mt-2 flex items-center justify-between text-[10px] ${
                  msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => copyText(msg.id, msg.text)}
                    className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-1 hover:text-slate-700 font-semibold"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Sparkles className="h-4 w-4 text-sky-400 animate-pulse" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                <span>Gemini is synthesizing recommendations...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-2">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-700 transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Ask about Google SWE requirements, outreach strategies, interview tips..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
