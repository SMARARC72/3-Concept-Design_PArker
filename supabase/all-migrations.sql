-- Customer Profiles Table with COPPA compliance
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_customer_id bigint UNIQUE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- COPPA compliance fields
  is_child_account boolean DEFAULT false,
  parental_consent_verified boolean DEFAULT false,
  parental_consent_method text,
  parental_consent_date timestamptz,
  
  -- Preferences
  preferred_brands text[] DEFAULT '{}',
  preferred_styles text[] DEFAULT '{}',
  size_preferences jsonb DEFAULT '{}',
  
  -- Loyalty program
  loyalty_points integer DEFAULT 0,
  loyalty_tier text DEFAULT 'bronze' CONSTRAINT valid_loyalty_tier CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  referral_code text UNIQUE,
  
  -- Communication
  email_opt_in boolean DEFAULT true,
  sms_opt_in boolean DEFAULT false,
  
  -- Data retention
  data_retention_consent boolean DEFAULT true,
  last_consent_date timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_shopify_id ON customer_profiles(shopify_customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_loyalty_tier ON customer_profiles(loyalty_tier);

-- Enable RLS
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON customer_profiles FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON customer_profiles FOR UPDATE
  USING (auth.uid()::text = id::text);
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
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Product Embeddings Table for RAG
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

-- Vector similarity index
CREATE INDEX IF NOT EXISTS idx_product_embeddings_vector 
  ON product_embeddings 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_product_embeddings_category ON product_embeddings(category);
CREATE INDEX IF NOT EXISTS idx_product_embeddings_available ON product_embeddings(available);

-- Enable RLS (public read)
ALTER TABLE product_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product embeddings"
  ON product_embeddings FOR SELECT
  USING (true);
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
-- Wishlists Table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  name text DEFAULT 'My Wishlist',
  is_default boolean DEFAULT false,
  is_public boolean DEFAULT false,
  share_token text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wishlist Items Table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE,
  shopify_product_id bigint NOT NULL,
  variant_id bigint,
  added_at timestamptz DEFAULT now(),
  notes text,
  priority integer DEFAULT 0,
  UNIQUE(wishlist_id, shopify_product_id, variant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_customer ON wishlists(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_share_token ON wishlists(share_token);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product ON wishlist_items(shopify_product_id);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlists"
  ON wishlists FOR SELECT
  USING (customer_id::text = auth.uid()::text);

CREATE POLICY "Users can manage own wishlists"
  ON wishlists FOR ALL
  USING (customer_id::text = auth.uid()::text);

CREATE POLICY "Users can view items in own wishlists"
  ON wishlist_items FOR SELECT
  USING (wishlist_id IN (
    SELECT id FROM wishlists WHERE customer_id::text = auth.uid()::text
  ));

CREATE POLICY "Users can manage items in own wishlists"
  ON wishlist_items FOR ALL
  USING (wishlist_id IN (
    SELECT id FROM wishlists WHERE customer_id::text = auth.uid()::text
  ));
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
-- Outfit Boards Table
CREATE TABLE IF NOT EXISTS outfit_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  occasion_tags text[] DEFAULT '{}',
  season_tags text[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  cover_image_url text,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Outfit Items Table
CREATE TABLE IF NOT EXISTS outfit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_board_id uuid REFERENCES outfit_boards(id) ON DELETE CASCADE,
  shopify_product_id bigint NOT NULL,
  variant_id bigint,
  position_x decimal(5,2) DEFAULT 0,
  position_y decimal(5,2) DEFAULT 0,
  scale decimal(3,2) DEFAULT 1.00,
  rotation decimal(5,2) DEFAULT 0,
  z_index integer DEFAULT 0,
  added_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outfit_boards_customer ON outfit_boards(customer_id);
CREATE INDEX IF NOT EXISTS idx_outfit_boards_public ON outfit_boards(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_outfit_items_board ON outfit_items(outfit_board_id);

-- Enable RLS
ALTER TABLE outfit_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public boards"
  ON outfit_boards FOR SELECT
  USING (is_public = true OR customer_id::text = auth.uid()::text);

CREATE POLICY "Users can manage own boards"
  ON outfit_boards FOR ALL
  USING (customer_id::text = auth.uid()::text);

CREATE POLICY "Anyone can view items in public boards"
  ON outfit_items FOR SELECT
  USING (outfit_board_id IN (
    SELECT id FROM outfit_boards WHERE is_public = true OR customer_id::text = auth.uid()::text
  ));

CREATE POLICY "Users can manage items in own boards"
  ON outfit_items FOR ALL
  USING (outfit_board_id IN (
    SELECT id FROM outfit_boards WHERE customer_id::text = auth.uid()::text
  ));
-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  action_url text,
  image_url text,
  priority text DEFAULT 'normal' CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read_at timestamptz,
  clicked_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Notification Types
ALTER TABLE notifications
  ADD CONSTRAINT valid_notification_type
  CHECK (type IN (
    'price_drop',
    'back_in_stock',
    'new_arrival',
    'order_update',
    'loyalty_update',
    'style_recommendation',
    'abandoned_cart',
    'review_request',
    'promotional'
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (customer_id::text = auth.uid()::text);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (customer_id::text = auth.uid()::text);
-- Inventory Cache Table (for real-time stock tracking)
CREATE TABLE IF NOT EXISTS inventory_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_id bigint NOT NULL,
  shopify_variant_id bigint NOT NULL,
  sku text,
  inventory_quantity integer DEFAULT 0,
  inventory_item_id bigint,
  location_id bigint,
  available boolean DEFAULT true,
  restock_date date,
  low_stock_threshold integer DEFAULT 5,
  last_synced_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shopify_variant_id, location_id)
);

-- Inventory Alerts Table
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  shopify_product_id bigint NOT NULL,
  variant_id bigint,
  alert_type text NOT NULL DEFAULT 'back_in_stock',
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  notified_at timestamptz,
  UNIQUE(customer_id, shopify_product_id, variant_id, alert_type)
);

ALTER TABLE inventory_alerts
  ADD CONSTRAINT valid_alert_type
  CHECK (alert_type IN ('back_in_stock', 'price_drop', 'low_stock'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_cache_product ON inventory_cache(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_cache_variant ON inventory_cache(shopify_variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_cache_available ON inventory_cache(available);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_customer ON inventory_alerts(customer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product ON inventory_alerts(shopify_product_id);

-- Enable RLS
ALTER TABLE inventory_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inventory cache"
  ON inventory_cache FOR SELECT
  USING (true);

CREATE POLICY "Users can view own inventory alerts"
  ON inventory_alerts FOR SELECT
  USING (customer_id::text = auth.uid()::text);

CREATE POLICY "Users can manage own inventory alerts"
  ON inventory_alerts FOR ALL
  USING (customer_id::text = auth.uid()::text);
-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_embeddings_updated_at
  BEFORE UPDATE ON product_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfit_boards_updated_at
  BEFORE UPDATE ON outfit_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_cache_updated_at
  BEFORE UPDATE ON inventory_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to search products by vector similarity
CREATE OR REPLACE FUNCTION search_products(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_category text DEFAULT NULL,
  filter_available boolean DEFAULT true
)
RETURNS TABLE (
  id uuid,
  shopify_product_id bigint,
  product_handle text,
  title text,
  description text,
  category text,
  tags text[],
  price decimal(10,2),
  available boolean,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.shopify_product_id,
    pe.product_handle,
    pe.title,
    pe.description,
    pe.category,
    pe.tags,
    pe.price,
    pe.available,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM product_embeddings pe
  WHERE 
    1 - (pe.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR pe.category = filter_category)
    AND (filter_available IS FALSE OR pe.available = true)
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired AI conversations (COPPA compliance)
CREATE OR REPLACE FUNCTION cleanup_expired_conversations()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_conversations
  WHERE expires_at < now()
     OR (coppa_flagged = true AND created_at < now() - interval '30 days');
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM customer_profiles WHERE referral_code = code) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to increment loyalty points
CREATE OR REPLACE FUNCTION increment_loyalty_points(
  customer_uuid uuid,
  points_to_add integer
)
RETURNS integer AS $$
DECLARE
  new_points integer;
  current_tier text;
  new_tier text;
BEGIN
  UPDATE customer_profiles
  SET loyalty_points = loyalty_points + points_to_add
  WHERE id = customer_uuid
  RETURNING loyalty_points INTO new_points;
  
  -- Determine new tier based on points
  SELECT loyalty_tier INTO current_tier
  FROM customer_profiles WHERE id = customer_uuid;
  
  new_tier := CASE
    WHEN new_points >= 10000 THEN 'platinum'
    WHEN new_points >= 5000 THEN 'gold'
    WHEN new_points >= 1000 THEN 'silver'
    ELSE 'bronze'
  END;
  
  IF new_tier != current_tier THEN
    UPDATE customer_profiles
    SET loyalty_tier = new_tier
    WHERE id = customer_uuid;
  END IF;
  
  RETURN new_points;
END;
$$ LANGUAGE plpgsql;

-- Row count estimates for monitoring
CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS TABLE (
  table_name text,
  row_count bigint,
  size_bytes bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.relname::text,
    c.reltuples::bigint,
    pg_total_relation_size(c.oid)::bigint
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r';
END;
$$ LANGUAGE plpgsql;
