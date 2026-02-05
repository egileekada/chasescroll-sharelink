import { NextResponse } from "next/server";
import { RESOURCE_URL } from "@/constants";
import { capitalizeFLetter } from "@/utils/capitalizeLetter";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const sharebaseUrl = process.env.NEXT_PUBLIC_SHAREPAGE_URL;

    if (!baseUrl) {
      console.error("Missing NEXT_PUBLIC_BASE_URL");
      return new NextResponse("Server Misconfiguration", { status: 500 });
    }

    const apiUrl = `${baseUrl}/fund-raiser/search?id=${id}`;
    console.log("Calling backend:", apiUrl);

    const res = await fetch(apiUrl, { cache: "no-store" });

    if (!res.ok) {
      console.error("Backend fetch failed:", res.status, res.statusText);
      return new NextResponse("Failed to fetch fundraiser " + id, { status: 500 });
    }

    const data = await res.json();
    const event = data?.content?.[0];

    if (!event) {
      console.error("Fundraiser not found for id:", id);
      return new NextResponse("Not found" + id, { status: 404 });
    }

    // ✅ Escape to avoid HTML breaking OG tags
    const escape = (str: string) =>
      str
        ?.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const title = escape(capitalizeFLetter(event.name));
    const description = escape(event.description || "Support this fundraiser");
    const imageUrl = `${RESOURCE_URL}${event.bannerImage}`;

    // ✅ Must be absolute for OG crawlers
    const shareUrl = `${sharebaseUrl}/fundraiser/${id}`;

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${shareUrl}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />

    <!-- Redirect -->
    <meta http-equiv="refresh" content="0; url=${shareUrl}" />
  </head>
  <body>
    Redirecting…

    <script>
      window.location.href = "${shareUrl}";
    </script>
  </body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error generating OG page:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
