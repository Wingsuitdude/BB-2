-- Drop existing tables to ensure clean slate
DROP TABLE IF EXISTS base_members CASCADE;
DROP TABLE IF EXISTS bases CASCADE;

-- Create bases table with correct schema
CREATE TABLE bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('solo', 'team')),
  skills TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  funding_goal DECIMAL,
  current_funding DECIMAL DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
ALTER TABLE bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_members ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for bases
CREATE POLICY "View bases"
ON bases FOR SELECT
TO public
USING (true);

CREATE POLICY "Create bases"
ON bases FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Update bases"
ON bases FOR UPDATE
TO public
USING (creator_id::text = auth.uid());

CREATE POLICY "Delete bases"
ON bases FOR DELETE
TO public
USING (creator_id::text = auth.uid());

-- Create simplified policies for base_members
CREATE POLICY "View base members"
ON base_members FOR SELECT
TO public
USING (true);

CREATE POLICY "Join bases"
ON base_members FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Leave bases"
ON base_members FOR DELETE
TO public
USING (true);

-- Create indexes
CREATE INDEX idx_bases_creator ON bases(creator_id);
CREATE INDEX idx_bases_type ON bases(type);
CREATE INDEX idx_bases_created_at ON bases(created_at DESC);
CREATE INDEX idx_base_members_base ON base_members(base_id);
CREATE INDEX idx_base_members_profile ON base_members(profile_id);
CREATE INDEX idx_base_members_joined ON base_members(joined_at DESC);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_bases_updated_at ON bases;
CREATE TRIGGER update_bases_updated_at
    BEFORE UPDATE ON bases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add creator as first member when base is created
CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO base_members (base_id, profile_id, role)
  VALUES (NEW.id, NEW.creator_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS base_creator_member ON bases;
CREATE TRIGGER base_creator_member
  AFTER INSERT ON bases
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_member();