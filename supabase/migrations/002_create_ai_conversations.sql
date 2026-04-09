-- AI Conversations Table (COPPA: 30-day retention)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  agent_type text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- COPPA fields
  user_declared_age integer,
  coppa_flagged boolean DEFAULT false,
  
  -- Auto-delete after 30 days
  expires_at timestamptz DEFAULT now() + interval '30 days'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_customer ON ai_conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_expires ON ai_conversations(expires_at);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view own conversations"
  ON ai_conversations FOR SELECT
  USING (customer_id::text = auth.uid()::text);
