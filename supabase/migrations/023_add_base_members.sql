-- Create base_members table
CREATE TABLE base_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_id UUID REFERENCES bases(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(base_id, profile_id)
);

-- Enable RLS
ALTER TABLE base_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view base members"
ON base_members FOR SELECT
TO public
USING (true);

CREATE POLICY "Members can join bases"
ON base_members FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Members can leave bases"
ON base_members FOR DELETE
TO public
USING (true);

-- Create indexes
CREATE INDEX idx_base_members_base ON base_members(base_id);
CREATE INDEX idx_base_members_profile ON base_members(profile_id);
CREATE INDEX idx_base_members_joined ON base_members(joined_at DESC);

-- Add creator as first member when base is created
CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO base_members (base_id, profile_id, role)
  VALUES (NEW.id, NEW.creator_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER base_creator_member
  AFTER INSERT ON bases
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_member();