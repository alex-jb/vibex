import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase-server";
import { uploadAvatar, uploadThumbnail } from "@/lib/storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null; // "avatar" or "thumbnail"
  const targetId = formData.get("targetId") as string | null; // projectId for thumbnails

  if (!file || !type) {
    return NextResponse.json(
      { error: "Missing file or type parameter" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Use JPEG, PNG, GIF, or WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 }
    );
  }

  let url: string | null = null;

  if (type === "avatar") {
    url = await uploadAvatar(user.id, file);
  } else if (type === "thumbnail" && targetId) {
    url = await uploadThumbnail(targetId, file);
  } else {
    return NextResponse.json(
      { error: "Invalid upload type" },
      { status: 400 }
    );
  }

  if (!url) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url });
}
