-- Drop existing policies
DROP POLICY IF EXISTS "View connections" ON connections;
DROP POLICY IF EXISTS "Create connections" ON connections;
DROP POLICY IF EXISTS "Update connections" ON connections;
DROP POLICY IF EXISTS "Delete connections" ON connections;

-- Create new policies for connections with simplified checks
CREATE POLICY "View connections"
ON connections FOR SELECT
TO public
USING (true);

CREATE POLICY "Create connections"
ON connections FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Update connections"
ON connections FOR UPDATE
TO public
USING (true);

CREATE POLICY "Delete connections"
ON connections FOR DELETE
TO public
USING (true);

-- Ensure storage buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

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

-- Ensure all required columns exist in profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS available_for_work BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS connection_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unread_messages INTEGER DEFAULT 0;

-- Recount all connections and messages
UPDATE profiles p
SET 
  connection_count = (
    SELECT COUNT(*)
    FROM connections c
    WHERE (c.requester_id = p.id OR c.receiver_id = p.id)
    AND c.status = 'accepted'
  ),
  unread_messages = (
    SELECT COUNT(*)
    FROM messages m
    WHERE m.recipient_id = p.id
    AND m.read_at IS NULL
  );

-- Ensure all indexes exist
CREATE INDEX IF NOT EXISTS idx_connections_combined 
ON connections(requester_id, receiver_id, status);

CREATE INDEX IF NOT EXISTS idx_messages_recipient 
ON messages(recipient_id, read_at);

CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations(participant1_id, participant2_id);