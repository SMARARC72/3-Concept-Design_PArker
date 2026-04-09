import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Customer Profiles
export const customerApi = {
  async getProfile(customerId: string) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', customerId)
      .single();
    if (error) return null;
    return data;
  },

  async updateProfile(customerId: string, updates: any) {
    const { error } = await supabase
      .from('customer_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', customerId);
    return !error;
  }
};

// AI Conversations
export const conversationApi = {
  async createSession(customerId: string | null, agentType: string) {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { error } = await supabase
      .from('ai_conversations')
      .insert({ customer_id: customerId, session_id: sessionId, agent_type: agentType, messages: [] });
    return error ? null : sessionId;
  },

  async addMessage(sessionId: string, message: any) {
    const { data: conv } = await supabase
      .from('ai_conversations')
      .select('messages')
      .eq('session_id', sessionId)
      .single();
    
    const messages = conv?.messages || [];
    messages.push(message);
    
    const { error } = await supabase
      .from('ai_conversations')
      .update({ messages, updated_at: new Date().toISOString() })
      .eq('session_id', sessionId);
    return !error;
  }
};

export default supabase;
