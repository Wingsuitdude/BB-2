-- Drop existing tables
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create post_likes table
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, profile_id)
);

-- Create post_comments table
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for posts
CREATE POLICY "View posts"
ON posts FOR SELECT
TO public
USING (true);

CREATE POLICY "Create posts"
ON posts FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Update own posts"
ON posts FOR UPDATE
TO public
USING (true);

CREATE POLICY "Delete own posts"
ON posts FOR DELETE
TO public
USING (true);

-- Create policies for likes
CREATE POLICY "View likes"
ON post_likes FOR SELECT
TO public
USING (true);

CREATE POLICY "Create likes"
ON post_likes FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Delete likes"
ON post_likes FOR DELETE
TO public
USING (true);

-- Create policies for comments
CREATE POLICY "View comments"
ON post_comments FOR SELECT
TO public
USING (true);

CREATE POLICY "Create comments"
ON post_comments FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Update own comments"
ON post_comments FOR UPDATE
TO public
USING (true);

CREATE POLICY "Delete own comments"
ON post_comments FOR DELETE
TO public
USING (true);

-- Create indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_profile ON post_likes(profile_id);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_author ON post_comments(author_id);

-- Create trigger for updated_at
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
    BEFORE UPDATE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();