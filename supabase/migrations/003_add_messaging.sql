-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table to track message threads
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id)
);

-- Create updated_at trigger for messages
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create updated_at trigger for conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view their own messages"
ON messages FOR SELECT
TO public
USING (
  auth.uid() IN (
    SELECT id::text FROM profiles WHERE id = sender_id OR id = receiver_id
  )
);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
TO public
WITH CHECK (
  auth.uid() IN (
    SELECT id::text FROM profiles WHERE id = sender_id
  )
);

-- Create policies for conversations
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
TO public
USING (
  auth.uid() IN (
    SELECT id::text FROM profiles 
    WHERE id = participant1_id OR id = participant2_id
  )
);

-- Create indexes
CREATE INDEX messages_sender_idx ON messages(sender_id);
CREATE INDEX messages_receiver_idx ON messages(receiver_id);
CREATE INDEX conversations_participant1_idx ON conversations(participant1_id);
CREATE INDEX conversations_participant2_idx ON conversations(participant2_id);