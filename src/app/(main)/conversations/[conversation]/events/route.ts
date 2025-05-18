import type { NextRequest } from "next/server";

import { subscribeToConversation } from "@/chat/pubsub";

interface RouteProps {
  params: Promise<{
    conversation: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteProps): Promise<Response> {
  const { conversation: conversationId } = await params;

  console.log(req.url);

  const responseStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let isControllerClosed = false;

      // Send initial connection confirmation
      controller.enqueue(encoder.encode(`event: open\ndata: connected\n\n`));

      // Set up periodic ping
      const interval = setInterval(() => {
        try {
          if (!isControllerClosed) {
            controller.enqueue(encoder.encode(`event: ping\ndata: ping\n\n`));
          }
        } catch (error) {
          clearInterval(interval);
          console.error("Error sending ping:", error);
          isControllerClosed = true;
        }
      }, 30000);

      subscribeToConversation(conversationId, (message) => {
        if (isControllerClosed) {
          return;
        }

        try {
          const chunk = encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          controller.enqueue(chunk);
        } catch {
          // If controller is closed, this will throw
          isControllerClosed = true;
        }

        // You can also use this to manually close
        // controller.close();
        // isControllerClosed = true;

        // return () => {
        //   clearInterval(pingInterval);
        //   controller.close();
        //   isControllerClosed = true;
        // };
      });
    }
  });

  return new Response(responseStream, {
    headers: {
      "Connection": "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}