import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { RESOURCE_URL } from '@/constants'

interface Props {
    params: { type: string }
    searchParams: { id: string; affiliateID?: string }
}

const BASE_URL_API = process.env.NEXT_PUBLIC_BASE_URL

// ✅ Force server-side rendering for proper OG metadata
export const dynamic = 'force-static'
export const revalidate = 60

// ✅ Your production domain
const BASE_URL = 'https://chasescroll.com'

// ✅ Generate metadata for OG / Twitter / WhatsApp previews
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { type } = params
    const { id } = searchParams

    if (type === 'event' && id) {
        try {
            // ✅ Use fetch instead of httpService
            const res = await fetch(`${BASE_URL_API}/events?id=${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // force cache for static generation
                next: { revalidate: 60 },
            })

            if (!res.ok) {
                throw new Error(`Failed to fetch event metadata: ${res.status}`)
            }

            const data = await res.json()
            const event = data?.content?.[0]

            console.log(event);
            

            if (event?.eventName) {
                const imageUrl = event.currentPicUrl?.startsWith('http')
                    ? event.currentPicUrl
                    : `${RESOURCE_URL}${event.currentPicUrl || '/logo.png'}`

                const title = `${event.eventName} | Chasescroll`
                const description = event.eventDescription || 'Join this amazing event on Chasescroll'
                const pageUrl = `${BASE_URL}/share/event?id=${id}`

                return {
                    title,
                    description,
                    openGraph: {
                        type: 'website',
                        url: pageUrl,
                        title,
                        description,
                        images: [
                            {
                                url: imageUrl,
                                width: 1200,
                                height: 630,
                                alt: event.eventName || 'Event Image',
                            },
                        ],
                        siteName: 'Chasescroll',
                    },
                    twitter: {
                        card: 'summary_large_image',
                        title,
                        description,
                        images: [imageUrl],
                    },
                    alternates: {
                        canonical: pageUrl,
                    },
                }
            }
        } catch (error) {
            console.error('Error fetching event metadata:', error)
        }
    }

    // ✅ Default fallback metadata
    return {
        title: 'Chasescroll | Share',
        description: 'Discover amazing events, fundraisers, and services on Chasescroll',
        openGraph: {
            type: 'website',
            url: `${BASE_URL}/share`,
            title: 'Chasescroll | Share',
            description: 'Discover amazing events, fundraisers, and services on Chasescroll',
            images: [
                {
                    url: `${BASE_URL}/logo.png`,
                    width: 1200,
                    height: 630,
                    alt: 'Chasescroll Logo',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Chasescroll | Share',
            description: 'Discover amazing events, fundraisers, and services on Chasescroll',
            images: [`${BASE_URL}/logo.png`],
        },
        alternates: {
            canonical: `${BASE_URL}/share`,
        },
    }
}

// ✅ Dynamically render the right component
export default async function SharePage({ params, searchParams }: Props) {
    const { type } = params
    const { id, affiliateID } = searchParams

    const allowedTypes = ['event', 'fundraiser', 'service', 'rental', 'product']
    if (!allowedTypes.includes(type.toLowerCase())) {
        notFound()
    }

    const ComponentMap = {
        event: async () => {
            const EventComponent = (await import('@/views/share/Event')).default
            return <EventComponent id={id} affiliateID={affiliateID} />
        },
        fundraiser: async () => {
            const FundraiserComponent = (await import('@/views/share/Fundraiser')).default
            return <FundraiserComponent id={id} />
        },
        service: async () => {
            const ServiceComponent = (await import('@/views/share/Service')).default
            return <ServiceComponent id={id} />
        },
        rental: async () => {
            const RentalComponent = (await import('@/views/share/Rental')).default
            return <RentalComponent id={id} />
        },
        product: async () => {
            const ProductComponent = (await import('@/views/share/Product')).default
            return <ProductComponent id={id} />
        },
    }

    const DynamicComponent =
        ComponentMap[type.toLowerCase() as keyof typeof ComponentMap]
    const Content = await DynamicComponent()

    return <div className="container mx-auto p-4">{Content}</div>
}
