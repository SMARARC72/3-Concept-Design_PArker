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
