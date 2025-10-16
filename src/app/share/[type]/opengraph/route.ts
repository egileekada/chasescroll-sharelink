import { NextResponse } from "next/server";
import { RESOURCE_URL } from "@/constants";
import { capitalizeFLetter } from "@/utils/capitalizeLetter";

// ✅ This route returns static OG HTML for WhatsApp, LinkedIn, etc.


interface Props {
  params: { type: string }
  searchParams: { id: string; affiliateID?: string }
}

export async function GET(
  request: Request,
  { params, searchParams }: Props
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;
  const type = params.type;
  const { id } = searchParams

  try {
    // Fetch event data from your backend

    if (type === "fundraiser") {

      const res = await fetch(`${baseUrl}/fund-raiser?id=${id}`, {
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

      // <meta property="og:description" content="${event.eventDescription}" />
      // Construct Open Graph metadata HTML
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            <title>${capitalizeFLetter(event.name)}</title> 
  
            <!-- ✅ Open Graph -->
            <meta property="og:type" content="website" />
            <meta property="og:title" content="${capitalizeFLetter(event.name)}" />
            <meta property="og:image" content="${RESOURCE_URL + event.bannerImage}" />
            <meta property="og:url" content="${baseUrl}/events/${id}" />
  
            <!-- ✅ Twitter -->
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${capitalizeFLetter(event.name)}" /> 
            <meta name="twitter:image" content="${RESOURCE_URL + event.bannerImage}" />
  
            <meta http-equiv="refresh" content="0; url=${baseUrl}/share/event/${id}" />
          </head>
          <body>
            <p>Redirecting to event...</p>
            <script>
              // Fallback redirect for crawlers that ignore meta refresh
              window.location.href = "/share/event/${id}";
            </script>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: { "Content-Type": "text/html" },
      });
    }
  } catch (error) {
    console.error("Error generating OG page:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
