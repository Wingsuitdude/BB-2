-- Create storage.objects policies
BEGIN;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar images" ON storage.objects;

-- Create policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Upload Access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Update Access"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Delete Access"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'avatars');

COMMIT;