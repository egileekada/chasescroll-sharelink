import { NextResponse } from "next/server";
import { RESOURCE_URL } from "@/constants";
import { capitalizeFLetter } from "@/utils/capitalizeLetter";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;
  const eventId = params.id;

  try {
    // 1️⃣ Fetch event data from backend
    const res = await fetch(`${baseUrl}/events/events?id=${eventId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch event data: ${res.statusText}`);
    }

    const data = await res.json();
    const event = data?.content?.[0];

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // 2️⃣ Build full, direct, static image URL
    const imageUrl = `${RESOURCE_URL}${event.currentPicUrl}`;

    // 3️⃣ Construct the OG HTML (without redirect)
    // WhatsApp ignores meta-refresh & JS redirects — so we let it load this HTML directly.
    // Add "og:description" and correct MIME to improve detection.
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          <title>${capitalizeFLetter(event.eventName)}</title>

          <!-- ✅ Open Graph -->
          <meta property="og:type" content="website" />
          <meta property="og:title" content="${capitalizeFLetter(event.eventName)}" />
          <meta property="og:description" content="${event.eventDescription || "Check out this event on ChaseScroll!"}" />
          <meta property="og:image" content="${imageUrl}" />
          <meta property="og:image:secure_url" content="${imageUrl}" />
          <meta property="og:image:type" content="image/jpeg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:url" content="https://share.chasescroll.com/share/event/${eventId}" />

          <!-- ✅ Twitter -->
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${capitalizeFLetter(event.eventName)}" />
          <meta name="twitter:description" content="${event.eventDescription || "Check out this event on ChaseScroll!"}" />
          <meta name="twitter:image" content="${imageUrl}" />

          <meta name="robots" content="index,follow" />
        </head>
        <body>
          <h1>${capitalizeFLetter(event.eventName)}</h1>
          <p>${event.eventDescription || ""}</p>
          <img src="${imageUrl}" alt="${capitalizeFLetter(event.eventName)}" width="600" />
        </body>
      </html>
    `;

    // 4️⃣ Return the HTML — do NOT redirect (WhatsApp doesn’t follow redirects)
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating OG page:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
