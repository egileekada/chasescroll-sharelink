'use client';
import httpService from '@/services/httpService';
import { URLS } from '@/services/urls';
import { Box, Button, Container, Flex, Heading, HStack, Skeleton, VStack, Menu, Portal } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Image, Text } from "@chakra-ui/react"
import React from 'react'
import { AxiosResponse } from 'axios';
import { PaginatedResponse } from '@/models/PaginatedResponse';
import { IEventType } from '@/models/Event';
import { RESOURCE_URL } from '@/constants';
import { ArrowLeft, ArrowLeft2, Location, Calendar, Calendar1, ArrowDown2 } from 'iconsax-reactjs';
import ChasescrollBox from '@/components/Custom/ChasescrollBox';
import { capitalizeFLetter } from '@/utils/capitalizeLetter';
import { useRouter } from 'next/navigation'
import { DateTime } from 'luxon';
import { formatNumber } from '@/utils/formatNumber';
import Head from 'next/head';


function Event({ id }: { id: string }) {
    const router = useRouter();

    const [event, setEvent] = React.useState<IEventType | null>(null);
    const [ticketTyppe, setTicketType] = React.useState<string | null>(null)

    const { isLoading, data, isError, error } = useQuery<AxiosResponse<PaginatedResponse<IEventType>>>({
        queryKey: ['get-external-events'],
        queryFn: () => httpService.get(`${URLS.event}/events`, {
            params: {
                id
            }
        })
    });

    React.useEffect(() => {
        if (!isLoading && !isError && data?.data) {
            console.log(data?.data);
            const item: PaginatedResponse<IEventType> = data?.data;
            setEvent(item?.content[0]);
            setTicketType(item?.content[0].productTypeData[0].ticketType);
        }
    }, [data, isError, isLoading])

    // Dynamically update the page title when event data loads
    React.useEffect(() => {
        if (event?.eventName) {
            document.title = `Chasescroll | ${event.eventName}`;
        } else {
            document.title = 'Chasescroll | Event';
        }
    }, [event?.eventName]);
    return (
        <Box w="full" h="full" p={6}>
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

                            <HStack w="40%" h="40px" borderRadius={"full"} spaceX={3} justifyContent={'flex-start'} alignItems={'center'} px={2} bgColor={'gray.100'} mt="20px">
                                <Location size={25} variant='Outline' color="blue" />
                                <Text>{event?.location?.toBeAnnounced ? 'To be announced' : event?.location.locationDetails}</Text>
                            </HStack>

                            <Heading fontSize={'16px'} mt="20px">Location and surrounding</Heading>

                            <Button variant={'solid'} width="auto" height="45px" mt='20px' borderRadius={'full'} color="white" bgColor="primaryColor">Direction</Button>
                            <Box w='full' h="200px" mt='20px' borderRadius={'16px'} bgColor="gray.100"></Box>
                        </Box>

                        <Box flex={1} h="full">
                            <Heading>{event?.eventName}</Heading>
                            <VStack mt='20px' w="full" px="4" alignItems={'flex-start'} bgColor='gray.100' p={4} spaceY={0} borderRadius={'16px'}>
                                <Heading fontSize={'16px'}>Event details</Heading>
                                <Text fontSize={'14px'} mt="0px">{event?.eventDescription}</Text>
                            </VStack>

                            <HStack w="full" h="auto" borderRadius={"full"} p={2} bgColor="gray.100" mt='20px' alignItems={'center'}>
                                <ChasescrollBox width='50px' height='50px' borderRadius='25px'></ChasescrollBox>
                                <Text fontFamily={'sans-serif'} fontWeight={500} fontSize={'16px'}>{capitalizeFLetter(event?.createdBy?.firstName)} {capitalizeFLetter(event?.createdBy?.lastName)}</Text>
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
                                            <Text>{event?.productTypeData[0].ticketType} {formatNumber(event?.productTypeData[0].ticketPrice)}</Text>
                                            {(event?.productTypeData as [])?.length > 1 && (
                                                <ArrowDown2 size={20} color="blue" variant='Bold' />
                                            )}
                                        </Flex>
                                    </Menu.Trigger>
                                    <Portal>
                                        <Menu.Positioner>
                                            <Menu.Content w="full">
                                                {event?.productTypeData.map((item, index) => (
                                                    <Menu.Item value={item.ticketType} key={index}>{item.ticketType} {formatNumber(item.ticketPrice)}</Menu.Item>
                                                ))}
                                            </Menu.Content>
                                        </Menu.Positioner>
                                    </Portal>
                                </Menu.Root>

                                <Button w="full" h="60px" borderRadius={'full'} bgColor="chasescrollBlue" color="white">Buy Ticket</Button>

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
