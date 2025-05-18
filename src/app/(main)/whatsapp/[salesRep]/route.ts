import { type NextRequest, NextResponse } from "next/server";

import { Agent } from "@/chat";
import { WhatsappEvent } from "@/chat/whatsapp/types";
import { UserConversation, sendMessage, showTypingIndicator } from "@/chat/whatsapp";


const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;


export async function GET(req: NextRequest) {
  const hubMode = req.nextUrl.searchParams.get("hub.mode");
  const hubChallenge = req.nextUrl.searchParams.get("hub.challenge");
  const hubVerifyToken = req.nextUrl.searchParams.get("hub.verify_token");

  if (hubMode == "subscribe" && hubVerifyToken == WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(hubChallenge, { status: 200 });
  } else {
    return new NextResponse("Verification failed", { status: 403 });
  }
}

interface RouteContext {
  params: Promise<{
    salesRep: string;
  }>
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { salesRep: salesRepId } = await params;

  const body = await req.json() as WhatsappEvent;
  const data = body.entry[0];

  for (const change of data.changes) {
    if (change.field === "messages") {
      if (change.value.messages) {
        const business = change.value.metadata;
        const message = change.value.messages[0];
        const contact = change.value.contacts![0];

        try {
          const { isNewConversation, conversation, salesRep } = await UserConversation.getUserConversationId(
            contact,
            salesRepId,
          );

          await UserConversation.addMessageToConversation(
            conversation.id,
            message.id,
            "user",
            message.text!.body,
          );

          if (conversation.handoff_active) {
            console.log("Handoff active, skipping message");
            return new NextResponse("OK", { status: 200 });
          }

          const agent = new Agent(conversation.id);
          const status = await agent.getSessionStatus();
          if (status === "unknown") {
            await agent.initialize(salesRep.sop, []);
          }

          if (isNewConversation) {
            await agent.addMessageToHistory({
              role: "user",
              content: salesRep.initial_message,
            });

            await sendMessage({
              to: contact!.wa_id,
              type: "text",
              messaging_product: "whatsapp",
              text: {
                preview_url: false,
                body: salesRep.initial_message,
              },
            }, business.phone_number_id, salesRep.whatappCredentials.accessToken);

            await UserConversation.addMessageToConversation(
              conversation.id,
              message.id,
              "agent",
              salesRep.initial_message,
            );

            return new NextResponse("OK", { status: 200 });
          }

          await showTypingIndicator(
            business.phone_number_id,
            message.id,
            salesRep.whatappCredentials.accessToken,
          );

          const res = await agent.send(message.text!.body);

          if (res.type === "message") {
            await sendMessage({
              to: contact!.wa_id,
              type: "text",
              messaging_product: "whatsapp",
              text: {
                preview_url: false,
                body: res.message!,
              },
            }, business.phone_number_id, salesRep.whatappCredentials.accessToken);

            await UserConversation.addMessageToConversation(
              conversation.id,
              message.id,
              "agent",
              res.message!,
            );
          }

          if (res.isEnded) {
            // console.log("Ending conversation");
            await UserConversation.endUserConversation(
              contact.wa_id,
              salesRep,
            );
          }
        } catch (error) {
          console.error("Error processing message", error);
        } finally {
          console.log("Message processed");
        }
      }
    }
  }

  return new NextResponse("OK", { status: 200 });
}