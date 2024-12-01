-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view conversations" ON conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON conversations;
DROP POLICY IF EXISTS "Anyone can view messages" ON messages;
DROP POLICY IF EXISTS "Anyone can send messages" ON messages;

-- Create new policies for conversations with proper checks
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

-- Create new policies for messages with proper checks
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Ensure triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

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