-- Add reputation fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS reputation_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reward_claim TIMESTAMPTZ;

-- Create reputation_events table
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

-- Create policies
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
  SET reputation_points = reputation_points + NEW.points
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reputation updates
CREATE TRIGGER reputation_points_trigger
  AFTER INSERT ON reputation_events
  FOR EACH ROW
  EXECUTE FUNCTION update_reputation_points();