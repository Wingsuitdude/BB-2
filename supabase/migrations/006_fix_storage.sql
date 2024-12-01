-- Enable storage
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploads" ON storage.objects;

-- Create new policies
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