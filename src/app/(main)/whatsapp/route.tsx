import { type NextRequest, NextResponse } from "next/server";

import { sendMessage } from "./utils";
import { WhatsappEvent } from "./types";

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;


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

  console.log("Received webhook:", JSON.stringify(body, null, 2));

  const data = body.entry[0];

  for (const change of data.changes) {
    if (change.field === "messages") {
      if (change.value.messages) {
        const business = change.value.metadata;
        const message = change.value.messages[0];
        const contact = change.value.contacts?.[0];

        console.log("Contact:", contact);
        console.log("Message:", message);
        console.log("Business:", business);

        await sendMessage({
          to: contact!.wa_id,
          type: "text",
          messaging_product: "whatsapp",
          text: {
            preview_url: false,
            body: "Hello from the server!",
          },
        }, business.phone_number_id, process.env.WHATSAPP_SYSTEM_USER_KEY!);
      }
    } else {
      console.log("Unknown field:", change.field);
      console.log("Change:", change);
    }
  }

  return new NextResponse("OK", { status: 200 });
}