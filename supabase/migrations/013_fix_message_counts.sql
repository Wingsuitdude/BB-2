-- Fix message counting issues
ALTER TABLE messages DROP COLUMN IF EXISTS recipient_id CASCADE;
ALTER TABLE messages ADD COLUMN recipient_id UUID REFERENCES profiles(id);

-- Create index for recipient_id
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);

-- Update existing messages to set recipient_id
UPDATE messages m
SET recipient_id = CASE 
  WHEN c.participant1_id = m.sender_id THEN c.participant2_id
  ELSE c.participant1_id
END
FROM conversations c
WHERE m.conversation_id = c.id
AND m.recipient_id IS NULL;

-- Make recipient_id NOT NULL after updating existing records
ALTER TABLE messages ALTER COLUMN recipient_id SET NOT NULL;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS message_count_trigger ON messages;
DROP FUNCTION IF EXISTS update_unread_message_count();

-- Create new function for unread message count
CREATE OR REPLACE FUNCTION update_unread_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles 
        SET unread_messages = (
            SELECT COUNT(*)
            FROM messages
            WHERE recipient_id = NEW.recipient_id
            AND read_at IS NULL
        )
        WHERE id = NEW.recipient_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
        UPDATE profiles 
        SET unread_messages = (
            SELECT COUNT(*)
            FROM messages
            WHERE recipient_id = NEW.recipient_id
            AND read_at IS NULL
        )
        WHERE id = NEW.recipient_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger for message count
CREATE TRIGGER message_count_trigger
    AFTER INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_unread_message_count();

-- Fix RLS policies
DROP POLICY IF EXISTS "View messages" ON messages;
DROP POLICY IF EXISTS "Send messages" ON messages;
DROP POLICY IF EXISTS "Update messages" ON messages;

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