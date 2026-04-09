-- Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  shopify_product_id bigint NOT NULL,
  recommendation_type text NOT NULL,
  score decimal(5,4) NOT NULL,
  reason text,
  context jsonb DEFAULT '{}',
  shown_at timestamptz,
  clicked_at timestamptz,
  converted_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Recommendation Types Enum (using CHECK constraint)
ALTER TABLE recommendations
  ADD CONSTRAINT valid_recommendation_type
  CHECK (recommendation_type IN (
    'similar_items',
    'frequently_bought',
    'trending',
    'personalized',
    'complementary',
    'new_arrival',
    'price_drop'
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_customer ON recommendations(customer_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_product ON recommendations(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendations_created ON recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_expires ON recommendations(expires_at);

-- Enable RLS
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  USING (customer_id::text = auth.uid()::text);

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  USING (customer_id::text = auth.uid()::text);
