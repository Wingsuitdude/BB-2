-- Drop existing policies
DROP POLICY IF EXISTS "View messages" ON messages;
DROP POLICY IF EXISTS "Send messages" ON messages;
DROP POLICY IF EXISTS "Update messages" ON messages;
DROP POLICY IF EXISTS "View connections" ON connections;
DROP POLICY IF EXISTS "Create connections" ON connections;
DROP POLICY IF EXISTS "Update connections" ON connections;
DROP POLICY IF EXISTS "Delete connections" ON connections;

-- Create new policies for messages
CREATE POLICY "View messages"
ON messages FOR SELECT
TO public
USING (
  sender_id IS NOT NULL AND recipient_id IS NOT NULL
);

CREATE POLICY "Send messages"
ON messages FOR INSERT
TO public
WITH CHECK (
  sender_id IS NOT NULL AND recipient_id IS NOT NULL
);

CREATE POLICY "Update messages"
ON messages FOR UPDATE
TO public
USING (
  sender_id IS NOT NULL AND recipient_id IS NOT NULL
);

-- Create new policies for connections
CREATE POLICY "View connections"
ON connections FOR SELECT
TO public
USING (
  requester_id IS NOT NULL AND receiver_id IS NOT NULL
);

CREATE POLICY "Create connections"
ON connections FOR INSERT
TO public
WITH CHECK (
  requester_id IS NOT NULL AND receiver_id IS NOT NULL AND
  requester_id != receiver_id
);

CREATE POLICY "Update connections"
ON connections FOR UPDATE
TO public
USING (
  requester_id IS NOT NULL AND receiver_id IS NOT NULL
);

CREATE POLICY "Delete connections"
ON connections FOR DELETE
TO public
USING (
  requester_id IS NOT NULL AND receiver_id IS NOT NULL
);

-- Add missing columns if they don't exist
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS unread_messages INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS connection_count INTEGER DEFAULT 0;

-- Recount all unread messages and connections
UPDATE profiles p
SET 
  unread_messages = (
    SELECT COUNT(*)
    FROM messages m
    WHERE m.recipient_id = p.id
    AND m.read_at IS NULL
  ),
  connection_count = (
    SELECT COUNT(*)
    FROM connections c
    WHERE (c.requester_id = p.id OR c.receiver_id = p.id)
    AND c.status = 'accepted'
  );