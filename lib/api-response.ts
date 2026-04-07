import { NextResponse } from "next/server";

export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, errorId?: string) {
  return NextResponse.json(
    { success: false, error: { message, code: status, ...(errorId && { errorId }) } },
    { status },
  );
}
