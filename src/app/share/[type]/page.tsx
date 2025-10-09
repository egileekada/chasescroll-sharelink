import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import httpService, { unsecureHttpService } from '@/services/httpService'
import { URLS } from '@/services/urls'
import { RESOURCE_URL } from '@/constants'

interface Props {
    params: { type: string }
    searchParams: { id: string; affiliateID?: string }
}

// Your site base URL — update this to your production domain
const BASE_URL = 'https://chasescroll.com'

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { type } = params
    const { id } = searchParams
  
    if (type?.toLowerCase() === 'event' && id) {
      try {
        const response = await unsecureHttpService.get(`${URLS.event}/events`, { params: { id } })
        const event = response.data?.content[0]

        console.log(event);
  
        if (event) {
          const imageUrl = event.currentPicUrl?.startsWith('http')
            ? event.currentPicUrl
            : `${RESOURCE_URL}${event.currentPicUrl || '/logo.png'}`
  
          const title = `${event.eventName} | Chasescroll`
          const description = event.eventDescription || 'Join this amazing event on Chasescroll'
          const pageUrl = `${BASE_URL}/share/event?id=${id}`
  
          return {
            metadataBase: new URL(BASE_URL),
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
            alternates: { canonical: pageUrl },
          }
        }
      } catch (error) {
        console.error('Error fetching event metadata:', error)
      }
    }
  
    // fallback
    return {
      metadataBase: new URL(BASE_URL),
      title: 'Chasescroll | Share',
      description: 'Discover amazing events, fundraisers, and services on Chasescroll',
      openGraph: {
        type: 'website',
        url: `${BASE_URL}/share`,
        title: 'Chasescroll | Share',
        description: 'Discover amazing events, fundraisers, and services on Chasescroll',
        images: [{ url: `${BASE_URL}/logo.png`, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Chasescroll | Share',
        description: 'Discover amazing events, fundraisers, and services on Chasescroll',
        images: [`${BASE_URL}/logo.png`],
      },
    }
  }
  

export default async function SharePage({ params, searchParams }: Props) {
    const { type } = params
    const { id, affiliateID } = searchParams

    const allowedTypes = ['event', 'fundraiser', 'service', 'rental', 'product']
    if (!allowedTypes.includes(type.toLowerCase())) {
        notFound()
    }

    // Dynamically import components by type
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
