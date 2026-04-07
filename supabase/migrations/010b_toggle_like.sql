-- Atomic like toggle: handles insert/delete of post_likes + counter update in one transaction.
-- Usage: SELECT * FROM toggle_like('post-abc', 'user-uuid');
-- Returns: { liked: boolean, likes: integer }

CREATE OR REPLACE FUNCTION toggle_like(p_post_id TEXT, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
  v_new_likes INTEGER;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM post_likes
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Unlike: remove and decrement
    DELETE FROM post_likes
    WHERE post_id = p_post_id AND user_id = p_user_id;

    UPDATE posts
    SET likes = GREATEST(0, likes - 1)
    WHERE id = p_post_id
    RETURNING likes INTO v_new_likes;

    RETURN json_build_object('liked', false, 'likes', COALESCE(v_new_likes, 0));
  ELSE
    -- Like: insert and increment
    INSERT INTO post_likes (post_id, user_id)
    VALUES (p_post_id, p_user_id);

    UPDATE posts
    SET likes = likes + 1
    WHERE id = p_post_id
    RETURNING likes INTO v_new_likes;

    RETURN json_build_object('liked', true, 'likes', COALESCE(v_new_likes, 0));
  END IF;
END;
$$;

-- Helper: increment replies_count on parent post
CREATE OR REPLACE FUNCTION increment_replies_count(p_post_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET replies_count = replies_count + 1
  WHERE id = p_post_id;
END;
$$;
