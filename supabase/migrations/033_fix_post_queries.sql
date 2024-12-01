-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_post_likes_combined ON post_likes(post_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Update post_likes RLS policies
DROP POLICY IF EXISTS "View likes" ON post_likes;
DROP POLICY IF EXISTS "Create likes" ON post_likes;
DROP POLICY IF EXISTS "Delete likes" ON post_likes;

CREATE POLICY "View likes"
ON post_likes FOR SELECT
TO public
USING (true);

CREATE POLICY "Create likes"
ON post_likes FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = post_id
  )
);

CREATE POLICY "Delete likes"
ON post_likes FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = post_id
  )
);

-- Add function to update post stats
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts
    SET likes_count = (
      SELECT COUNT(*) FROM post_likes WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts
    SET likes_count = (
      SELECT COUNT(*) FROM post_likes WHERE post_id = OLD.post_id
    )
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post stats
DROP TRIGGER IF EXISTS post_stats_trigger ON post_likes;
CREATE TRIGGER post_stats_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_stats();