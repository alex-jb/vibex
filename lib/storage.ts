import { supabase } from "./supabase";

const BUCKET_AVATARS = "avatars";
const BUCKET_THUMBNAILS = "thumbnails";

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL on success, null on failure.
 */
async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) return null;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload a user avatar image.
 * @param userId - The user's ID (used as filename prefix)
 * @param file - The image file to upload
 * @returns Public URL of the uploaded avatar
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split(".").pop() || "png";
  const path = `${userId}/avatar.${ext}`;
  return uploadFile(BUCKET_AVATARS, path, file);
}

/**
 * Upload a project thumbnail image.
 * @param projectId - The project's ID
 * @param file - The image file to upload
 * @returns Public URL of the uploaded thumbnail
 */
export async function uploadThumbnail(
  projectId: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split(".").pop() || "png";
  const path = `${projectId}/thumbnail.${ext}`;
  return uploadFile(BUCKET_THUMBNAILS, path, file);
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}
