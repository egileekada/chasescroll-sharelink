'use client';
import httpService from '@/services/httpService';
import { URLS } from '@/services/urls';
import { Box, Button, Container, Flex, Heading, HStack, Skeleton, VStack, Menu, Portal, Avatar, ProgressCircle, AbsoluteCenter } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Image, Text } from "@chakra-ui/react"
import React, { useState } from 'react'
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
import { IPinnedFundrasier } from '@/models/PinnedFundraiser';
import { IPinnedProduct } from '@/models/PinnedProduct';
import { formatNumber } from '@/utils/formatNumber';
import CustomText from '@/components/Custom/CustomText';
import useCustomTheme from '@/hooks/useTheme';
import EventLocation from '@/components/Custom/eventLocation';
import ProductImageScroller from '@/components/Custom/productImageScroller';
import BreadCrumbs from '@/components/Custom/breadcrumbs';

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
    const [pinnedFundraiser, setPinnedFundraiser] = React.useState<IPinnedFundrasier[]>([]);
    const [pinnedProducts, setPinnedProducts] = React.useState<IPinnedProduct[]>([]);

    // state 
    const setAffilateID = useSetAtom(affiliateIDAtom);

    if (affiliateID) {
        setAffilateID(affiliateID);
    }

    const { mainBackgroundColor, secondaryBackgroundColor, primaryColor, borderColor, bodyTextColor, headerTextColor } = useCustomTheme()


    const { isLoading, data, isError, error } = useQuery<AxiosResponse<PaginatedResponse<IEventType>>>({
        queryKey: ['get-external-events', id],
        queryFn: () => httpService.get(`${URLS.event}/events`, {
            params: {
                id
            }
        })
    });

    const { isLoading: fundRaiserLoading, data: fundRaiserData, isError: fundRaiserError } = useQuery({
        queryKey: [`Get-pinned-fundraisers-${id}`],
        queryFn: () => httpService.get(`${URLS.pinned_fundraiser}/get-pinned-event-fundraising/${id}`, {

        })
    });

    const { isLoading: productLoading, data: productData, isError: productError } = useQuery({
        queryKey: [`Get-pinned-product-${id}`],
        queryFn: () => httpService.get(`${URLS.pinned_event}`, {
            params: {
                typeId: id
            }
        })
    });

    React.useEffect(() => {
        if (!productLoading && !productError && productData?.data) {
            setPinnedProducts(productData?.data);

        }
    }, [productLoading, productData, productError])

    React.useEffect(() => {
        if (!fundRaiserLoading && !fundRaiserError && fundRaiserData?.data) {
            setPinnedFundraiser(fundRaiserData?.data);
        }
    }, [fundRaiserLoading, fundRaiserData, fundRaiserError])

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

    const isAdmin = event?.isOrganizer || event?.eventMemberRole === "ADMIN" || event?.eventMemberRole === "COLLABORATOR"



    return (
        // <Box w="full" h="full" p={['0px', '0px', 6, 6]}>
        //     <TicketPurchaseModal isOpen={showModal} onClose={() => setShowModal(false)} type='EVENT' />
        //     <Head>
        //         <title>Chasescroll | {event?.eventName || 'Event'}</title>
        //     </Head>
        //     <Container maxW={['100%', '100%', '70%', '70%']} p={['10px', '10px', '0px', '0px']} >
        //         <HStack alignItems={'center'} mb='20px'>
        //             <ArrowLeft2 onClick={() => router.back()} cursor={'pointer'} variant='Outline' size='30px' />
        //             <Heading>Event</Heading>
        //             {!isLoading && !isError && (
        //                 <Heading color='primaryColor'> / {event?.eventName}</Heading>
        //             )}
        //         </HStack>

        //         {!isLoading && !isError && data?.data && (
        //             <Flex w='full' h="full" spaceX={[0, 0, 6, 6]} mt="10px" direction={['column', 'column', 'row', 'row']}>
        //                 <Box flex={1} h="full" mb={['20px', '20px', '0px', '0px']}>
        //                     <Box width={'full'} h="500px" mb="10xp" borderWidth={'1px'} borderColor="gray.200" borderRadius={'16px'} overflow={'hidden'}>
        //                         <Image w="full" h="full" objectFit="contain" src={(RESOURCE_URL as string) + (event?.currentPicUrl as string)} />
        //                     </Box>

        //                     <HStack display={['none', 'none', 'flex', 'flex']} w="auto" h={['50px', '50px', '40px', '45px']} borderRadius={"full"} spaceX={3} justifyContent={'flex-start'} alignItems={'center'} px={2} bgColor={'gray.100'} mt="20px">
        //                         <Location size={25} variant='Outline' color="blue" />
        //                         <Text fontSize={"14px"} >{event?.location?.toBeAnnounced ? 'To be announced' : event?.location.locationDetails}</Text>
        //                     </HStack>

        //                     {!fundRaiserLoading && !fundRaiserError && pinnedFundraiser?.length > 0 && (
        //                         <>
        //                             <Text mt="20px" mb="10px" fontWeight={600}>Fundraising available</Text>
        //                             <Flex w="full" h="150px" borderRadius={'16px'} borderWidth="1px" borderColor="gray.200" p="10px" >
        //                                 <Box w="30%" h="full" bg="gray.100" borderRadius="16px" overflow="hidden">
        //                                     <Image w="full" h="full" objectFit="cover" src={(RESOURCE_URL as string) + (pinnedFundraiser[0]?.fundRaiser?.bannerImage as string)} />
        //                                 </Box>
        //                                 <Box flex={1} h="full" p="10px">
        //                                     <Box w="full" h="50%" divideX={'2px'} borderBottomWidth={'1px'} borderBottomColor='gray.200'>
        //                                         <Text fontWeight={600}>{pinnedFundraiser[0]?.fundRaiser?.name}</Text>
        //                                     </Box>
        //                                     <HStack w="full" h="auto" justifyContent={'space-between'} mt='10px'>
        //                                         <VStack>
        //                                             <CustomText type='MEDIUM' fontSize={'16px'} text="Target" textAlign={'center'} width={'auto'} color="black" />
        //                                             <CustomText type='REGULAR' fontSize={'14px'} color='black' text={String(formatNumber(pinnedFundraiser[0]?.fundRaiser?.goal || 0))} textAlign={'center'} width={'auto'} />
        //                                         </VStack>

        //                                         <VStack alignItems={'center'}>
        //                                             <CustomText type='MEDIUM' fontSize={'16px'} text="Raised" textAlign={'center'} width={'auto'} color="black" />
        //                                             <CustomText type='REGULAR' fontSize={'14px'} color='black' text={String(formatNumber(pinnedFundraiser[0]?.fundRaiser?.total) || 0)} textAlign={'center'} width={'auto'} />
        //                                         </VStack>

        //                                         <ProgressCircle.Root value={(pinnedFundraiser[0]?.fundRaiser?.total as number / ((pinnedFundraiser[0]?.fundRaiser?.goal as number || 0) || 1)) * 100} size={'lg'}>
        //                                             <ProgressCircle.Circle css={{ "--thickness": "4px" }}>
        //                                                 <ProgressCircle.Track />
        //                                                 <ProgressCircle.Range stroke={'primaryColor'} />
        //                                             </ProgressCircle.Circle>
        //                                             <AbsoluteCenter>
        //                                                 <ProgressCircle.ValueText />
        //                                             </AbsoluteCenter>
        //                                         </ProgressCircle.Root>
        //                                     </HStack>

        //                                 </Box>
        //                                 <Box w="55px" h="full" position="relative" >
        //                                     <Button
        //                                         w="130px"
        //                                         h="55px"
        //                                         borderRadius={'full'}
        //                                         color="white"
        //                                         bg="primaryColor"
        //                                         transform="rotate(-90deg)"
        //                                         position="absolute"
        //                                         top="30%"
        //                                         left="-105%"
        //                                         ml="20px"
        //                                         onClick={() => router.push('/share/fundraiser?id=' + pinnedFundraiser[0]?.fundRaiser?.id)}

        //                                     >
        //                                         Donate now
        //                                     </Button>
        //                                 </Box>

        //                             </Flex>
        //                         </>
        //                     )}

        //                     {!event?.location?.toBeAnnounced && (
        //                         <Box w="full" display={['none', 'none', 'block', 'block']}>
        //                             <Heading fontSize={'16px'} mt="20px">Location and surrounding</Heading>

        // //                             <Button
        //                                 variant={'solid'}
        //                                 width="auto"
        //                                 height="45px"
        //                                 mt='20px'
        //                                 borderRadius={'full'}
        //                                 color="white"
        //                                 bgColor="primaryColor"
        //                                 onClick={() => {
        //                                     if (event?.location?.latlng) {
        //                                         const [lat, lng] = event.location.latlng.split(' ');
        //                                         window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        //                                     }
        //                                 }}
        //                                 disabled={!event?.location?.latlng}
        //                             >
        //                                 Direction
        //                             </Button>
        //                             <Box height={'20px'} />
        //                             {event?.location?.latlng ? (
        //                                 <MapComponent
        //                                     lat={parseFloat(event.location.latlng.split(' ')[0])}
        //                                     lng={parseFloat(event.location.latlng.split(' ')[1])}
        //                                     width="100%"
        //                                     height="200px"
        //                                     zoom={15}
        //                                     borderRadius="16px"
        //                                     markerTitle={event?.eventName || 'Event Location'}
        //                                 />
        //                             ) : (
        //                                 <Box w='full' h="200px" mt='20px' borderRadius={'16px'} bgColor="gray.100"></Box>
        //                             )}
        //                         </Box>
        //                     )}
        //                 </Box>

        //                 <Flex flex={1} flexDir={"column"} h="full" gap={"3"} borderWidth={['0px', '0px', '1px', '1px']} borderColor="gray.200" p={['10px', '10px', '20px', '20px']} borderRadius={'16px'} w="full">
        //                     <Heading fontSize={["14px", "14px", '24px']}>{event?.eventName}</Heading>
        //                     <Flex w={"full"} display={["flex", "flex", "none"]} gap={"2"} >
        //                         <Flex w={"full"} >
        //                             <EventCreator {...event} />
        //                         </Flex>
        //                         <Flex flexDir={"column"} w={['100%', '100%', '50%', '50%']} alignItems={"center"} gap={"3"} borderRadius={'16px'} borderWidth={'1px'} borderColor={'gray.200'} p='3'>
        //                             <Text fontWeight={'700'} fontSize={["sm"]} >See available tickets</Text>
        //                             <Button onClick={handlePayment} w="full" h="40px" fontWeight={"semibold"} borderRadius={'full'} bgColor="chasescrollBlue" fontWeight={"semibold"} fontSize={"14px"} color="white">Select Ticket Here</Button>
        //                         </Flex>
        //                     </Flex>

        //                     <DescriptionCard limit={200} label='Event Details' description={event?.eventDescription} />
        //                     <Flex display={["none", "none", "flex"]} >
        //                         <EventCreator {...event} />
        //                     </Flex>
        //                     <EventDate {...event} />
        //                     <HStack display={['flex', 'flex', 'none', 'none']} w="auto" h={['50px', '50px', '40px', '45px']} borderRadius={"full"} spaceX={3} justifyContent={'flex-start'} alignItems={'center'} px={2} bgColor={'gray.100'} mt="20px">
        //                         <Location size={25} variant='Outline' color="blue" />
        //                         <Text fontSize={"14px"} >{event?.location?.toBeAnnounced ? 'To be announced' : event?.location.locationDetails}</Text>
        //                     </HStack>
        //                     {!event?.location?.toBeAnnounced && (
        //                         <Box w="full" display={['block', 'block', 'none', 'none']}>
        //                             <Heading fontSize={'16px'} mt="20px">Location and surrounding</Heading>

        //                             <Button
        //                                 variant={'solid'}
        //                                 width="auto"
        //                                 height="45px"
        //                                 mt='20px'
        //                                 borderRadius={'full'}
        //                                 color="white"
        //                                 bgColor="primaryColor"
        //                                 onClick={() => {
        //                                     if (event?.location?.latlng) {
        //                                         const [lat, lng] = event.location.latlng.split(' ');
        //                                         window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        //                                     }
        //                                 }}
        //                                 disabled={!event?.location?.latlng}
        //                             >
        //                                 Direction
        //                             </Button>
        //                             <Box height={'20px'} />
        //                             {event?.location?.latlng ? (
        //                                 <MapComponent
        //                                     lat={parseFloat(event.location.latlng.split(' ')[0])}
        //                                     lng={parseFloat(event.location.latlng.split(' ')[1])}
        //                                     width="100%"
        //                                     height="200px"
        //                                     zoom={15}
        //                                     borderRadius="16px"
        //                                     markerTitle={event?.eventName || 'Event Location'}
        //                                 />
        //                             ) : (
        //                                 <Box w='full' h="200px" mt='20px' borderRadius={'16px'} bgColor="gray.100"></Box>
        //                             )}
        //                         </Box>
        //                     )}

        //                     <Flex flexDir={"column"} w={['100%', '100%', '50%', '50%']} display={["none", "none", "flex"]} alignItems={"center"} gap={"3"} borderRadius={'16px'} borderWidth={'1px'} borderColor={'gray.200'} p='3'>
        //                         <Text fontWeight={'700'} fontSize={["sm"]} >See available tickets</Text>
        //                         <Button onClick={handlePayment} w="full" h="40px" fontWeight={"semibold"} borderRadius={'full'} bgColor="chasescrollBlue" color="white">Select Ticket Here</Button>
        //                     </Flex>
        //                 </Flex>
        //             </Flex>
        //         )}

        //         {isLoading && (
        //             <Flex w='full' h="full" spaceX={[0, 0, 6, 6]} mt="10px" flexDirection={['column', 'column', 'row', 'row']}>
        //                 <Box flex={1} h="full">
        //                     <Skeleton w="full" h="500px" borderRadius={'16px'} mb='10px' />
        //                     <Skeleton w="full" h="150px" mb="5px" borderRadius={'16px'} />
        //                 </Box>
        //                 <Box flex={1} h="full">
        //                     <Skeleton w="full" h="50px" mb="5px" borderRadius={'8px'} />
        //                     <Skeleton w="full" h="50px" mb="5px" borderRadius={'8px'} />
        //                 </Box>
        //             </Flex>
        //         )}
        //     </Container>
        // </Box>
        <>
            {!isLoading &&
                <Flex w={"full"} bgColor={mainBackgroundColor} flexDir={"column"} gap={"4"} px={["4", "4", "6"]} pb={["400px", "400px", "6"]} py={"6"} >
                    <TicketPurchaseModal isOpen={showModal} onClose={() => setShowModal(false)} type='EVENT' />
                    <BreadCrumbs {...event} />
                    <Flex w={"full"} gap={"4"} flexDir={["column", "column", "row"]} >
                        <Flex flexDir={"column"} w={"full"} gap={"4"} >
                            <Flex w={"full"} pos={"relative"} >
                                <ProductImageScroller rounded={"8px"} height={["340px", "340px", "520px"]} images={event?.picUrls?.length > 0 ? event?.picUrls : [event?.currentPicUrl]} />
                            </Flex>
                            <Flex w={"full"} alignItems={"center"} my={"auto"} display={["none", "none", "flex"]} >
                                <EventLocation showLink={true} data={event} />
                            </Flex>
                        </Flex>

                        <Flex w={"full"} flexDir={"column"} gap={"3"} >
                            <Text fontWeight={"700"} fontSize={["16px", "16px", "24px"]} >{capitalizeFLetter(event?.eventName)}</Text>
                            <Flex w={"full"} flexDir={["column-reverse", "column-reverse", "column"]} gap={"2"} >
                                <DescriptionCard limit={200} label='Event Details' description={event?.eventDescription} />
                                <Flex flexDir={isAdmin ? "column" : "row"} gap={"2"} w={"full"} >
                                    <Flex w={[isAdmin ? "full" : "fit-content", isAdmin ? "full" : "full", "full"]} alignItems={["start", "start", "center"]} flexDir={["column", "column", "row"]} justifyContent={["start", "start", "space-between"]} gap={"3"} >
                                        <Flex gap={"3"} w={[isAdmin ? "full" : "fit-content", isAdmin ? "full" : "full", "full"]} alignItems={[isAdmin ? "center" : "start", isAdmin ? "center" : "start", "center"]} flexDir={[isAdmin ? "row" : "column", isAdmin ? "row" : "column", "row"]} justifyContent={[isAdmin ? "space-between" : "start", isAdmin ? "space-between" : "start", "space-between"]}  >
                                            <EventCreator {...event} />
                                            <Flex display={["flex", "flex", "none"]} w={"full"} flexDir={"column"} gap={"2"} mr={isAdmin ? "auto" : "0px"} >
                                                {/* {attendeesVisibility && (
                                        <InterestedUsers event={props} />
                                    )} */}

                                                {/* {(!isOrganizer && eventMemberRole !== "ADMIN" && eventMemberRole !== "COLLABORATOR") && (
                                        <PrBtn data={props} />
                                    )} */}
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                    <Flex display={["flex", "flex", "none"]} maxW={["full", "full", "full", "430px", "430px"]} flexDir={"column"} gap={"2"} w={"full"} >


                                        {((event?.eventMemberRole !== "COLLABORATOR") && !event?.isOrganizer && event?.eventMemberRole !== "ADMIN") && (
                                            <Flex bg={mainBackgroundColor} bottom={"0px"} w={"full"} flexDir={"column"} rounded={"16px"} gap={"3"} p={"3"} borderWidth={"1px"} borderColor={"#DEDEDE"} style={{ boxShadow: "0px 20px 70px 0px #C2C2C21A" }} >
                                                <Flex w={"full"} gap={"2"} flexDir={"column"} >
                                                    <Text fontWeight={"500"} fontSize={["xs", "xs", "sm"]} >See ticket available for this event</Text>
                                                    <Flex w={"full"} justifyContent={"end"} >
                                                        <Button onClick={handlePayment} w="full" h="40px" fontWeight={"semibold"} borderRadius={'full'} bgColor="chasescrollBlue" color="white">Select Ticket Here</Button>
                                                    </Flex>
                                                </Flex>
                                            </Flex>
                                        )}
                                        {/* {isAdmin && (
                                            <OrganizeBtn {...props} />
                                        )}
                                        {isOrganizer && (
                                            <VolunteerBtn {...props} />
                                        )} */}
                                    </Flex>
                                </Flex>
                            </Flex>
                            <Flex w={"full"} display={["flex", "flex", "none"]} >
                                <EventLocation showLink={true} data={event} limit={50} />
                            </Flex>
                            <EventDate {...event} />
                            <Flex w={"full"} justifyContent={"space-between"} gap={"4"} >
                                <Flex display={["none", "none", "flex"]} w={"full"} flexDir={"column"} gap={"6"} >
                                    <Flex maxW={["full", "full", "full", "317px", "317px"]} flexDir={"column"} gap={"6"} w={"full"} >
                                        {((event?.eventMemberRole !== "COLLABORATOR") && !event?.isOrganizer && event?.eventMemberRole !== "ADMIN") && (
                                            <Flex bg={mainBackgroundColor} zIndex={"50"} pos={["relative"]} bottom={"0px"} w={"full"} flexDir={"column"} rounded={"16px"} gap={"3"} p={"5"} borderWidth={"1px"} borderColor={"#DEDEDE"} style={{ boxShadow: "0px 20px 70px 0px #C2C2C21A" }} >
                                                <Flex w={"full"} gap={"2"} flexDir={"column"} >
                                                    <Text fontWeight={"500"} fontSize={["xs", "xs", "sm"]} >See ticket available for this event</Text>
                                                    <Flex w={"full"} justifyContent={"end"} >
                                                        <Button onClick={handlePayment} w="full" h="40px" fontWeight={"semibold"} borderRadius={'full'} bgColor="chasescrollBlue" color="white">Select Ticket Here</Button>
                                                    </Flex>
                                                </Flex>
                                            </Flex>
                                        )}
                                        {/* {isAdmin && (
                                            <OrganizeBtn {...props} />
                                        )} */}
                                    </Flex>
                                    {/* {isOrganizer && (
                            <VolunteerBtn {...props} />
                        )}
                        {(!isOrganizer && eventMemberRole !== "ADMIN" && eventMemberRole !== "COLLABORATOR") && (
                            <Flex w={"fit-content"} >
                                <PrBtn data={props} />
                            </Flex>
                        )} */}
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>

                    <Flex w={"full"} gap={"4"} flexDir={["column", "column", "row"]} >
                        <Flex w={"full"} flexDir={"column"} gap={"3"} >
                            {/* <EventLocation showLink={true} data={props} /> */}
                            <Flex w={"full"} maxW={"500px"} gap={"2"} flexDir={["column", "column", "column", "column", "column"]} >
                                {/* <Flex w={"full"} display={["flex", "flex", "none"]} >
                                    <EventMesh data={props} />
                                </Flex>
                                <EventDonation item={props} />
                                {isOrganizer && (
                                    <Flex w={"fit-content"} mt={"auto"} height={["auto", "auto", "fit-content"]} >
                                        <ViewRequest {...props} />
                                    </Flex>
                                )} */}
                            </Flex>
                            <Flex w={"full"} flexDir={"column"} gap={"2"} >
                                {/* <EventLocation {...props} /> */}
                                {event?.location?.latlng && (
                                    <Flex flexDir={"column"} gap={"2"} >
                                        <Text fontSize={"14px"} fontWeight={"bold"} >Location and surroundings</Text>
                                        <Flex w={"full"} flexDir={"column"} gap={"1"} > 
                                        <Button
                                            variant={'solid'}
                                            width="fit"
                                            height="40px"
                                            mt='20px'
                                            borderRadius={'full'}
                                            color="white"
                                            fontWeight={"semibold"}
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
                                        <MapComponent
                                            lat={parseFloat(event.location.latlng.split(' ')[0])}
                                            lng={parseFloat(event.location.latlng.split(' ')[1])}
                                            width="100%"
                                            height="200px"
                                            zoom={15}
                                            borderRadius="16px"
                                            markerTitle={event?.eventName || 'Event Location'}
                                        />
                                        </Flex>
                                    </Flex>
                                )}
                            </Flex>
                        </Flex>
                        <Flex w={"full"} display={["none", "none", "flex"]} flexDir={"column"} >
                            {/* <EventMesh data={props} /> */}

                            {!productLoading && !productError && pinnedProducts?.length > 0 && (
                                <Box cursor={'pointer'} onClick={() => router.push('/share/product?id=' + pinnedProducts[0]?.returnProductDto?.id)}>
                                    <Text mt="20px" fontWeight={500}>Shop the {event?.eventName} kiosk</Text>
                                    <VStack w="200px" h="200px" mt="10px" alignItems={'flex-start'}>
                                        <Box w="full" h="60%" bg="gray.100">
                                            <Image src={RESOURCE_URL + pinnedProducts[0]?.returnProductDto?.images[0]} w="full" h="full" objectFit={'cover'} />
                                        </Box>
                                        <Text fontWeight={500}>{pinnedProducts[0]?.returnProductDto?.name}</Text>
                                        <Text>{formatNumber(pinnedProducts[0]?.returnProductDto?.price)}</Text>
                                    </VStack>
                                </Box>
                            )}
                            <Flex w={"full"} h={"8"} />
                        </Flex>
                    </Flex>
                </Flex>
            }
        </>
    )
}

export default Event

