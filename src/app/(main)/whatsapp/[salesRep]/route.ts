import { type NextRequest, NextResponse } from "next/server";

import { Agent } from "@/chat";

import { WhatsappEvent } from "./types";
import { sendMessage, UserConversation } from "./utils";

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


        const { isNewConversation, conversation, salesRep } = await UserConversation.getUserConversationId(
          contact,
          salesRepId,
        );

        await UserConversation.addMessageToConversation(
          conversation.id,
          "user",
          message.text!.body,
        );

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

          await UserConversation.addMessageToConversation(
            conversation.id,
            "agent",
            salesRep.initial_message,
          );

          await sendMessage({
            to: contact!.wa_id,
            type: "text",
            messaging_product: "whatsapp",
            text: {
              preview_url: false,
              body: salesRep.initial_message,
            },
          }, business.phone_number_id, salesRep.whatappCredentials.accessToken);

          return new NextResponse("OK", { status: 200 });
        }

        const res = await agent.send(message.text!.body);

        if (res.type === "message") {
          await UserConversation.addMessageToConversation(
            conversation.id,
            "agent",
            res.message!,
          );

          await sendMessage({
            to: contact!.wa_id,
            type: "text",
            messaging_product: "whatsapp",
            text: {
              preview_url: false,
              body: res.message!,
            },
          }, business.phone_number_id, salesRep.whatappCredentials.accessToken);
        }

        if (res.isEnded) {
          // console.log("Ending conversation");
          await UserConversation.endUserConversation(
            contact,
            salesRep,
            // FIXME: Change this to the actual result
            "success",
          );
        }
      }
    }
  }

  return new NextResponse("OK", { status: 200 });
}