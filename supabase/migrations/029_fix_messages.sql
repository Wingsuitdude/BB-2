-- Drop existing tables
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
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

-- Create indexes
CREATE INDEX idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_read ON messages(read_at) WHERE read_at IS NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update unread message count
CREATE OR REPLACE FUNCTION update_unread_message_count()
RETURNS TRIGGER AS $$
BEGIN
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

-- Create trigger for unread message count
DROP TRIGGER IF EXISTS message_count_trigger ON messages;
CREATE TRIGGER message_count_trigger
    AFTER INSERT OR UPDATE OF read_at ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_unread_message_count();