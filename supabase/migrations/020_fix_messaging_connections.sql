-- Drop existing policies
DROP POLICY IF EXISTS "View messages" ON messages;
DROP POLICY IF EXISTS "Send messages" ON messages;
DROP POLICY IF EXISTS "Update messages" ON messages;
DROP POLICY IF EXISTS "View conversations" ON conversations;
DROP POLICY IF EXISTS "Create conversations" ON conversations;
DROP POLICY IF EXISTS "Update conversations" ON conversations;

-- Create simplified policies for messages
CREATE POLICY "View messages"
ON messages FOR SELECT
TO public
USING (true);

CREATE POLICY "Send messages"
ON messages FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Update messages"
ON messages FOR UPDATE
TO public
USING (true);

-- Create simplified policies for conversations
CREATE POLICY "View conversations"
ON conversations FOR SELECT
TO public
USING (true);

CREATE POLICY "Create conversations"
ON conversations FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Update conversations"
ON conversations FOR UPDATE
TO public
USING (true);

-- Ensure all required columns exist
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read_at) WHERE read_at IS NULL;

-- Update existing messages to set recipient_id if missing
UPDATE messages m
SET recipient_id = CASE 
  WHEN c.participant1_id = m.sender_id THEN c.participant2_id
  ELSE c.participant1_id
END
FROM conversations c
WHERE m.conversation_id = c.id
AND m.recipient_id IS NULL;

-- Recount unread messages
UPDATE profiles p
SET unread_messages = (
  SELECT COUNT(*)
  FROM messages m
  WHERE m.recipient_id = p.id
  AND m.read_at IS NULL
);