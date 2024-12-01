-- Drop existing message-related functions and triggers
DROP TRIGGER IF EXISTS message_count_trigger ON messages;
DROP FUNCTION IF EXISTS update_unread_message_count();

-- Ensure messages table has the correct structure
ALTER TABLE messages 
  DROP COLUMN IF EXISTS recipient_id CASCADE;

-- Add recipient_id column properly
ALTER TABLE messages 
  ADD COLUMN recipient_id UUID REFERENCES profiles(id);

-- Update existing messages to set recipient_id
UPDATE messages m
SET recipient_id = CASE 
  WHEN c.participant1_id = m.sender_id THEN c.participant2_id
  ELSE c.participant1_id
END
FROM conversations c
WHERE m.conversation_id = c.id
AND m.recipient_id IS NULL;

-- Make recipient_id NOT NULL
ALTER TABLE messages 
  ALTER COLUMN recipient_id SET NOT NULL;

-- Create improved unread message count function
CREATE OR REPLACE FUNCTION update_unread_message_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update recipient's unread count
    UPDATE profiles 
    SET unread_messages = (
        SELECT COUNT(*)
        FROM messages
        WHERE recipient_id = NEW.recipient_id
        AND read_at IS NULL
    )
    WHERE id = NEW.recipient_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger for message count
CREATE TRIGGER message_count_trigger
    AFTER INSERT OR UPDATE OF read_at ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_unread_message_count();

-- Recount all unread messages
UPDATE profiles p
SET unread_messages = (
    SELECT COUNT(*)
    FROM messages m
    WHERE m.recipient_id = p.id
    AND m.read_at IS NULL
);