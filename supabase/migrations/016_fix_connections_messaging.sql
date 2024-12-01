-- Drop existing tables if they exist
DROP TABLE IF EXISTS connections CASCADE;

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

-- Create policies for connections
CREATE POLICY "View connections"
ON connections FOR SELECT
TO public
USING (true);

CREATE POLICY "Create connections"
ON connections FOR INSERT
TO public
WITH CHECK (
  requester_id IS NOT NULL AND 
  receiver_id IS NOT NULL AND 
  requester_id != receiver_id
);

CREATE POLICY "Update connections"
ON connections FOR UPDATE
TO public
USING (true);

CREATE POLICY "Delete connections"
ON connections FOR DELETE
TO public
USING (true);

-- Create indexes
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_receiver ON connections(receiver_id);
CREATE INDEX idx_connections_status ON connections(status);

-- Create trigger for updated_at
CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS connection_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unread_messages INTEGER DEFAULT 0;

-- Create function to update connection count
CREATE OR REPLACE FUNCTION update_connection_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
        UPDATE profiles SET connection_count = connection_count + 1
        WHERE id IN (NEW.requester_id, NEW.receiver_id);
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        UPDATE profiles SET connection_count = connection_count + 1
        WHERE id IN (NEW.requester_id, NEW.receiver_id);
    ELSIF TG_OP = 'UPDATE' AND NEW.status != 'accepted' AND OLD.status = 'accepted' THEN
        UPDATE profiles SET connection_count = GREATEST(connection_count - 1, 0)
        WHERE id IN (NEW.requester_id, NEW.receiver_id);
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
        UPDATE profiles SET connection_count = GREATEST(connection_count - 1, 0)
        WHERE id IN (OLD.requester_id, OLD.receiver_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for connection count
DROP TRIGGER IF EXISTS connection_count_trigger ON connections;
CREATE TRIGGER connection_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_connection_count();

-- Fix storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Fix storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Delete Access" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('avatars', 'banners'));

CREATE POLICY "Upload Access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id IN ('avatars', 'banners'));

CREATE POLICY "Update Access"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id IN ('avatars', 'banners'));

CREATE POLICY "Delete Access"
ON storage.objects FOR DELETE
TO public
USING (bucket_id IN ('avatars', 'banners'));