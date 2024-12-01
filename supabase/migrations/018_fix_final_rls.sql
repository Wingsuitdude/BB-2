-- Drop existing policies
DROP POLICY IF EXISTS "View connections" ON connections;
DROP POLICY IF EXISTS "Create connections" ON connections;
DROP POLICY IF EXISTS "Update connections" ON connections;
DROP POLICY IF EXISTS "Delete connections" ON connections;
DROP POLICY IF EXISTS "View messages" ON messages;
DROP POLICY IF EXISTS "Send messages" ON messages;
DROP POLICY IF EXISTS "Update messages" ON messages;

-- Create simplified policies for connections
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

-- Create simplified policies for messages
CREATE POLICY "View messages"
ON messages FOR SELECT
TO public
USING (true);

CREATE POLICY "Send messages"
ON messages FOR INSERT
TO public
WITH CHECK (
  sender_id IS NOT NULL AND 
  recipient_id IS NOT NULL AND 
  sender_id != recipient_id AND
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
  )
);

CREATE POLICY "Update messages"
ON messages FOR UPDATE
TO public
USING (true);

-- Ensure all required columns exist
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

-- Create or update indexes for better performance
CREATE INDEX IF NOT EXISTS idx_connections_combined 
ON connections(requester_id, receiver_id, status);

CREATE INDEX IF NOT EXISTS idx_messages_recipient 
ON messages(recipient_id, read_at);

CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations(participant1_id, participant2_id);

-- Ensure storage buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;