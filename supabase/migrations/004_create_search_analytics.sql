-- Search Analytics Table
CREATE TABLE IF NOT EXISTS search_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE SET NULL,
  session_id text,
  query_text text NOT NULL,
  query_embedding vector(1536),
  filters_used jsonb DEFAULT '{}',
  results_count integer,
  clicked_product_ids bigint[],
  click_position integer,
  conversion_value decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_search_analytics_customer ON search_analytics(customer_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_session ON search_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created ON search_analytics(created_at);

-- Enable RLS
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own search analytics"
  ON search_analytics FOR SELECT
  USING (customer_id::text = auth.uid()::text);
