-- =====================================================
-- PARKERJOE DATABASE MIGRATIONS
-- Run this in Supabase SQL Editor: 
-- https://supabase.com/dashboard/project/sqqocqjsonirxvgivupm/sql/new
-- =====================================================

-- Migration 1: Customer Profiles (COPPA Compliant)
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_customer_id bigint UNIQUE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_child_account boolean DEFAULT false,
  parental_consent_verified boolean DEFAULT false,
  parental_consent_method text,
  parental_consent_date timestamptz,
  preferred_brands text[] DEFAULT '{}',
  preferred_styles text[] DEFAULT '{}',
  size_preferences jsonb DEFAULT '{}',
  loyalty_points integer DEFAULT 0,
  loyalty_tier text DEFAULT 'bronze' CONSTRAINT valid_loyalty_tier CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  referral_code text UNIQUE,
  email_opt_in boolean DEFAULT true,
  sms_opt_in boolean DEFAULT false,
  data_retention_consent boolean DEFAULT true,
  last_consent_date timestamptz
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON customer_profiles FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON customer_profiles FOR UPDATE USING (auth.uid()::text = id::text);

-- Migration 2: AI Conversations (30-day retention for COPPA)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  agent_type text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_declared_age integer,
  coppa_flagged boolean DEFAULT false,
  expires_at timestamptz DEFAULT now() + interval '30 days'
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_expires ON ai_conversations(expires_at);
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON ai_conversations FOR SELECT USING (customer_id::text = auth.uid()::text);

-- Migration 3: Product Embeddings (for AI search)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS product_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_id bigint UNIQUE NOT NULL,
  product_handle text NOT NULL,
  title text NOT NULL,
  description text,
  embedding vector(1536),
  product_data jsonb,
  category text,
  tags text[],
  price decimal(10,2),
  available boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_embeddings_vector ON product_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
ALTER TABLE product_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product embeddings" ON product_embeddings FOR SELECT USING (true);

-- Migration 4: Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  product_id bigint NOT NULL,
  variant_id bigint,
  product_handle text NOT NULL,
  product_title text NOT NULL,
  product_image text,
  price decimal(10,2),
  added_at timestamptz DEFAULT now(),
  notes text,
  in_stock boolean DEFAULT true,
  UNIQUE(customer_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_customer ON wishlists(customer_id);
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wishlist" ON wishlists FOR SELECT USING (customer_id::text = auth.uid()::text);
CREATE POLICY "Users can modify own wishlist" ON wishlists FOR ALL USING (customer_id::text = auth.uid()::text);

-- Migration 5: Loyalty Transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  order_id bigint,
  points_change integer NOT NULL,
  transaction_type text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON loyalty_transactions(customer_id);
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions FOR SELECT USING (customer_id::text = auth.uid()::text);

-- Migration 6: Loyalty Tiers
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  name text PRIMARY KEY,
  min_points integer NOT NULL,
  max_points integer,
  benefits text[] NOT NULL,
  multiplier decimal(3,2) NOT NULL DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

INSERT INTO loyalty_tiers (name, min_points, max_points, benefits, multiplier) VALUES
  ('bronze', 0, 499, ARRAY['Earn 1 point per $1 spent', 'Birthday bonus'], 1.0),
  ('silver', 500, 1499, ARRAY['Earn 1.25 points per $1 spent', 'Birthday bonus', 'Early access to sales'], 1.25),
  ('gold', 1500, 2999, ARRAY['Earn 1.5 points per $1 spent', 'Birthday bonus', 'Early access', 'Free shipping'], 1.5),
  ('platinum', 3000, null, ARRAY['Earn 2 points per $1 spent', 'Birthday bonus', 'Early access', 'Free shipping', 'Exclusive events'], 2.0)
ON CONFLICT DO NOTHING;

-- Migration 7: UGC Submissions (COPPA compliant)
CREATE TABLE IF NOT EXISTS ugc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  image_url text NOT NULL,
  caption text,
  product_ids bigint[],
  parental_consent_on_file boolean DEFAULT false,
  consent_form_url text,
  consent_date timestamptz,
  ai_moderation_status text DEFAULT 'pending',
  human_review_status text DEFAULT 'pending',
  approved_for_use boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ugc_approved ON ugc_submissions(approved_for_use);
ALTER TABLE ugc_submissions ENABLE ROW LEVEL SECURITY;

-- Migration 8: Content Queue (AI generated content)
CREATE TABLE IF NOT EXISTS content_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  shopify_product_id bigint,
  generated_content jsonb NOT NULL,
  ai_confidence_score float,
  status text DEFAULT 'pending_review',
  reviewer_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_queue_status ON content_queue(status);

-- Migration 9: Competitive Intelligence
CREATE TABLE IF NOT EXISTS competitive_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name text NOT NULL,
  product_name text,
  price decimal(10,2),
  opportunity_type text,
  opportunity_score integer,
  detected_at timestamptz DEFAULT now(),
  alert_sent boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_ci_opportunity ON competitive_intelligence(opportunity_type, opportunity_score);

-- Migration 10: Agent Metrics
CREATE TABLE IF NOT EXISTS agent_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type text NOT NULL,
  metric_name text NOT NULL,
  metric_value float NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent ON agent_metrics(agent_type);

-- Migration 11: Helper Functions
CREATE OR REPLACE FUNCTION calculate_loyalty_tier(customer_points integer)
RETURNS text AS $$
DECLARE
  tier_name text;
BEGIN
  SELECT name INTO tier_name
  FROM loyalty_tiers
  WHERE min_points <= customer_points
    AND (max_points IS NULL OR max_points >= customer_points)
  ORDER BY min_points DESC
  LIMIT 1;
  RETURN COALESCE(tier_name, 'bronze');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_conversations()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM ai_conversations WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'All migrations completed successfully!' as status;
