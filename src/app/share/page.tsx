import { RESOURCE_URL } from '@/constants';
import Event from '@/views/share/Event';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

// ✅ Keep dynamic rendering for event content
export const dynamic = "force-dynamic";

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;

  try {
    // ✅ Ensure server-side fetch so OG tags are visible to crawlers
    const res = await fetch(`${baseUrl}/events/events?id=${id}`, {
      method: 'GET',
      // 👇 Important for metadata — static or SSR-friendly caching
      cache: 'no-store',
      next: { revalidate: 60 },
    });

    const product = await res.json();
    const event = product?.content?.[0];

    if (!event) {
      return {
        title: "Event not found",
        description: "This event may no longer be available.",
      };
    }

    return {
      title: event.eventName,
      description: event.eventDescription,
      openGraph: {
        title: event.eventName,
        description: event.eventDescription,
        url: `${baseUrl}/events/${id}`,
        type: 'website',
        images: [
          {
            url: RESOURCE_URL + event.currentPicUrl,
            width: 1200,
            height: 630,
            alt: event.eventName,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: event.eventName,
        description: event.eventDescription,
        images: [RESOURCE_URL + event.currentPicUrl],
      },
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "Event Details",
      description: "View details of this event.",
    };
  }
}

export default async function EventDetailsPage(props: Props) {
  const params = await props.params;
  const searchParams = (await props.searchParams) || {};
  const id = params.id;

  const affiliateID =
    typeof searchParams['affiliate_id'] === 'string'
      ? searchParams['affiliate_id']
      : Array.isArray(searchParams['affiliate_id'])
      ? searchParams['affiliate_id'][0]
      : undefined;

  return <Event id={id} affiliateID={affiliateID} />;
}
