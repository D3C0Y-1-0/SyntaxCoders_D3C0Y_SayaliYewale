import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Bot, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockChatbotResponses } from '../../data/mockData';

interface ChatMessage {
  id: string;
  sender: 'chitti' | 'user';
  text: string;
  timestamp: string;
}

export const ChittiMascotAssistant: React.FC = () => {
  const [inputVal, setInputVal] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [eyeBlink, setEyeBlink] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'chitti',
      text: 'Hey! I\'m CHITTI, Your Cyber Guardian. I have correlated your enterprise assets with incoming threat advisories. How can I help you today?',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Blinking eyes animation interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 240);
    }, 4500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, chatOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setChatOpen(true);
    setIsTyping(true);

    // AI Response generation
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = mockChatbotResponses.default;

      if (lower.includes('cve') || lower.includes('38077') || lower.includes('rce') || lower.includes('vulnerability')) {
        reply = mockChatbotResponses.cve;
      } else if (lower.includes('threat') || lower.includes('count') || lower.includes('active')) {
        reply = mockChatbotResponses.threat;
      } else if (lower.includes('malware') || lower.includes('cobalt') || lower.includes('beacon')) {
        reply = mockChatbotResponses.malware;
      } else if (lower.includes('status') || lower.includes('safe') || lower.includes('health')) {
        reply = mockChatbotResponses.status;
      }

      const botMsg: ChatMessage = {
        id: `c-${Date.now()}`,
        sender: 'chitti',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D-Style Futuristic CHITTI Mascot Robot */}
      <div className="relative z-10 -mb-6 flex justify-center animate-float select-none">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32">
          {/* Subtle mascot glow */}
          <div className="absolute inset-2 bg-gradient-to-t from-blue-600/30 via-cyan-400/20 to-lime-400/20 blur-xl rounded-full" />

          {/* SVG Robot Mascot */}
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
            <defs>
              <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>
              <linearGradient id="robotDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0B101D" />
              </linearGradient>
              <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="100%" stopColor="#050B18" />
              </linearGradient>
            </defs>

            {/* Lime Antenna with Glowing Orbs */}
            <path d="M 80 34 L 80 18" stroke="#C6F432" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="80" cy="14" r="5" fill="#C6F432" className="animate-pulse" />
            <circle cx="80" cy="14" r="9" fill="#C6F432" opacity="0.35" />

            {/* Left Ear Antenna */}
            <path d="M 38 65 L 26 58" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="23" cy="56" r="4" fill="#C6F432" />

            {/* Right Ear Antenna */}
            <path d="M 122 65 L 134 58" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="137" cy="56" r="4" fill="#C6F432" />

            {/* Robot Head Helmet (White/Silver Chrome) */}
            <rect
              x="36"
              y="32"
              width="88"
              height="68"
              rx="34"
              fill="url(#robotBodyGrad)"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />

            {/* Inner Black Visor Screen */}
            <rect
              x="44"
              y="42"
              width="72"
              height="48"
              rx="24"
              fill="url(#visorGrad)"
              stroke="#1E293B"
              strokeWidth="1.5"
            />

            {/* Expressive Glowing Cyan/Lime Eyes */}
            {eyeBlink ? (
              // Closed blinking line
              <>
                <line x1="56" y1="66" x2="68" y2="66" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                <line x1="92" y1="66" x2="104" y2="66" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              // Open glowing pill eyes with happy curves
              <>
                <g className="transition-all duration-150">
                  <ellipse cx="62" cy="65" rx="6.5" ry="8" fill="#38BDF8" />
                  <ellipse cx="64" cy="63" rx="2" ry="2.5" fill="#FFFFFF" />
                  <circle cx="62" cy="65" r="9" fill="#38BDF8" opacity="0.25" />
                </g>
                <g className="transition-all duration-150">
                  <ellipse cx="98" cy="65" rx="6.5" ry="8" fill="#38BDF8" />
                  <ellipse cx="100" cy="63" rx="2" ry="2.5" fill="#FFFFFF" />
                  <circle cx="98" cy="65" r="9" fill="#38BDF8" opacity="0.25" />
                </g>
              </>
            )}

            {/* Subtle friendly mouth light */}
            <path
              d="M 74 77 Q 80 81 86 77"
              stroke="#C6F432"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />

            {/* Robot Neck & Torso */}
            <rect x="68" y="100" width="24" height="8" rx="4" fill="#64748B" />
            <path
              d="M 48 108 C 48 104, 112 104, 112 108 L 120 135 C 120 142, 40 142, 40 135 Z"
              fill="url(#robotBodyGrad)"
              stroke="#CBD5E1"
              strokeWidth="1"
            />

            {/* Chest Center Arc Reactor / Power Core */}
            <circle cx="80" cy="122" r="7" fill="#0B101D" stroke="#C6F432" strokeWidth="1.5" />
            <circle cx="80" cy="122" r="3.5" fill="#C6F432" className="animate-pulse" />

            {/* Cute Hands resting forward */}
            <circle cx="48" cy="132" r="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
            <circle cx="112" cy="132" r="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Glass Speech Bubble / Card */}
      <div className="w-full glass-card p-5 sm:p-6 pt-8 relative overflow-hidden group">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-[#C6F432]/10 blur-2xl rounded-full pointer-events-none" />

        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-display font-medium text-white tracking-wide">
            Hey! I'm <span className="text-[#C6F432] font-semibold tracking-wider drop-shadow-[0_0_12px_rgba(198,244,50,0.4)]">CHITTI</span>
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-300">
            Your Cyber Guardian.
          </div>
          <div className="text-sm font-display italic text-[#9AA0A6] pt-1">
            How can I help you today?
          </div>
        </div>

        {/* Input Bar with Lime Send Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-4 relative flex items-center"
        >
          <div className="relative w-full flex items-center">
            <span className="absolute left-3.5 text-[#C6F432]">
              <Sparkles className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Ask me anything…"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onFocus={() => {
                if (messages.length > 1) setChatOpen(true);
              }}
              className="w-full pl-10 pr-12 py-3 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-[#C6F432]/70 focus:bg-[#0B101D] text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              aria-label="Send message to CHITTI"
              className="absolute right-1.5 w-8 h-8 rounded-full bg-[#C6F432] hover:bg-[#b5e324] disabled:opacity-40 disabled:hover:bg-[#C6F432] text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(198,244,50,0.35)] cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => handleSendMessage('Check CVE-2024-38077 impact')}
            className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-[#C6F432] transition-colors"
          >
            🔍 CVE-2024-38077
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('Summarize active threats')}
            className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-[#C6F432] transition-colors"
          >
            ⚡ Active Threats
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('System defense status')}
            className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-[#C6F432] transition-colors"
          >
            🛡️ Security Status
          </button>
        </div>
      </div>

      {/* Interactive Chat Dialog / Drawer Modal */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 bottom-20 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[420px] h-[520px] bg-[#090D15]/95 border border-[#C6F432]/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#C6F432]/10 border border-[#C6F432]/50 flex items-center justify-center text-[#C6F432]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>CHITTI Cyber Guardian</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432] animate-pulse" />
                  </div>
                  <div className="text-[10px] text-slate-400">AI Threat Intelligence Co-Pilot</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#C6F432] text-black font-medium rounded-br-sm'
                        : 'bg-white/[0.05] border border-white/10 text-slate-100 rounded-bl-sm shadow-md'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/[0.04] text-slate-400 w-24">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432] animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input in Dialog */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-white/10 bg-[#05070A]/80 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask CHITTI about threats or mitigations..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 outline-none focus:border-[#C6F432]"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="p-2 rounded-xl bg-[#C6F432] hover:bg-[#b5e324] disabled:opacity-40 text-black cursor-pointer transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
