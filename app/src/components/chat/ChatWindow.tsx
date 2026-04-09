import React, { useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '../../lib/utils';

export default function ChatWindow() {
  const { isOpen, closeChat, messages, isTyping, sendMessage } = useChat();
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50",
      "w-[380px] h-[600px]",
      "bg-white rounded-2xl shadow-2xl",
      "flex flex-col overflow-hidden",
      "border border-gray-100"
    )}>
      {/* Header */}
      <div className="bg-pj-navy px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">PJ Stylist</h3>
          <p className="text-white/70 text-xs">Personal Shopping Assistant</p>
        </div>
        <button onClick={closeChat} className="text-white/70 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pj-cream/30">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Hi! I'm PJ Stylist.</p>
            <p className="text-sm">How can I help you today?</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className={cn(
              "flex-1 px-4 py-2 rounded-full",
              "border border-gray-200",
              "focus:outline-none focus:border-pj-gold",
              "text-sm"
            )}
          />
          <button
            onClick={handleSend}
            className={cn(
              "w-10 h-10 rounded-full",
              "bg-pj-gold hover:bg-pj-gold/90",
              "flex items-center justify-center",
              "transition-colors"
            )}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
