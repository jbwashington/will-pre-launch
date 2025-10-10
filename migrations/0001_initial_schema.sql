-- Cloudflare D1 Migration - Initial Schema
-- SQLite compatible version of the Supabase schema

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  zip_code TEXT,
  referral_code TEXT UNIQUE DEFAULT (lower(hex(randomblob(4)))),
  referred_by TEXT,
  position INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  metadata TEXT DEFAULT '{}',
  FOREIGN KEY (referred_by) REFERENCES waitlist(id)
);

-- Create indexes on waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_referred_by ON waitlist(referred_by);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_type TEXT NOT NULL,
  user_id TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES waitlist(id)
);

-- Create indexes on analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

-- Create generated_content table
CREATE TABLE IF NOT EXISTS generated_content (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  content_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  generated_text TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes on generated_content
CREATE INDEX IF NOT EXISTS idx_content_type ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON generated_content(created_at);

-- Create trigger to update waitlist position
CREATE TRIGGER IF NOT EXISTS update_waitlist_position
AFTER INSERT ON waitlist
BEGIN
  UPDATE waitlist
  SET position = (
    SELECT COUNT(*)
    FROM waitlist
    WHERE created_at <= NEW.created_at
  )
  WHERE id = NEW.id;
END;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_waitlist_timestamp
AFTER UPDATE ON waitlist
BEGIN
  UPDATE waitlist SET updated_at = datetime('now')
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_content_timestamp
AFTER UPDATE ON generated_content
BEGIN
  UPDATE generated_content SET updated_at = datetime('now')
  WHERE id = NEW.id;
END;
