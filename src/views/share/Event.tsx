'use client';
import httpService from '@/services/httpService';
import { URLS } from '@/services/urls';
import { Box, Button, Container, Flex, Heading, HStack, Skeleton, VStack, Menu, Portal, Avatar } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Image, Text } from "@chakra-ui/react"
import React from 'react'
import { AxiosResponse } from 'axios';
import { PaginatedResponse } from '@/models/PaginatedResponse';
import { IEventTicket, IEventType, IProductTypeData } from '@/models/Event';
import { RESOURCE_URL } from '@/constants';
import { ArrowLeft, ArrowLeft2, Location, Calendar, Calendar1, ArrowDown2 } from 'iconsax-reactjs';
import ChasescrollBox from '@/components/Custom/ChasescrollBox';
import MapComponent from '@/components/Custom/MapComponent';
import { capitalizeFLetter } from '@/utils/capitalizeLetter';
import { useRouter } from 'next/navigation'
import { DateTime } from 'luxon';
import { formatNumber } from '@/utils/formatNumber';
import Head from 'next/head';
import { atom, useSetAtom } from 'jotai';
import { activeEventAtom, activeTicketAtom } from '@/states/activeTicket';
import TicketPurchaseModal from '@/components/Custom/modals/TicketPurchaseModal';
import { toaster } from "@/components/ui/toaster"
import { useSession } from 'next-auth/react'


