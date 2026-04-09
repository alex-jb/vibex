-- Storage buckets for user avatars and project thumbnails
-- Run this manually in Supabase Dashboard > SQL Editor if storage isn't auto-provisioned

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('thumbnails', 'thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS: anyone can read public buckets
CREATE POLICY IF NOT EXISTS "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Public read thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

-- RLS: authenticated users can upload to their own avatar path
CREATE POLICY IF NOT EXISTS "Users upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS: authenticated users can upload project thumbnails
CREATE POLICY IF NOT EXISTS "Users upload thumbnails"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'thumbnails');

-- RLS: users can update/delete their own avatars
CREATE POLICY IF NOT EXISTS "Users update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY IF NOT EXISTS "Users delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
