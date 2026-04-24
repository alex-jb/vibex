import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { createServerSupabase } from "@/lib/supabase-server";

/* ═══════════════════════════════════════════════════════════════════════════
   POST /api/blob/upload-video — Vercel Blob signed-token issuer for the
   /launch demo video uploader.

   Flow (creator-side):
     1. /launch calls `upload(pathname, file, { handleUploadUrl: <this route> })`
        from `@vercel/blob/client`.
     2. That helper posts to this route asking for a signed token.
     3. We check the user is signed in (can't let anonymous visitors burn
        free-tier storage) + constrain to MP4/WebM + cap at 30 MB.
     4. Client uploads directly to Blob using the signed token — the upload
        bytes never touch our serverless runtime.
     5. `onUploadCompleted` fires as a webhook from Blob after the upload
        finishes; we just log it. The actual DB write (projects.demo_video_url)
        happens when the creator submits the /launch form — this route only
        gates the upload, not the row insert.
   ═══════════════════════════════════════════════════════════════════════════ */

const TWENTY_FIVE_MB = 25 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Must be signed in — reject anonymous uploads so strangers can't
        // fill the Blob store. Every /launch form submitter is auth'd, so
        // this is consistent with the app's existing trust boundary.
        const supabase = await createServerSupabase();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Sign in to upload a demo video.");
        }
        return {
          allowedContentTypes: ["video/mp4", "video/webm"],
          maximumSizeInBytes: TWENTY_FIVE_MB,
          tokenPayload: JSON.stringify({ userId: user.id }),
          // addRandomSuffix keeps filenames unique even if two creators
          // submit "demo.mp4" in the same second.
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Server-side observer. Not awaited by the client. If this throws,
        // the upload still succeeded on Blob's side — we just lose the log
        // line. Keep the work cheap so it never delays the writeback.
        try {
          const parsed = tokenPayload ? JSON.parse(tokenPayload) : {};
          console.log("[blob/upload-video] completed", {
            url: blob.url,
            size: blob.pathname,
            userId: parsed.userId,
          });
        } catch {
          // ignore
        }
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload token denied" },
      { status: 400 },
    );
  }
}