export const currentIdAtom = atom<string | null>(null);
function Event({ id }: { id: string }) {
    const router = useRouter();
    const setCurrentId = useSetAtom(currentIdAtom);
    const session = useSession();

    React.useEffect(() => {
        console.log('the session');
        console.log(session);
    }, [session.data])

    setCurrentId(id);
    const [event, setEvent] = React.useState<IEventType | null>(null);
    const [ticketType, setTicketType] = React.useState<string | null>(null);
    const [tickets, setTickets] = React.useState<IProductTypeData[]>([]);
    const [showModal, setShowModal] = React.useState(false);
    const setActiveTicket = useSetAtom(activeTicketAtom);
    const setActiveEvent = useSetAtom(activeEventAtom);

    const { isLoading, data, isError, error } = useQuery<AxiosResponse<PaginatedResponse<IEventType>>>({
        queryKey: ['get-external-events', id],
        queryFn: () => httpService.get(`${URLS.event}/events`, {
            params: {
                id
            }
        })
    });

    const ticketsQuery = useQuery<AxiosResponse<PaginatedResponse<IEventTicket>>>({
        queryKey: ['get-event-tickets', id],
        queryFn: () => httpService.get(`${URLS.event}/get-event-tickets-no-auth`, {
            params: {
                eventID: id
            }
        })
    });

    React.useEffect(() => {
        if (!isLoading && !isError && data?.data) {
            const item: PaginatedResponse<IEventType> = data?.data;
            setEvent(item?.content[0]);
            setTicketType(item?.content[0].productTypeData[0].ticketType);
            setTickets(item.content[0].productTypeData)
        }
    }, [data, isError, isLoading]);

    // Dynamically update the page title when event data loads
    React.useEffect(() => {
        if (event?.eventName) {
            document.title = `Chasescroll | ${event.eventName}`;
        } else {
            document.title = 'Chasescroll | Event';
        }
    }, [event?.eventName]);

    // functions
    const handleTicketType = React.useCallback((): IProductTypeData => {
        return (event as IEventType)?.productTypeData?.filter((item) => item.ticketType === ticketType)[0] as IProductTypeData;
    }, [ticketType]);

    const handlePayment = React.useCallback(() => {
        const activeTicket = tickets.filter((item) => item.ticketType === ticketType)[0];
        if (activeTicket) {
            setActiveTicket(activeTicket);
            setShowModal(true);
            setActiveEvent(event);
            return;
        } else {
            toaster.create({
                title: 'Error',
                description: 'No ticket found for this ticket type',
                type: 'error',
            });
        }
    }, [ticketType, tickets])

    return (
        <Box w="full" h="full" p={6}>
            <TicketPurchaseModal isOpen={showModal} onClose={() => setShowModal(false)} />
            <Head>
                <title>Chasescroll | {event?.eventName || 'Event'}</title>
            </Head>
            <Container>
                <HStack alignItems={'center'} mb='20px'>
                    <ArrowLeft2 onClick={() => router.back()} cursor={'pointer'} variant='Outline' size='30px' />
                    <Heading>Event</Heading>
                    {!isLoading && !isError && (
                        <Heading color='primaryColor'> / {event?.eventName}</Heading>
                    )}
                </HStack>
                {!isLoading && !isError && data?.data && (
                    <Flex w='full' h="full" spaceX={6} mt="10px">
                        <Box flex={1} h="full">
                            <Box width={'full'} h="500px" mb="10xp" borderWidth={'1px'} borderColor="gray.200" borderRadius={'16px'} overflow={'hidden'}>
                                <Image w="full" h="full" objectFit="cover" src={(RESOURCE_URL as string) + (event?.currentPicUrl as string)} />
                            </Box>

                            <HStack w="auto" h="40px" borderRadius={"full"} spaceX={3} justifyContent={'flex-start'} alignItems={'center'} px={2} bgColor={'gray.100'} mt="20px">
                                <Location size={25} variant='Outline' color="blue" />
                                <Text>{event?.location?.toBeAnnounced ? 'To be announced' : event?.location.locationDetails}</Text>
                            </HStack>

                            <Heading fontSize={'16px'} mt="20px">Location and surrounding</Heading>

                            <Button
                                variant={'solid'}
                                width="auto"
                                height="45px"
                                mt='20px'
                                borderRadius={'full'}
                                color="white"
                                bgColor="primaryColor"
                                onClick={() => {
                                    if (event?.location?.latlng) {
                                        const [lat, lng] = event.location.latlng.split(' ');
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                                    }
                                }}
                                disabled={!event?.location?.latlng}
                            >
                                Direction
                            </Button>
                            <Box height={'20px'} />
                            {event?.location?.latlng ? (
                                <MapComponent
                                    lat={parseFloat(event.location.latlng.split(' ')[0])}
                                    lng={parseFloat(event.location.latlng.split(' ')[1])}
                                    width="100%"
                                    height="200px"
                                    zoom={15}
                                    borderRadius="16px"
                                    markerTitle={event?.eventName || 'Event Location'}
                                />
                            ) : (
                                <Box w='full' h="200px" mt='20px' borderRadius={'16px'} bgColor="gray.100"></Box>
                            )}
                        </Box>

                        <Box flex={1} h="full" borderWidth='1px' borderColor="gray.200" p="20px" borderRadius={'16px'}>
                            <Heading fontSize={'24px'}>{event?.eventName}</Heading>
                            <VStack mt='20px' w="full" alignItems={'flex-start'} spaceY={0} borderRadius={'16px'}>
                                <Heading fontSize={'20px'}>Event details</Heading>
                                <Text fontSize={'16px'} mt="0px">{event?.eventDescription}</Text>
                            </VStack>

                            <HStack w="full" h="90px" p={2} borderTopWidth={'1px'} borderTopColor={'gray.200'} borderBottomWidth={'1px'} borderBottomColor={'gray.200'} mt='20px' alignItems={'center'} spaceX={2}>
                                <ChasescrollBox width='50px' height='50px' borderRadius='10px'>
                                    <Avatar.Root width={'full'} height={'full'} borderWidth="1px" borderColor="#233DF3">
                                        <Avatar.Fallback name={`${event?.createdBy?.firstName} ${event?.createdBy?.lastName}`} />
                                        <Avatar.Image src={`${RESOURCE_URL}${event?.createdBy?.data?.imgMain?.value}`} />
                                    </Avatar.Root>
                                </ChasescrollBox>
                                <VStack spaceX={0} spaceY={-2} alignItems={'flex-start'}>
                                    <Text fontFamily={'sans-serif'} fontWeight={700} fontSize={'16px'}>{capitalizeFLetter(event?.createdBy?.firstName)} {capitalizeFLetter(event?.createdBy?.lastName)}</Text>
                                    <Text fontFamily={'sans-serif'} fontWeight={300} fontSize={'14px'}>{capitalizeFLetter(event?.createdBy?.username)}</Text>
                                </VStack>
                            </HStack>

                            <VStack alignItems={'flex-start'} mt='20px' spaceY={2} w="50%">
                                <HStack justifyContent={'space-between'} w="full">
                                    <Text>Start Date</Text>
                                    <HStack>
                                        <Calendar1 size={'25px'} color="blue" variant='Outline' />
                                        <Text>{DateTime.fromMillis(event?.startDate || 0).toFormat('dd LLL yyyy') ?? ''} {DateTime.fromMillis(event?.startTime || 0).toFormat('hh:mm a')}</Text>
                                    </HStack>
                                </HStack>

                                <HStack justifyContent={'space-between'} w="full">
                                    <Text>End Date</Text>
                                    <HStack>
                                        <Calendar1 size={'25px'} color="blue" variant='Outline' />
                                        <Text>{DateTime.fromMillis(event?.endDate || 0).toFormat('dd LLL yyyy') ?? ''} {DateTime.fromMillis(event?.endTime || 0).toFormat('hh:mm a')}</Text>
                                    </HStack>
                                </HStack>
                            </VStack>

                            <VStack w='50%' borderRadius={'16px'} borderWidth={'1px'} borderColor={'gray.200'} mt='20px' p='2'>
                                <Menu.Root>
                                    <Menu.Trigger asChild>
                                        <Flex justifyContent={'center'} alignItems="center" bgColor={'gray.100'} borderRadius={'16px'} w="full" h="50px" spaceX={4}>
                                            <Text>{handleTicketType()?.ticketType} {formatNumber(handleTicketType()?.ticketPrice)}</Text>
                                            {(event?.productTypeData as [])?.length > 1 && (
                                                <ArrowDown2 size={20} color="blue" variant='Bold' />
                                            )}
                                        </Flex>
                                    </Menu.Trigger>
                                    <Portal>
                                        <Menu.Positioner>
                                            <Menu.Content w="full">
                                                {event?.productTypeData.map((item, index) => (
                                                    <Menu.Item onClick={() => setTicketType(item.ticketType)} value={item.ticketType} key={index}>{item.ticketType} {formatNumber(item.ticketPrice)}</Menu.Item>
                                                ))}
                                            </Menu.Content>
                                        </Menu.Positioner>
                                    </Portal>
                                </Menu.Root>

                                <Button onClick={handlePayment} w="full" h="60px" borderRadius={'full'} bgColor="chasescrollBlue" color="white">Buy Ticket</Button>

                            </VStack>
                        </Box>
                    </Flex>
                )}

                {isLoading && (
                    <Flex w='full' h="full" spaceX={6} mt="10px">
                        <Box flex={1} h="full">
                            <Skeleton w="full" h="500px" borderRadius={'16px'} mb='10px' />
                            <Skeleton w="full" h="150px" mb="5px" borderRadius={'16px'} />
                        </Box>
                        <Box flex={1} h="full">
                            <Skeleton w="full" h="50px" mb="5px" borderRadius={'8px'} />
                            <Skeleton w="full" h="50px" mb="5px" borderRadius={'8px'} />

                        </Box>
                    </Flex>
                )}
            </Container>
        </Box>
    )
}

export default Event

// https://chasescroll-next-app-test.vercel.app/event/686680485e09794522864d54