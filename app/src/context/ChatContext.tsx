import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabaseApi';
import { 
  PJ_STYLIST_SYSTEM_PROMPT, 
  CONVERSATION_STARTERS,
  FALLBACK_RESPONSES 
} from '../lib/pjStylistPrompt';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Kimi API configuration
const KIMI_API_URL = import.meta.env.VITE_KIMI_API_URL || 'https://api.moonshot.cn/v1/chat/completions';
const KIMI_API_KEY = import.meta.env.VITE_KIMI_API_KEY;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: CONVERSATION_STARTERS[Math.floor(Math.random() * CONVERSATION_STARTERS.length)],
      timestamp: new Date().toISOString()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { user } = useAuth();

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: CONVERSATION_STARTERS[Math.floor(Math.random() * CONVERSATION_STARTERS.length)],
      timestamp: new Date().toISOString()
    }]);
    setSessionId(null);
  }, []);

  // Initialize or get conversation session
  const getOrCreateSession = useCallback(async () => {
    if (sessionId) return sessionId;
    
    try {
      const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await supabase.from('ai_conversations').insert({
        session_id: newSessionId,
        customer_id: user?.id || null,
        agent_type: 'pj_stylist',
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      setSessionId(newSessionId);
      return newSessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  }, [sessionId, user?.id]);

  // Get contextual response based on message content
  const getContextualFallback = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('size') || lowerMsg.includes('fit') || lowerMsg.includes('measurement')) {
      return FALLBACK_RESPONSES.sizing[Math.floor(Math.random() * FALLBACK_RESPONSES.sizing.length)]
        .replace('{brand}', 'Properly Tied')
        .replace('{fit}', 'true to size');
    }
    
    if (lowerMsg.includes('wedding') || lowerMsg.includes('ring bearer') || lowerMsg.includes('formal')) {
      return FALLBACK_RESPONSES.wedding[Math.floor(Math.random() * FALLBACK_RESPONSES.wedding.length)];
    }
    
    if (lowerMsg.includes('gift') || lowerMsg.includes('present')) {
      return FALLBACK_RESPONSES.gift[Math.floor(Math.random() * FALLBACK_RESPONSES.gift.length)];
    }
    
    if (lowerMsg.includes('outfit') || lowerMsg.includes('recommend') || lowerMsg.includes('suggest')) {
      return FALLBACK_RESPONSES.outfitRequest[Math.floor(Math.random() * FALLBACK_RESPONSES.outfitRequest.length)];
    }
    
    if (lowerMsg.includes('polo') || lowerMsg.includes('short') || lowerMsg.includes('shirt') || lowerMsg.includes('blazer')) {
      return FALLBACK_RESPONSES.product[Math.floor(Math.random() * FALLBACK_RESPONSES.product.length)]
        .replace('{product}', 'Classic Polo')
        .replace('{material}', 'premium pima cotton')
        .replace('{occasion}', 'school and special events');
    }
    
    return FALLBACK_RESPONSES.default[Math.floor(Math.random() * FALLBACK_RESPONSES.default.length)];
  };

  const sendMessage = useCallback(async (content: string) => {
    // Add user message immediately
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Get or create session
      const currentSessionId = await getOrCreateSession();

      // Save user message to Supabase
      if (currentSessionId) {
        await supabase.rpc('append_conversation_message', {
          p_session_id: currentSessionId,
          p_message: {
            role: 'user',
            content,
            timestamp: new Date().toISOString()
          }
        });
      }

      // Check if Kimi API is configured
      if (!KIMI_API_KEY || !KIMI_API_KEY.startsWith('sk-')) {
        console.warn('Kimi API key not configured, using fallback responses');
        await new Promise(r => setTimeout(r, 800));
        
        const fallbackResponse = getContextualFallback(content);
        
        const assistantMsg: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: fallbackResponse,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        
        // Save assistant message to Supabase
        if (currentSessionId) {
          await supabase.rpc('append_conversation_message', {
            p_session_id: currentSessionId,
            p_message: {
              role: 'assistant',
              content: fallbackResponse,
              timestamp: new Date().toISOString()
            }
          });
        }
        
        setIsTyping(false);
        return;
      }

      // Call Kimi API with full system prompt
      const response = await fetch(KIMI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIMI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'kimi-k2-0711-preview',
          messages: [
            { role: 'system', content: PJ_STYLIST_SYSTEM_PROMPT },
            ...messages.filter(m => m.id !== 'welcome').map(m => ({ 
              role: m.role, 
              content: m.content 
            })),
            { role: 'user', content }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Kimi API error:', response.status, errorData);
        throw new Error(`Kimi API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || 
        "I apologize, but I'm having trouble processing that. How else can I help you today?";

      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Save assistant message to Supabase
      if (currentSessionId) {
        await supabase.rpc('append_conversation_message', {
          p_session_id: currentSessionId,
          p_message: {
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toISOString()
          }
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Use fallback on error
      const fallbackResponse = getContextualFallback(content);
      
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, getOrCreateSession, user?.id]);

  return (
    <ChatContext.Provider value={{ 
      isOpen, 
      messages, 
      isTyping, 
      openChat, 
      closeChat, 
      sendMessage,
      clearChat 
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
