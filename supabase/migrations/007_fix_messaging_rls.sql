-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;

-- Create new policies for conversations
CREATE POLICY "Anyone can view conversations"
ON conversations FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can create conversations"
ON conversations FOR INSERT
TO public
WITH CHECK (true);

-- Create new policies for messages
CREATE POLICY "Anyone can view messages"
ON messages FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can send messages"
ON messages FOR INSERT
TO public
WITH CHECK (true);

-- Add missing column to profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' 
                  AND column_name = 'available_for_work') THEN
        ALTER TABLE profiles ADD COLUMN available_for_work BOOLEAN DEFAULT true;
    END IF;
END $$;