-- Add media attachment support to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'gif'));
