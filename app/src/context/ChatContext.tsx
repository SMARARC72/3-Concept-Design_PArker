import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabaseApi';

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

// System prompt for PJ Stylist
const SYSTEM_PROMPT = `You are PJ Stylist, a friendly and knowledgeable AI shopping assistant for ParkerJoe, a premium children's clothing boutique specializing in boys' apparel (sizes 2T-16).

Your personality:
- Warm, helpful, and conversational like a personal stylist
- Knowledgeable about children's fashion, sizing, and fit
- Understanding of parenting needs and children's comfort
- Enthusiastic about classic, timeless styles with modern touches

Key information about ParkerJoe:
- Founded in 2019 in Austin, Texas
- Curated selection of high-quality boys' clothing
- Brands include: Properly Tied, J.Bailey, Southern Tide, Little English, Bailey Boys
- Categories: Apparel, Shoes, Accessories, Dresswear, Western, Toys & Books
- Size range: 2T through 16
- Known for: Classic polo shirts, chino shorts, dresswear, casual play clothes

Services you can help with:
- Outfit recommendations for specific occasions (weddings, church, school, photos)
- Size and fit guidance
- Gift suggestions with age-appropriate options
- Style advice for mixing and matching pieces
- Information about current collections and trends
- Order tracking and store information

Important guidelines:
- Always consider age-appropriateness and comfort for children
- Ask clarifying questions about size, occasion, or preferences when needed
- Be mindful of budget considerations
- Emphasize quality and durability of products
- If asked about inventory, direct customers to check the website or visit a store
- For order-specific questions, suggest contacting customer service directly

COPPA Compliance: You must not collect or store personal information from children under 13. If a child appears to be using the chat without parental supervision, gently suggest they ask a parent to continue the conversation.`;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm PJ Stylist, your personal shopping assistant. How can I help you find the perfect outfit today?",
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
      content: "Hi! I'm PJ Stylist, your personal shopping assistant. How can I help you find the perfect outfit today?",
      timestamp: new Date().toISOString()
    }]);
    setSessionId(null);
  }, []);

  // Initialize or get conversation session
  const getOrCreateSession = useCallback(async () => {
    if (sessionId) return sessionId;
    
    try {
      // Create session in Supabase
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
      if (!KIMI_API_KEY) {
        // Fallback responses when API is not configured
        await new Promise(r => setTimeout(r, 1000));
        
        const fallbackResponses = [
          "I'd be happy to help you find the perfect outfit! What occasion are you shopping for?",
          "Great question! For that age, I'd recommend checking out our size chart. Would you like me to guide you to it?",
          "Those chino shorts are one of our bestsellers! They come in several colors and pair perfectly with our polo shirts.",
          "For a wedding, I'd suggest our dresswear collection. The Properly Tied blazers are especially popular for special occasions.",
          "I'd love to help you put together a complete outfit! What's his favorite color?",
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        const assistantMsg: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: randomResponse,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        
        // Save assistant message to Supabase
        if (currentSessionId) {
          await supabase.rpc('append_conversation_message', {
            p_session_id: currentSessionId,
            p_message: {
              role: 'assistant',
              content: randomResponse,
              timestamp: new Date().toISOString()
            }
          });
        }
        
        setIsTyping(false);
        return;
      }

      // Call Kimi API
      const response = await fetch(KIMI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIMI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'kimi-k2-0711-preview', // Latest Kimi model
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Kimi API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request. How else can I help you?";

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
      
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment, or feel free to browse our collections!",
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
