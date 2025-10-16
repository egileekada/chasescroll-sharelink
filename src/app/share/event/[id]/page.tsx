import { RESOURCE_URL } from '@/constants';
import Event from '@/views/share/Event';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // You can keep your current metadata generation logic here
  return {
    title: 'Event Details',
    description: 'View this event information.',
  };
}

export default async function EventDetailsPage(props: Props) {
  const params = await props.params;
  const searchParams = (await props.searchParams) || {};
  const id = params.id;

  // ✅ Detect if the request comes from a social crawler
  const userAgent = (await headers()).get('user-agent') || '';
  const isCrawler = /facebookexternalhit|WhatsApp|LinkedInBot|Twitterbot|Slackbot|Discordbot/i.test(
    userAgent
  );

  // ✅ If it's a crawler, redirect to static OG HTML version
  if (isCrawler) {
    redirect(`/events/${id}/opengraph`);
  }

  // ✅ Otherwise, render your full Event page for humans
  const affiliateID =
    typeof searchParams['affiliate_id'] === 'string'
      ? searchParams['affiliate_id']
      : Array.isArray(searchParams['affiliate_id'])
      ? searchParams['affiliate_id'][0]
      : undefined;

  return <Event id={id} affiliateID={affiliateID} />;
}
