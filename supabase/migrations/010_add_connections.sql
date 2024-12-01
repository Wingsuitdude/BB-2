-- Create connections table
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "View connections"
ON connections FOR SELECT
TO public
USING (true);

CREATE POLICY "Create connections"
ON connections FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id IN (requester_id, receiver_id)
  )
);

CREATE POLICY "Update connections"
ON connections FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id IN (requester_id, receiver_id)
  )
);

-- Create indexes
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_receiver ON connections(receiver_id);
CREATE INDEX idx_connections_status ON connections(status);

-- Create trigger for updated_at
CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();