-- Drop existing bases table if it exists
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
  verified BOOLEAN DEFAULT false,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view bases"
ON bases FOR SELECT
TO public
USING (true);

CREATE POLICY "Verified users can create bases"
ON bases FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = bases.creator_id
    AND profiles.verified = true
  )
);

CREATE POLICY "Base creators can update their bases"
ON bases FOR UPDATE
TO public
USING (
  creator_id = auth.uid()::uuid
);

CREATE POLICY "Base creators can delete their bases"
ON bases FOR DELETE
TO public
USING (
  creator_id = auth.uid()::uuid
);

-- Create indexes
CREATE INDEX idx_bases_creator ON bases(creator_id);
CREATE INDEX idx_bases_type ON bases(type);
CREATE INDEX idx_bases_created_at ON bases(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_bases_updated_at
    BEFORE UPDATE ON bases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();