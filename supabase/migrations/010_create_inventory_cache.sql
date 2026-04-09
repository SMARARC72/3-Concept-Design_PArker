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
