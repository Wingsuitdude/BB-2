-- Drop existing policies
DROP POLICY IF EXISTS "View conversations" ON conversations;
DROP POLICY IF EXISTS "Create conversations" ON conversations;
DROP POLICY IF EXISTS "Update conversations" ON conversations;
DROP POLICY IF EXISTS "View messages" ON messages;
DROP POLICY IF EXISTS "Send messages" ON messages;
DROP POLICY IF EXISTS "Update messages" ON messages;

-- Create new policies for conversations
CREATE POLICY "View conversations"
ON conversations FOR SELECT
TO public
USING (true);

CREATE POLICY "Create conversations"
ON conversations FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id IN (participant1_id, participant2_id)
  )
);

CREATE POLICY "Update conversations"
ON conversations FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id IN (participant1_id, participant2_id)
  )
);

-- Create new policies for messages
CREATE POLICY "View messages"
ON messages FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
  )
);

CREATE POLICY "Send messages"
ON messages FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = sender_id
    )
  )
);

CREATE POLICY "Update messages"
ON messages FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id
  )
);

-- Ensure all necessary indexes exist
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender ON messages(conversation_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- Ensure triggers exist
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();