-- Enable storage
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('avatars', 'banners'));

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id IN ('avatars', 'banners'));

CREATE POLICY "Users can update their uploads"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id IN ('avatars', 'banners'));

CREATE POLICY "Users can delete their uploads"
ON storage.objects FOR DELETE
TO public
USING (bucket_id IN ('avatars', 'banners'));