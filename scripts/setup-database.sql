-- Alika Platform Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_active BOOLEAN DEFAULT TRUE,
  refresh_tokens JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  template_url VARCHAR(500),
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  placeholder_config JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated banners table
CREATE TABLE IF NOT EXISTS generated_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_name VARCHAR(255),
  user_photo_url VARCHAR(500),
  generated_banner_url VARCHAR(500),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  banner_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table (for campaign comments)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_trending ON campaigns(is_trending);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_view_count ON campaigns(view_count);
CREATE INDEX IF NOT EXISTS idx_generated_banners_campaign_id ON generated_banners(campaign_id);
CREATE INDEX IF NOT EXISTS idx_generated_banners_created_at ON generated_banners(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_campaign_id ON comments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, password, role) VALUES 
('admin@alika.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJL9.KeF2', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, description, icon_url) VALUES 
('Education', 'Educational events and campaigns', '/icons/education.svg'),
('Technology', 'Tech events and conferences', '/icons/tech.svg'),
('Music', 'Music festivals and concerts', '/icons/music.svg'),
('Business', 'Business and corporate events', '/icons/business.svg'),
('Sports', 'Sports events and competitions', '/icons/sports.svg'),
('Food', 'Food festivals and culinary events', '/icons/food.svg'),
('Art', 'Art exhibitions and creative events', '/icons/art.svg'),
('Health', 'Health and wellness campaigns', '/icons/health.svg')
ON CONFLICT (name) DO NOTHING;

-- Insert sample campaigns
INSERT INTO campaigns (title, description, category, template_url, creator_id, is_trending, placeholder_config, tags) VALUES 
(
  'Cracking the Code 1.0',
  'University Life Career Launch & Beyond - Join us for an intensive workshop designed to help students transition from university life to successful careers. This comprehensive program covers resume building, interview skills, networking strategies, and industry insights from leading professionals.',
  'Education',
  '/templates/cracking-code.png',
  (SELECT id FROM users WHERE email = 'admin@alika.com'),
  true,
  '{"photoArea": {"x": 450, "y": 150, "width": 120, "height": 120, "shape": "circle"}, "textArea": {"x": 200, "y": 300, "width": 200, "height": 40}}',
  ARRAY['Education', 'Career', 'University', 'Workshop']
),
(
  'Summer Music Festival 2024',
  'Join us for the biggest music celebration of the year! Featuring top artists, food trucks, and an unforgettable experience under the stars.',
  'Music',
  '/templates/music-festival.png',
  (SELECT id FROM users WHERE email = 'admin@alika.com'),
  true,
  '{"photoArea": {"x": 400, "y": 200, "width": 100, "height": 100, "shape": "circle"}, "textArea": {"x": 150, "y": 350, "width": 300, "height": 50}}',
  ARRAY['Music', 'Festival', 'Summer', 'Entertainment']
),
(
  'Tech Conference 2024',
  'Innovation and Technology Summit - Connect with industry leaders, learn about cutting-edge technologies, and network with fellow tech enthusiasts.',
  'Technology',
  '/templates/tech-conference.png',
  (SELECT id FROM users WHERE email = 'admin@alika.com'),
  false,
  '{"photoArea": {"x": 500, "y": 100, "width": 80, "height": 80, "shape": "circle"}, "textArea": {"x": 100, "y": 250, "width": 400, "height": 40}}',
  ARRAY['Technology', 'Conference', 'Innovation', 'Networking']
),
(
  'Business Networking Event',
  'Connect with industry leaders and expand your professional network. Perfect for entrepreneurs, executives, and business professionals.',
  'Business',
  '/templates/business-networking.png',
  (SELECT id FROM users WHERE email = 'admin@alika.com'),
  false,
  '{"photoArea": {"x": 350, "y": 180, "width": 90, "height": 90, "shape": "circle"}, "textArea": {"x": 200, "y": 320, "width": 200, "height": 35}}',
  ARRAY['Business', 'Networking', 'Professional', 'Entrepreneurs']
);

-- Update view counts for sample data
UPDATE campaigns SET view_count = 1250 WHERE title = 'Cracking the Code 1.0';
UPDATE campaigns SET view_count = 890 WHERE title = 'Summer Music Festival 2024';
UPDATE campaigns SET view_count = 2100 WHERE title = 'Tech Conference 2024';
UPDATE campaigns SET view_count = 650 WHERE title = 'Business Networking Event';

-- Update category banner counts
UPDATE categories SET banner_count = (
  SELECT COUNT(*) FROM campaigns WHERE category = categories.name
);

-- Create RLS (Row Level Security) policies if needed
-- ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE generated_banners ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Success message
SELECT 'Database setup completed successfully!' as message;
