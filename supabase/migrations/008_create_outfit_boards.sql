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
