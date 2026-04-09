-- Style Quizzes Table
CREATE TABLE IF NOT EXISTS style_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  quiz_type text NOT NULL DEFAULT 'style_profile',
  answers jsonb NOT NULL DEFAULT '{}',
  results jsonb,
  recommended_style_tags text[] DEFAULT '{}',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_style_quizzes_customer ON style_quizzes(customer_id);
CREATE INDEX IF NOT EXISTS idx_style_quizzes_type ON style_quizzes(quiz_type);
CREATE INDEX IF NOT EXISTS idx_style_quizzes_created ON style_quizzes(created_at);

-- Enable RLS
ALTER TABLE style_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quizzes"
  ON style_quizzes FOR SELECT
  USING (customer_id::text = auth.uid()::text);

CREATE POLICY "Users can manage own quizzes"
  ON style_quizzes FOR ALL
  USING (customer_id::text = auth.uid()::text);
