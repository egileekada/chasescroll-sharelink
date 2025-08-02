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
    Spinner,
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

// Print styles for PDF generation
const printStyles = `
@media print {
    * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    
    body {
        margin: 0;
        padding: 20px;
        background: white !important;
    }
    
    .ticket-container {
        page-break-inside: avoid;
        margin-bottom: 20px;
        border: 1px solid #ccc !important;
        border-radius: 15px !important;
        background: #f7f7f7 !important;
        padding: 10px !important;
        display: flex !important;
        align-items: center !important;
        min-height: 200px !important;
    }
    
    .ticket-left {
        flex: 0.7;
        border-right: 1px dashed #999 !important;
        height: 100%;
        padding: 10px !important;
        display: flex !important;
    }
    
    .ticket-right {
        flex: 0.3;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 10px !important;
    }
    
    .event-image-container {
        width: 150px;
        height: 100%;
        border: 1px solid #ccc !important;
        border-radius: 10px !important;
        padding: 0;
        display: flex !important;
        justify-content: center !important;
        margin-right: 15px;
    }
    
    .event-image {
        width: 70%;
        height: 100%;
        background: #e2e2e2 !important;
        border-radius: 10px !important;
        object-fit: cover !important;
    }
    
    .event-details {
        flex: 1;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        gap: 10px;
    }
    
    .event-title {
        font-family: 'Raleway-Medium', sans-serif !important;
        font-size: 20px !important;
        font-weight: 600 !important;
        margin-bottom: 10px !important;
        color: #000 !important;
    }
    
    .date-time-container {
        display: flex !important;
        gap: 10px !important;
        margin-bottom: 10px !important;
    }
    
    .date-time-badge {
        border: 1px solid #ccc !important;
        border-radius: 20px !important;
        padding: 5px 10px !important;
        font-size: 10px !important;
        background: white !important;
        color: #000 !important;
    }
    
    .ticket-info-container {
        display: flex !important;
        gap: 15px !important;
        margin-bottom: 10px !important;
    }
    
    .ticket-info-item {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
    }
    
    .ticket-info-label {
        font-weight: 700 !important;
        font-size: 12px !important;
        color: #000 !important;
        margin-bottom: 2px !important;
    }
    
    .ticket-info-value {
        font-size: 10px !important;
        color: #333 !important;
    }
    
    .user-info {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
    }
    
    .user-avatar {
        width: 30px !important;
        height: 30px !important;
        border-radius: 50% !important;
        background: #ddd !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 12px !important;
        color: #000 !important;
    }
    
    .qr-code-container {
        margin-bottom: 10px !important;
    }
    
    .powered-by {
        font-size: 12px !important;
        color: #666 !important;
        text-align: center !important;
    }
    
    .powered-by-brand {
        color: #007bff !important;
        font-style: italic !important;
    }
    
    /* Hide non-essential elements during print */
     .no-print {
         display: none !important;
     }
     
     /* Show print-only elements */
     .print-only {
         display: block !important;
         text-align: center !important;
         margin-bottom: 30px !important;
         padding: 20px !important;
         border-bottom: 2px solid #ccc !important;
     }
     
     .print-title {
         font-size: 28px !important;
         font-weight: bold !important;
         color: #000 !important;
         margin-bottom: 10px !important;
     }
     
     .print-subtitle {
         font-size: 16px !important;
         color: #666 !important;
     }
     
     /* Ensure QR codes are visible */
     canvas, svg {
         -webkit-print-color-adjust: exact !important;
         color-adjust: exact !important;
         print-color-adjust: exact !important;
     }
 }
 
 @media screen {
     .print-only {
         display: none !important;
     }
 }
`;

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
    });
    const [userId, setUserId] = React.useState(() => {
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (userId) {
            return userId;
        } else {
            return null;
        }
    })

    // Inject print styles
    React.useEffect(() => {
        const styleElement = document.createElement('style')
        styleElement.textContent = printStyles
        document.head.appendChild(styleElement)

        return () => {
            document.head.removeChild(styleElement)
        }
    }, [])

    const { isError, isFetching, data } = useQuery({
        queryKey: [`get-tickets-${userDetails?.userId}`, userDetails?.userId],
        queryFn: () => httpService.get(`${URLS.event}/get-users-tickets`, {
            params: {
                userID: userId ? userId : userDetails?.userId,
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
            {/* Print-only header */}
            <Box className="print-only">
                <Text className="print-title">Event Tickets</Text>
                <Text className="print-subtitle">Chasescroll - Your Digital Event Experience</Text>
            </Box>

            <Box p={[2, 2, 8, 8]}>
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

                    {!isFetching && !isError && tickets.length > 0 && (
                        <Box
                            className="no-print"
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
                    )}
                </HStack>

                {/* Event Details Section */}
                <Flex mb={8} w="full" justifyContent={'center'} flexDir={'column'} alignItems={'center'}>


                    {/* Event Info Grid */}
                    {isFetching && (
                        <VStack w="full" h="50px" justifyContent={'center'} alignItems={'center'}>
                            <Spinner size='md' colorPalette={'primaryColor'} />
                            <Text fontSize={'20px'}>Loading Tickets</Text>
                        </VStack>
                    )}
                    {!isFetching && !isError && tickets.map((item, index) => (
                        <Flex key={index.toString()} className="ticket-container" w={['100%', '100%', '70%', '70%']} h="200px" borderRadius={'15px'} bgColor="gray.100" p="10px" mb="20px" alignItems={'center'}>
                            <Flex className="ticket-left" flex={0.7} borderRightWidth={'1px'} borderRightColor={'grey'} borderRightStyle={'dashed'} h="full" p="10px">
                                <Box className="event-image-container" w="150px" h="full" borderWidth={'1px'} borderRadius="10px" borderColor="gray.300" p="0px" display={'flex'} justifyContent={'center'}>
                                    <Box className="event-image" w="70%" h="full" bg="gray.200" borderRadius={'10px'} overflow={'hidden'}>
                                        <Image src={RESOURCE_URL + event?.currentPicUrl} w="full" h="full" objectFit={'contain'} />
                                    </Box>
                                </Box>
                                <VStack className="event-details" flex="1" justifyContent={'center'}>
                                    <Text className="event-title" fontFamily="Raleway-Medium" fontSize={'20px'} fontWeight="600"> {event?.eventName}</Text>
                                    <HStack className="date-time-container">
                                        <HStack className="date-time-badge" borderWidth={'1px'} borderColor="gray.300" borderRadius={'full'} justifyContent={'center'} alignItems="center" p="5px">
                                            <Text fontSize="10px">{new Date(event?.startDate).toDateString()}</Text>
                                        </HStack>

                                        <HStack className="date-time-badge" borderWidth={'1px'} borderColor="gray.300" borderRadius={'full'} justifyContent={'center'} alignItems="center" p="5px">
                                            <Text fontSize="10px">{new Date(event?.startTime).toLocaleTimeString()}</Text>
                                        </HStack>
                                    </HStack>

                                    <HStack className="ticket-info-container">
                                        <VStack className="ticket-info-item" justifyContent={'center'} alignItems="center" spaceY={-2}>
                                            <Text className="ticket-info-label" fontWeight={'700'} fontSize={'12px'}>Ticket Type</Text>
                                            <Text className="ticket-info-value" fontSize="10px">{item?.ticketType}</Text>
                                        </VStack>

                                        <VStack className="ticket-info-item" justifyContent={'center'} alignItems="center" spaceY={-2}>
                                            <Text className="ticket-info-label" fontWeight={'700'} fontSize={'12px'}>Price</Text>
                                            <Text className="ticket-info-value" fontSize="10px">{item?.ticketPrice}</Text>
                                        </VStack>

                                        {/* <VStack justifyContent={'center'} alignItems="center" spaceY={-2}>
                                            <Text fontWeight={'700'} fontSize={'12px'}>Quantity</Text>
                                            <Text fontSize="10px">{quantity}</Text>
                                        </VStack> */}
                                    </HStack>

                                    <HStack className="user-info">
                                        <Avatar.Root className="user-avatar">
                                            <Avatar.Fallback name={userDetails?.firstName} />
                                            <Avatar.Image src={RESOURCE_URL + userDetails?.data?.imgMain?.value} />
                                        </Avatar.Root>

                                        <Text>{userDetails?.firstName} {userDetails?.lastName}</Text>
                                    </HStack>
                                </VStack>
                            </Flex>
                            <VStack className="ticket-right" flex={0.3} alignItems={'center'}>
                                <Box className="qr-code-container">
                                    <QrCode.Root value="https://www.google.com">
                                        <QrCode.Frame>
                                            <QrCode.Pattern />
                                        </QrCode.Frame>
                                    </QrCode.Root>
                                </Box>
                                <Text className="powered-by" fontSize={'12px'}>Powered by <Text className="powered-by-brand" color="primaryColor" fontStyle={'italic'}>Chasescroll</Text></Text>
                            </VStack>
                        </Flex>
                    ))}
                </Flex>

            </Box>
        </Box >
    )
}

export default TicketPurchaseSuccessModal