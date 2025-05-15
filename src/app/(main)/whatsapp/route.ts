import { type NextRequest, NextResponse } from "next/server";

import { Agent } from "@/chat";

import { WhatsappEvent } from "./types";
import { sendMessage, UserConversation } from "./utils";

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_SYSTEM_USER_KEY = process.env.WHATSAPP_SYSTEM_USER_KEY;


export async function GET(req: NextRequest) {
  const hubMode = req.nextUrl.searchParams.get("hub.mode");
  const hubChallenge = req.nextUrl.searchParams.get("hub.challenge");
  const hubVerifyToken = req.nextUrl.searchParams.get("hub.verify_token");

  if (hubMode == "subscribe" && hubVerifyToken == WHATSAPP_VERIFY_TOKEN) {
    console.log("Webhook verified");
    return new NextResponse(hubChallenge, { status: 200 });
  } else {
    console.log("Webhook verification failed");
    return new NextResponse("Verification failed", { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as WhatsappEvent;
  // console.log("Received webhook:", JSON.stringify(body, null, 2));

  const data = body.entry[0];

  for (const change of data.changes) {
    if (change.field === "messages") {
      if (change.value.messages) {
        const business = change.value.metadata;
        const message = change.value.messages[0];
        const contact = change.value.contacts![0];

        // console.log("Contact:", contact);
        // console.log("Message:", message);
        // console.log("Business:", business);

        const salesRep = await UserConversation.getSalesRep(business);
        const conversation = await UserConversation.getUserConversationId(
          contact,
          salesRep.user_id,
          salesRep.id,
        );

        await UserConversation.addMessageToConversation(
          conversation.id,
          "user",
          message.text!.body,
        );

        const agent = new Agent(conversation.id);
        const status = await agent.getSessionStatus();
        if (status === "unknown") {
          await agent.initialize("You are a helpful assistant. This customers want to buy something from Raven Consulting, please help", []);
        }

        const res = await agent.send(message.text!.body);

        if (res.type === "message") {
          await UserConversation.addMessageToConversation(
            conversation.id,
            "agent",
            res.message!,
          )
          await sendMessage({
            to: contact!.wa_id,
            type: "text",
            messaging_product: "whatsapp",
            text: {
              preview_url: false,
              body: res.message!,
            },
          }, business.phone_number_id, WHATSAPP_SYSTEM_USER_KEY!);
        }

        if (res.isEnded) {
          // console.log("Ending conversation");
          await UserConversation.endUserConversation(
            contact!.wa_id,
            // FIXME: Change this to the actual result
            "success",
          );
        }
      }
    }
  }

  return new NextResponse("OK", { status: 200 });
}