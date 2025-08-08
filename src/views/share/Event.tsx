'use client';
import httpService from '@/services/httpService';
import { URLS } from '@/services/urls';
import { Box, Button, Container, Flex, Heading, HStack, Skeleton, VStack, Menu, Portal, Avatar } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Image, Text } from "@chakra-ui/react"
import React from 'react'
import { AxiosResponse } from 'axios';
import { PaginatedResponse } from '@/models/PaginatedResponse';
import { IEventType, IProductTypeData } from '@/models/Event';
import { RESOURCE_URL } from '@/constants';
import { ArrowLeft, ArrowLeft2, Location, Calendar1, ArrowDown2 } from 'iconsax-reactjs';
import ChasescrollBox from '@/components/Custom/ChasescrollBox';
import MapComponent from '@/components/Custom/MapComponent';
import { capitalizeFLetter } from '@/utils/capitalizeLetter';
import { useRouter } from 'next/navigation'
import { DateTime } from 'luxon';
import Head from 'next/head';
import { atom, useAtom, useSetAtom } from 'jotai';
import { activeEventAtom, activeTicketAtom, affiliateIDAtom, ticketurchaseStepAtom } from '@/states/activeTicket';
import TicketPurchaseModal from '@/components/Custom/modals/TicketPurchaseModal/Index';
import { toaster } from "@/components/ui/toaster"
import { STORAGE_KEYS } from '@/utils/StorageKeys';
import EventDate from '@/components/Custom/eventDate';
import EventCreator from '@/components/Custom/eventCreator';
import DescriptionCard from '@/components/Custom/description';

