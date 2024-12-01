-- Fix storage buckets and policies
DO $$ 
BEGIN
    -- Ensure storage extension is enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create buckets if they don't exist
    IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'avatars') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('avatars', 'avatars', true);
    END IF;

    IF NOT EXISTS (SELECT FROM storage.buckets WHERE id = 'banners') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('banners', 'banners', true);
    END IF;
END $$;

-- Fix RLS policies for storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Delete Access" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('avatars', 'banners'));

CREATE POLICY "Upload Access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id IN ('avatars', 'banners'));

CREATE POLICY "Update Access"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id IN ('avatars', 'banners'));

CREATE POLICY "Delete Access"
ON storage.objects FOR DELETE
TO public
USING (bucket_id IN ('avatars', 'banners'));

-- Fix messages and conversations
ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES profiles(id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);

-- Fix RLS policies for messages and conversations
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

-- Fix profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS available_for_work BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS connection_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unread_messages INTEGER DEFAULT 0;

-- Create function to update unread message count
CREATE OR REPLACE FUNCTION update_unread_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles 
        SET unread_messages = unread_messages + 1
        WHERE id = NEW.recipient_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
        UPDATE profiles 
        SET unread_messages = GREATEST(unread_messages - 1, 0)
        WHERE id = NEW.recipient_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for unread message count
DROP TRIGGER IF EXISTS message_count_trigger ON messages;
CREATE TRIGGER message_count_trigger
    AFTER INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_unread_message_count();