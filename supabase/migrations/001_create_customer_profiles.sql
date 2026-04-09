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
