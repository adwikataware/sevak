'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Loader2, Paperclip, Mic } from 'lucide-react';
import { sendChatMessage } from '@/lib/civic-api';
import { Button } from './ui/Button';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
    setMessages([
      { id: 1, role: 'assistant', content: 'Hello! I am your CivicPulse AI assistant. How can I help you improve our city today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, hasMounted]);

  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Voice recognition not supported.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => setInputValue(event.results[0][0].transcript);
    recognition.start();
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (overrideValue?: string) => {
    const textToSend = overrideValue || inputValue;
    if (!textToSend.trim()) return;

    const userMessage: Message = { id: Date.now(), role: 'user', content: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const botReply = await sendChatMessage(newMessages.map(({ role, content }) => ({ role, content })));
      const botMessage: Message = { id: Date.now() + 1, role: 'assistant', content: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, botMessage]);
      speak(botReply);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Backend is offline. Please make sure the AI service is running on port 3000.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Inline token values so the widget works on ANY page (Tailwind admin, civic-app, etc.)
  const tokens: React.CSSProperties = {
    '--bg-color': '#f4f0eb',
    '--bg-secondary': '#fdfbf7',
    '--bg-tertiary': '#eae5d9',
    '--primary': '#1e1c1a',
    '--text-main': '#2b2826',
    '--text-muted': '#736c64',
    '--border-color': '#d1cbc1',
    '--accent': '#d96c4a',
    '--danger': '#c24127',
  } as React.CSSProperties;

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, ...tokens }}>
      {!isOpen && (
        <Button variant="icon" onClick={() => setIsOpen(true)} style={{ background: 'var(--primary)', color: 'white', borderRadius: '50px', padding: '1rem 1.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={22} />
          <span style={{ fontFamily: 'Inter', fontWeight: 600 }}>Ask AI</span>
        </Button>
      )}

      {isOpen && (
        <div style={{ width: '360px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}><Bot size={18} /></div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Civic Assistant</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>● Online</div>
              </div>
            </div>
            <Button variant="icon" onClick={() => setIsOpen(false)} style={{ color: 'white' }}><X size={18} /></Button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-tertiary)', color: msg.role === 'user' ? 'white' : 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  <p style={{ margin: 0 }}>{msg.content}</p>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginTop: '0.25rem', textAlign: 'right' }}>{msg.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button variant="icon" title="Attach" style={{ color: 'var(--text-muted)' }}><Paperclip size={16} /></Button>
            <Button variant="icon" onClick={startVoiceRecognition} style={{ color: isRecording ? 'var(--danger)' : 'var(--text-muted)' }}><Mic size={16} /></Button>
            <input
              type="text"
              placeholder={isRecording ? 'Listening...' : 'Ask about a complaint...'}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={isRecording}
              style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.8rem', fontSize: '0.9rem', fontFamily: 'Inter', background: 'transparent', color: 'var(--text-main)', outline: 'none' }}
            />
            <Button variant="icon" onClick={() => handleSend()} disabled={!inputValue.trim() || isRecording} style={{ color: 'var(--accent)' }}>
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
