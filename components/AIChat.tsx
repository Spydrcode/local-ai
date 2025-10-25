'use client';

import { Bot, Loader2, Maximize2, MessageCircle, Minimize2, Send, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIChatProps {
  demoId: string;
}

const AIChat: React.FC<AIChatProps> = ({ demoId }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI strategic advisor. I know all about your business analysis, action items, and recommendations. Ask me anything! For example:\n\n• Which action item should I tackle first?\n• How do I implement [specific recommendation]?\n• What's my biggest competitive threat?\n• Explain the ROI projections",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history (last 10 messages for context)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`/api/chat/${demoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What should I implement first?",
    "Explain my competitive advantages",
    "How can I increase revenue?",
    "What are my biggest risks?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <MessageCircle className="h-6 w-6 mr-2" />
            <h2 className="text-2xl font-bold">AI Strategic Advisor Chat</h2>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/80 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
          </button>
        </div>
        <p className="text-white/90">
          Ask questions about your analysis, get implementation guidance, and strategic advice
        </p>
      </div>

      {!isMinimized && (
        <>
          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-3">Try asking:</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-left text-sm text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-100 px-3 py-2 rounded border border-blue-200 transition-colors"
                  >
                    💡 {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-emerald-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your analysis, action items, or strategy..."
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h3 className="font-medium text-emerald-900 mb-2">Chat Tips:</h3>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• I have full context of your business analysis, insights, and roadmap</li>
              <li>• Ask for help prioritizing action items based on ROI and difficulty</li>
              <li>• Request specific implementation guidance for any recommendation</li>
              <li>• I can explain threats, opportunities, and competitive positioning</li>
            </ul>
          </div>
        </>
      )}

      {/* Call to Action */}
      <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Want Live Strategic Consulting?</h3>
        <p className="text-white/90 mb-4">
          Schedule a call with We Build Apps for personalized strategic guidance
        </p>
        <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Book Consultation
        </button>
      </div>
    </div>
  );
};

export default AIChat;
