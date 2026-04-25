import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const AGENT_KEY = process.env.REACT_APP_GEMINI_AGENT_KEY;
const AGENT_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AGENT_KEY}`;

const QUICK_QUESTIONS = {
  en: [
    'How to treat leaf blight?',
    'Best fertilizer for tomatoes?',
    'When to irrigate rice?',
  ],
  hi: [
    'पत्ती झुलसा का इलाज?',
    'टमाटर के लिए सबसे अच्छा खाद?',
    'चावल में सिंचाई कब करें?',
  ],
  kn: [
    'ಎಲೆ ಬ್ಲೈಟ್ ಚಿಕಿತ್ಸೆ?',
    'ಟೊಮೇಟೋಗೆ ಉತ್ತಮ ಗೊಬ್ಬರ?',
    'ಭತ್ತಕ್ಕೆ ನೀರು ಯಾವಾಗ?',
  ],
};

async function askGemini(messages) {
  const systemPrompt = `You are AgriLens AI, a helpful farming assistant. You answer questions about crops, diseases, pests, fertilizers, weather, irrigation, and farming practices. Keep answers concise (2-4 sentences max). Be friendly and practical. If the user writes in Hindi or Kannada, respond in the same language.`;

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood! I\'m AgriLens AI, ready to help with farming questions.' }] },
    ...messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    })),
  ];

  try {
    const res = await fetch(AGENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!res.ok) throw new Error(`Agent API error: ${res.status}`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that. Please try again.';
  } catch (err) {
    console.error('Agent error:', err);
    return 'I\'m having trouble connecting right now. Please check your connection and try again.';
  }
}

export default function AskAgent() {
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{ role: 'bot', text: t('agent.greeting') }]);
    }
  };

  const handleSend = async (text) => {
    const msgText = text || input.trim();
    if (!msgText) return;

    const userMsg = { role: 'user', text: msgText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    const chatHistory = newMessages.filter(m => m.role === 'user' || m.role === 'bot').map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      text: m.text,
    }));

    const reply = await askGemini(chatHistory);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'bot', text: reply }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQs = QUICK_QUESTIONS[lang] || QUICK_QUESTIONS.en;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="ask-agent-fab"
          aria-label="Ask AgriLens AI"
        >
          <svg viewBox="0 0 24 24" fill="none" style={{ width: '1.5rem', height: '1.5rem' }} stroke="currentColor" strokeWidth="1.5">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ask-agent-fab-pulse" />
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="ask-agent-box">
          {/* Header */}
          <div className="ask-agent-header">
            <div>
              <h3 className="ask-agent-title">{t('agent.title')}</h3>
              <p className="ask-agent-subtitle">{t('agent.subtitle')}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ask-agent-close"
              aria-label="Close chat"
            >
              <svg viewBox="0 0 16 16" fill="none" style={{ width: '0.875rem', height: '0.875rem' }} stroke="currentColor" strokeWidth="2">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="ask-agent-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`ask-agent-msg ${msg.role === 'user' ? 'ask-agent-msg-user' : 'ask-agent-msg-bot'}`}
              >
                {msg.text}
              </div>
            ))}

            {isTyping && (
              <div className="ask-agent-msg ask-agent-msg-bot">
                <span className="ask-agent-typing">
                  <span /><span /><span />
                </span>
              </div>
            )}

            {/* Quick Suggestions — only when conversation just started */}
            {messages.length <= 1 && !isTyping && (
              <div className="ask-agent-quick">
                {quickQs.map((q, i) => (
                  <button key={i} onClick={() => handleSend(q)} className="ask-agent-quick-btn">
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ask-agent-input-bar">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('agent.placeholder')}
              className="ask-agent-input"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="ask-agent-send"
              aria-label="Send message"
            >
              <svg viewBox="0 0 16 16" fill="none" style={{ width: '1rem', height: '1rem' }} stroke="currentColor" strokeWidth="2">
                <path d="M14 2L7 9M14 2l-5 12-2-5-5-2 12-5z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
