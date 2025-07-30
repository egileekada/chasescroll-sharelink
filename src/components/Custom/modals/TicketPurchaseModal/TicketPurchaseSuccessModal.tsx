import {
    Box,
    Button,
    Image,
    VStack,
    HStack,
    Flex,
    Text,
    IconButton,
    Grid,
    GridItem,
    SimpleGrid,
    Avatar,
} from '@chakra-ui/react'
import React from 'react'
import { useAtomValue } from 'jotai'
import { activeEventAtom, ticketCountAtom } from '@/states/activeTicket'
import { CloseSquare, DocumentDownload, TickCircle } from 'iconsax-reactjs'
import { ITicketCreatedModel } from '@/models/TicketCreatedModel'
import { IEventTicket, IProductTypeData } from '@/models/Event'
import { STORAGE_KEYS } from '@/utils/StorageKeys'
import { useQuery } from '@tanstack/react-query'
import httpService from '@/services/httpService'
import { URLS } from '@/services/urls'
import { QrCode } from "@chakra-ui/react"
import { RESOURCE_URL } from '@/constants'
import { IUser } from '@/models/User'

interface TicketPurchaseSuccessModalProps {
    onClose?: () => void;
    orderNumber?: string;
    email?: string;
    type?: 'EVENT' | 'FUNDRAISER' | 'PRODUCT'
}


function TicketPurchaseSuccessModal({
    onClose,
    orderNumber = '#12844567363',
    email = 'otuekongdomino@gmail.com',
    type = 'EVENT'
}: TicketPurchaseSuccessModalProps) {
    const event = useAtomValue(activeEventAtom);
    const quantity = useAtomValue(ticketCountAtom);
    const [tickets, setTicket] = React.useState<IProductTypeData[]>([])
    const [userDetails, setUserDetails] = React.useState<IUser>(() => {
        const item = localStorage.getItem(STORAGE_KEYS.USER_DETAILS);
        if (item) {
            return JSON.parse(item)
        } else {
            return null;
        }
    })

    const { isError, isFetching, data } = useQuery({
        queryKey: [`get-tickets-${userDetails?.userId}`, userDetails?.userId],
        queryFn: () => httpService.get(`${URLS.event}/get-users-tickets`, {
            params: {
                userID: userDetails?.userId,
                eventID: event?.id
            }
        }),
    });

    // EFFECTS
    React.useEffect(() => {
        if (!isFetching && !isError && data?.data) {
            console.log('This is the data my people', data?.data?.content[0]?.event?.productTypeData);
            setTicket(data?.data?.content[0]?.event?.productTypeData);
        }
    }, [isFetching, isError, data])

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatEventTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };




    return (
        <Box
            w="full"
            borderRadius="2xl"
            overflow="hidden"
            position="relative"
        >

            <Box p={8}>
                {/* Success Header */}
                <HStack mb={8} spaceX={4}>
                    <Box
                        w="50px"
                        h="50px"
                        bg="green.500"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <TickCircle size="24" color="white" variant="Bold" />
                    </Box>
                    <VStack align="start" spaceY={1}>
                        <Text fontSize="2xl" fontWeight="bold" color="black">
                            Thanks for order!
                        </Text>
                        <Text fontSize="lg" color="gray.600">
                            #{orderNumber}
                        </Text>
                    </VStack>
                </HStack>

                <HStack w="full" justifyContent={'center'} alignItems={'center'} mb="30px">
                    <Text fontSize="sm" color="gray.600" mb={2} textTransform="uppercase" letterSpacing="wide" textAlign={'center'} fontWeight={800}>
                        Ticket Details
                    </Text>

                    <Box
                        as="button"
                        onClick={() => {
                            window.print();
                        }}
                        cursor="pointer"
                        display="flex"
                        alignItems="center"
                    >
                        <DocumentDownload size={'30px'} color={'blue'} variant='Outline' />
                    </Box>
                </HStack>

                {/* Event Details Section */}
                <Flex mb={8} w="full" justifyContent={'center'} flexDir={'column'} alignItems={'center'}>


                    {/* Event Info Grid */}
                    {!isFetching && !isError && tickets.map((item, index) => (
                        <Flex key={index.toString()} w={['100%', '100%', '70%', '70%']} h="200px" borderRadius={'15px'} bgColor="gray.100" p="10px" mb="20px" alignItems={'center'}>
                            <Flex flex={0.7} borderRightWidth={'1px'} borderRightColor={'grey'} borderRightStyle={'dashed'} h="full" p="10px">
                                <Box w="150px" h="full" borderWidth={'1px'} borderRadius="10px" borderColor="gray.300" p="0px" display={'flex'} justifyContent={'center'}>
                                    <Box w="70%" h="full" bg="gray.200" borderRadius={'10px'} overflow={'hidden'}>
                                        <Image src={RESOURCE_URL + event?.currentPicUrl} w="full" h="full" />
                                    </Box>
                                </Box>
                                <VStack flex="1" justifyContent={'center'}>
                                    <Text fontFamily="Raleway-Medium" fontSize={'20px'} fontWeight="600"> {event?.eventName}</Text>
                                    <HStack>
                                        <HStack borderWidth={'1px'} borderColor="gray.300" borderRadius={'full'} justifyContent={'center'} alignItems="center" p="5px">
                                            <Text fontSize="10px">{new Date(event?.startDate).toDateString()}</Text>
                                        </HStack>

                                        <HStack borderWidth={'1px'} borderColor="gray.300" borderRadius={'full'} justifyContent={'center'} alignItems="center" p="5px">
                                            <Text fontSize="10px">{new Date(event?.startTime).toLocaleTimeString()}</Text>
                                        </HStack>
                                    </HStack>

                                    <HStack>
                                        <VStack justifyContent={'center'} alignItems="center" spaceY={-2}>
                                            <Text fontWeight={'700'} fontSize={'12px'}>Ticket Type</Text>
                                            <Text fontSize="10px">{item?.ticketType}</Text>
                                        </VStack>

                                        <VStack justifyContent={'center'} alignItems="center" spaceY={-2}>
                                            <Text fontWeight={'700'} fontSize={'12px'}>Price</Text>
                                            <Text fontSize="10px">{item?.ticketPrice}</Text>
                                        </VStack>

                                        {/* <VStack justifyContent={'center'} alignItems="center" spaceY={-2}>
                                            <Text fontWeight={'700'} fontSize={'12px'}>Quantity</Text>
                                            <Text fontSize="10px">{quantity}</Text>
                                        </VStack> */}
                                    </HStack>

                                    <HStack>
                                        <Avatar.Root>
                                            <Avatar.Fallback name={userDetails?.firstName} />
                                            <Avatar.Image src={RESOURCE_URL + userDetails?.data?.imgMain?.value} />
                                        </Avatar.Root>

                                        <Text>{userDetails?.firstName} {userDetails?.lastName}</Text>
                                    </HStack>
                                </VStack>
                            </Flex>
                            <VStack flex={0.3} alignItems={'center'}>
                                <QrCode.Root value="https://www.google.com">
                                    <QrCode.Frame>
                                        <QrCode.Pattern />
                                    </QrCode.Frame>
                                </QrCode.Root>
                                <Text fontSize={'12px'}>Powered by <Text color="primaryColor" fontStyle={'italic'}>Chasescroll</Text></Text>
                            </VStack>
                        </Flex>
                    ))}
                </Flex>

            </Box>
        </Box >
    )
}

export default TicketPurchaseSuccessModal