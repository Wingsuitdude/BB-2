-- Drop existing reputation tables
DROP TABLE IF EXISTS reputation_events CASCADE;

-- Create reputation_events table with proper schema
CREATE TABLE reputation_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  points INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "View reputation events"
ON reputation_events FOR SELECT
TO public
USING (true);

CREATE POLICY "Create reputation events"
ON reputation_events FOR INSERT
TO public
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_reputation_events_profile ON reputation_events(profile_id);
CREATE INDEX idx_reputation_events_type ON reputation_events(event_type);
CREATE INDEX idx_reputation_events_created ON reputation_events(created_at DESC);

-- Create function to update reputation points
CREATE OR REPLACE FUNCTION update_reputation_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET reputation_points = (
    SELECT COALESCE(SUM(points), 0)
    FROM reputation_events
    WHERE profile_id = NEW.profile_id
  )
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reputation updates
DROP TRIGGER IF EXISTS reputation_points_trigger ON reputation_events;
CREATE TRIGGER reputation_points_trigger
  AFTER INSERT ON reputation_events
  FOR EACH ROW
  EXECUTE FUNCTION update_reputation_points();

-- Recount all reputation points
UPDATE profiles p
SET reputation_points = (
  SELECT COALESCE(SUM(points), 0)
  FROM reputation_events
  WHERE profile_id = p.id
);