export const currentIdAtom = atom<string | null>(null);
export const showTicketModalAtom = atom(false);
function Event({ id, affiliateID }: { id: string, affiliateID?: string }) {
    const router = useRouter();
    const setCurrentId = useSetAtom(currentIdAtom);

    setCurrentId(id);
    const [event, setEvent] = React.useState<IEventType | any>(null);
    const [ticketType, setTicketType] = React.useState<string | null>(null);
    const [tickets, setTickets] = React.useState<IProductTypeData[]>([]);
    const [showModal, setShowModal] = useAtom(showTicketModalAtom);
    const setActiveTicket = useSetAtom(activeTicketAtom);
    const setActiveEvent = useSetAtom(activeEventAtom);
    const [currentStep, setCurrentStep] = useAtom(ticketurchaseStepAtom);

    // state 
    const setAffilateID = useSetAtom(affiliateIDAtom);

    if (affiliateID) {
        setAffilateID(affiliateID);
    }


    const { isLoading, data, isError, error } = useQuery<AxiosResponse<PaginatedResponse<IEventType>>>({
        queryKey: ['get-external-events', id],
        queryFn: () => httpService.get(`${URLS.event}/events`, {
            params: {
                id
            }
        })
    });

    React.useEffect(() => {
        // INITIALIZE VALUES IF THEY EXIST
        const step = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
        if (step) {
            setCurrentStep(() => {
                return step ? Number(step) : 1;
            });

            if (Number(step) > 1) {
                setShowModal(true);
            }
        }
    }, [])

    React.useEffect(() => {
        if (!isLoading && !isError && data?.data) {
            const item: PaginatedResponse<IEventType> = data?.data;
            setEvent(item?.content[0]);
            setTicketType(item?.content[0]?.productTypeData[0]?.ticketType);
            setTickets(item.content[0]?.productTypeData);

            // set atoms
            setActiveTicket(item?.content[0]?.productTypeData[0]);
            setActiveEvent(item?.content[0]);
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
        <Box w="full" h="full" p={['0px', '0px', 6, 6]}>
            <TicketPurchaseModal isOpen={showModal} onClose={() => setShowModal(false)} type='EVENT' />
            <Head>
                <title>Chasescroll | {event?.eventName || 'Event'}</title>
            </Head>
            <Container maxW={['100%', '100%', '70%', '70%']} p={['10px', '10px', '0px', '0px']} >
                <HStack alignItems={'center'} mb='20px'>
                    <ArrowLeft2 onClick={() => router.back()} cursor={'pointer'} variant='Outline' size='30px' />
                    <Heading>Event</Heading>
                    {!isLoading && !isError && (
                        <Heading color='primaryColor'> / {event?.eventName}</Heading>
                    )}
                </HStack>

                {!isLoading && !isError && data?.data && (
                    <Flex w='full' h="full" spaceX={[0, 0, 6, 6]} mt="10px" direction={['column', 'column', 'row', 'row']}>
                        <Box flex={1} h="full" mb={['20px', '20px', '0px', '0px']}>
                            <Box width={'full'} h="500px" mb="10xp" borderWidth={'1px'} borderColor="gray.200" borderRadius={'16px'} overflow={'hidden'}>
                                <Image w="full" h="full" objectFit="contain" src={(RESOURCE_URL as string) + (event?.currentPicUrl as string)} />
                            </Box>

                            <HStack display={['none', 'none', 'flex', 'flex']} w="auto" h={['50px', '50px', '40px', '45px']} borderRadius={"full"} spaceX={3} justifyContent={'flex-start'} alignItems={'center'} px={2} bgColor={'gray.100'} mt="20px">
                                <Location size={25} variant='Outline' color="blue" />
                                <Text  fontSize={"14px"} >{event?.location?.toBeAnnounced ? 'To be announced' : event?.location.locationDetails}</Text>
                            </HStack>

                            {!event?.location?.toBeAnnounced && (
                                <Box w="full" display={['none', 'none', 'block', 'block']}>
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
                            )}
                        </Box>

                        <Flex flex={1} flexDir={"column"} h="full" gap={"3"} borderWidth={['0px', '0px', '1px', '1px']} borderColor="gray.200" p={['10px', '10px', '20px', '20px']} borderRadius={'16px'} w="full">
                            <Heading fontSize={["14px", "14px", '24px']}>{event?.eventName}</Heading>
                            <Flex w={"full"} display={["flex", "flex", "none"]} gap={"2"} >
                                <Flex w={"full"} >
                                    <EventCreator {...event} />
                                </Flex>
                                <Flex flexDir={"column"} w={['100%', '100%', '50%', '50%']} alignItems={"center"} gap={"3"} borderRadius={'16px'} borderWidth={'1px'} borderColor={'gray.200'} p='3'>
                                    <Text fontWeight={'700'} fontSize={["sm"]} >See available tickets</Text>
                                    <Button onClick={handlePayment} w="full" h="45px" borderRadius={'full'} bgColor="chasescrollBlue" fontWeight={"semibold"} fontSize={"14px"} color="white">Select Ticket Here</Button>
                                </Flex>
                            </Flex>

                            <DescriptionCard limit={200} label='Event Details' description={event?.eventDescription} />
                            <Flex display={["none", "none", "flex"]} >
                                <EventCreator {...event} />
                            </Flex>
                            <EventDate {...event} />
                            <HStack display={['flex', 'flex', 'none', 'none']} w="auto" h={['50px', '50px', '40px', '45px']} borderRadius={"full"} spaceX={3} justifyContent={'flex-start'} alignItems={'center'} px={2} bgColor={'gray.100'} mt="20px">
                                <Location size={25} variant='Outline' color="blue" />
                                <Text fontSize={"14px"} >{event?.location?.toBeAnnounced ? 'To be announced' : event?.location.locationDetails}</Text>
                            </HStack>
                            {!event?.location?.toBeAnnounced && (
                                <Box w="full" display={['block', 'block', 'none', 'none']}>
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
                            )}

                            <Flex flexDir={"column"} w={['100%', '100%', '50%', '50%']} display={["none", "none", "flex"]} alignItems={"center"} gap={"3"} borderRadius={'16px'} borderWidth={'1px'} borderColor={'gray.200'} p='3'>
                                <Text fontWeight={'700'} fontSize={["sm"]} >See available tickets</Text>
                                <Button onClick={handlePayment} w="full" h="45px" borderRadius={'full'} bgColor="chasescrollBlue" color="white">Select Ticket Here</Button>
                            </Flex>
                        </Flex>
                    </Flex>
                )}

                {isLoading && (
                    <Flex w='full' h="full" spaceX={[0, 0, 6, 6]} mt="10px" flexDirection={['column', 'column', 'row', 'row']}>
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

