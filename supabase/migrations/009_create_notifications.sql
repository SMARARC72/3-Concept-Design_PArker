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
