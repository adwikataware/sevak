import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Paperclip, Mic } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hello! I am your CivicPulse AI assistant. How can I help you improve our city today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      // Automatically send if needed, or just let user review
    };
    recognition.start();
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (overrideValue) => {
    const textToSend = overrideValue || inputValue;
    if (!textToSend.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'pune-slug' 
        },
        body: JSON.stringify({ 
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          tenantId: 'pune-slug' 
        })
      });

      const data = await response.json();
      const botReply = data.reply || data.text || "I've processed your request. How else can I help?";
      
      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
      speak(botReply); // Make the bot speak the response
    } catch (error) {
      console.error("Chat error:", error);
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: "I'm currently optimizing my connection to the city servers. (Demo Mode: Connection to backend failed)",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`chatbot-wrapper ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <div className="pulse-ring"></div>
          <MessageSquare size={28} />
          <span className="toggle-label">Ask AI</span>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="header-info">
              <div className="bot-avatar">
                <Bot size={20} />
              </div>
              <div>
                <h4>Civic Assistant</h4>
                <div className="status-indicator">
                  <span className="dot"></span> Online
                </div>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-row ${msg.role === 'user' ? 'user' : 'bot'}`}>
                <div className="message-bubble">
                  <p>{msg.content}</p>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message-row bot">
                <div className="message-bubble typing">
                  <Loader2 size={16} className="spinner" /> AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <div className="input-actions">
              <button className="action-icon" title="Attach Image"><Paperclip size={18} /></button>
              <button 
                className={`action-icon ${isRecording ? 'recording' : ''}`} 
                onClick={startVoiceRecognition}
                title="Voice Input"
                style={{ color: isRecording ? 'var(--danger)' : 'inherit' }}
              >
                <Mic size={18} />
              </button>
            </div>
            <input 
              type="text" 
              placeholder={isRecording ? "Listening..." : "Ask about a complaint..."} 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isRecording}
            />
            <button className="send-btn" onClick={() => handleSend()} disabled={!inputValue.trim() || isRecording}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
