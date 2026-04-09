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
