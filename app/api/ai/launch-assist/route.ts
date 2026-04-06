import { streamLaunchAssistant } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamLaunchAssistant({
            title: body.title || "",
            tagline: body.tagline || "",
            description: body.description || "",
            category: body.category || "",
          })) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error("AI launch assist error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("AI launch assist error:", error);
    return new Response("AI assistant unavailable", { status: 500 });
  }
}
