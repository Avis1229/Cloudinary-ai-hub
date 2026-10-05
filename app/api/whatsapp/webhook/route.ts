import { NextRequest, NextResponse } from "next/server";

// ─── GET: Meta Webhook Verification Handshake ────────────────────────────────
// When you click "Verify and save" on the Meta dashboard, Meta sends a GET
// request to this URL with a hub.challenge. We must echo it back to confirm
// ownership of the endpoint.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp Webhook] Verification successful ✅");
    return new NextResponse(challenge, { status: 200 });
  }

  console.error("[WhatsApp Webhook] Verification failed ❌ — token mismatch or wrong mode");
  return new NextResponse("Forbidden", { status: 403 });
}

// ─── POST: Receive Incoming Messages / Status Updates ────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // WhatsApp wraps events inside body.entry[].changes[]
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // ── Incoming message ──────────────────────────────────────────────────────
    if (value?.messages?.length) {
      const message = value.messages[0];
      const from    = message.from;   // sender's WhatsApp number (E.164 format)
      const msgType = message.type;   // "text" | "image" | "order" | ...

      if (msgType === "text") {
        const text = message.text?.body ?? "";
        console.log(`[WhatsApp] 📨 Message from ${from}: "${text}"`);

        // TODO: Route to your order/support handler here
        // e.g. await handleIncomingWhatsAppMessage({ from, text });
      } else {
        console.log(`[WhatsApp] Received ${msgType} message from ${from}`);
      }
    }

    // ── Status update (delivered / read / failed) ─────────────────────────────
    if (value?.statuses?.length) {
      const status = value.statuses[0];
      console.log(`[WhatsApp] Status update — id: ${status.id}, status: ${status.status}`);
    }

    // Meta expects a fast 200 OK, otherwise it retries
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[WhatsApp Webhook] Error parsing body:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
