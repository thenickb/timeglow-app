-- TimeGlow Database Schema
-- Version 1.0

-- Users table (managed by Clerk, extended in Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  credits_remaining INT DEFAULT 50,
  credits_reset_at TIMESTAMPTZ,
  total_images_processed INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  original_size_bytes BIGINT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  preset_used TEXT NOT NULL, -- automagic, colorize, denoise, etc.
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restoration results table
CREATE TABLE IF NOT EXISTS restorations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  result_url TEXT NOT NULL,
  result_size_bytes BIGINT,
  reroll_number INT DEFAULT 0, -- 0 = original, 1-5 = free rerolls
  credits_used INT DEFAULT 0, -- 0 for first 5 rerolls, 1 for 6th+
  processing_time_ms INT,
  gemini_response JSONB, -- Store API response for debugging
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- upload, restore, reroll, download
  credits_consumed INT DEFAULT 0,
  image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INT,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  max_uses INT,
  times_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL, -- active, canceled, past_due, etc.
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE restorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own images" ON images;
DROP POLICY IF EXISTS "Users can create own images" ON images;
DROP POLICY IF EXISTS "Users can update own images" ON images;
DROP POLICY IF EXISTS "Users can delete own images" ON images;
DROP POLICY IF EXISTS "Users can view own restorations" ON restorations;
DROP POLICY IF EXISTS "Users can create own restorations" ON restorations;
DROP POLICY IF EXISTS "Users can view own usage logs" ON usage_logs;
DROP POLICY IF EXISTS "Users can create own usage logs" ON usage_logs;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- RLS Policies for images
CREATE POLICY "Users can view own images" ON images
  FOR SELECT USING (user_id = (SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can create own images" ON images
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update own images" ON images
  FOR UPDATE USING (user_id = (SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete own images" ON images
  FOR DELETE USING (user_id = (SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'));

-- RLS Policies for restorations
CREATE POLICY "Users can view own restorations" ON restorations
  FOR SELECT USING (
    image_id IN (
      SELECT id FROM images WHERE user_id = (
        SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'
      )
    )
  );

CREATE POLICY "Users can create own restorations" ON restorations
  FOR INSERT WITH CHECK (
    image_id IN (
      SELECT id FROM images WHERE user_id = (
        SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- RLS Policies for usage_logs
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (user_id = (SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can create own usage logs" ON usage_logs
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = (SELECT id FROM profiles WHERE clerk_id = auth.jwt() ->> 'sub'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON profiles(clerk_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_status ON images(status);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);
CREATE INDEX IF NOT EXISTS idx_restorations_image_id ON restorations(image_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Insert initial promo code for launch
INSERT INTO promo_codes (code, discount_percent, valid_from, valid_until, max_uses)
VALUES ('LAUNCH50', 50, NOW(), NOW() + INTERVAL '3 months', 1000)
ON CONFLICT (code) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_images_updated_at ON images;
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage buckets configuration (run separately in Supabase dashboard)
-- CREATE STORAGE BUCKET IF NOT EXISTS 'original-images';
-- CREATE STORAGE BUCKET IF NOT EXISTS 'restored-images';