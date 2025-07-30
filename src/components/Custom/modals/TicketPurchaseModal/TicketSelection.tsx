'use client'
import React, { useState } from 'react';
import {
    Box,
    Button,
    Flex,
    Text,
    Image,
    VStack,
    HStack,
    IconButton,
    Badge,
} from '@chakra-ui/react';
import { Add, Minus, ShoppingCart } from 'iconsax-reactjs';
import { useAtom, useSetAtom } from 'jotai';
import { activeEventAtom, activeTicketAtom, selectedTicketsAtom, ticketCountAtom, ticketurchaseStepAtom, totalAmountForSelectedTicketsAtom } from '@/states/activeTicket';
import { IProductTypeData } from '@/models/Event';
import { toaster } from '@/components/ui/toaster';
import { formatNumber } from '@/utils/formatNumber';
import CustomText from '../../CustomText';


interface TicketSelectionProps {
    eventTitle?: string;
    eventDate?: string;
    eventImage?: string;
}

const TicketSelection: React.FC<TicketSelectionProps> = ({
    eventTitle = "Tech Submit",
    eventDate = "Aug 13, 2025 11:00 PM",
    eventImage = "/images/tech-event.jpg"
}) => {

    const [event, setActiveEvent] = useAtom(activeEventAtom);
    const [selectedTickets, setSelectedTickets] = useAtom(selectedTicketsAtom);
    const setStep = useSetAtom(ticketurchaseStepAtom);
    const setTotalSelectedTicketPrice = useSetAtom(totalAmountForSelectedTicketsAtom);
    const [totalTickets, setTotalTicket] = useState(() => {
        let total = 0;
        event?.productTypeData.forEach((item) => {
            total += item.totalNumberOfTickets as number;
        });
        return total;
    })


    const increment = (ticketType: string) => {
        if (selectedTickets === null) {
            setSelectedTickets([{
                ticketType,
                quantity: 1,
            }])
        } else {
            // check if the ticket exisit 
            const ticket = selectedTickets?.filter((item) => item.ticketType === ticketType)[0];
            const eventTicket = event?.productTypeData.filter((item) => item.ticketType === ticketType)[0];
            if (ticket) {
                if (ticket.quantity + 1 > (eventTicket?.maxTicketBuy as number)) {
                    toaster.create({
                        title: 'Error',
                        description: `You can only buy ${eventTicket?.maxTicketBuy} tickets`,
                        type: 'error',
                    });
                    return;
                }
                setSelectedTickets(selectedTickets?.map((item) => {
                    if (item.ticketType === ticketType) {
                        return {
                            ticketType,
                            quantity: item.quantity + 1,
                        }
                    }
                    return item;
                }))
            } else {
                setSelectedTickets([...selectedTickets, {
                    ticketType,
                    quantity: 1,
                }])
            }
        }
    }

    const decrement = (ticketType: string) => {
        if (selectedTickets === null) {
            return;
        } else {
            // check if the ticket exisit 
            const ticket = selectedTickets?.filter((item) => item.ticketType === ticketType)[0];
            const eventTicket = event?.productTypeData.filter((item) => item.ticketType === ticketType)[0];
            if (ticket) {
                if (ticket.quantity - 1 === 0) {
                    const filtered = selectedTickets.filter((item) => item.ticketType !== ticketType);
                    setSelectedTickets(filtered);
                    return;
                }
                setSelectedTickets(selectedTickets?.map((item) => {
                    if (item.ticketType === ticketType) {
                        return {
                            ticketType,
                            quantity: item.quantity - 1,
                        }
                    }
                    return item;
                }))
            }
        }
    }

    const getTicket = (ticketType: string) => {
        return selectedTickets?.filter((item) => item.ticketType === ticketType)[0];
    }

    const getTicketPrice = (ticketType: string) => {
        const ticket = event?.productTypeData.filter((item) => item.ticketType === ticketType)[0];
        return ticket?.ticketPrice;
    }

    const calculateTotal = () => {
        let total = 0;
        selectedTickets?.forEach((item) => {
            total += (getTicketPrice(item.ticketType) as number) * item.quantity;
        })
        setTotalSelectedTicketPrice(total);
        return formatNumber(total);
    }

    const handleNext = () => {
        if (selectedTickets === null || selectedTickets?.length < 1) {
            toaster.create({
                title: 'Error',
                description: 'You need to select a ticket to continue',
                type: 'error',
                closable: true,
            });
            return;
        }
        setStep((prev) => prev + 1);
    }

    return (
        <Box w="full" bg="white" borderRadius="xl" overflow="hidden" p="20px" h="608px">

            <Flex w="full" flexDirection={['column', 'column', 'row', 'row']} spaceX={'20px'} h="full">


                {/* Right Side - Ticket Selection */}
                <Flex flexDir={'column'} flex="0.55" overflowY={'auto'}>
                    <VStack w="full" borderBottomWidth={'1px'} borderBottomColor={'lightgrey'} mb={["0px", "0px", "20px", "20px"]} pb="10px" pt="20px">
                        <CustomText type='HEADER' fontSize={'26px'} text={event?.eventName as string} width={'auto'} color={'black'} />
                        <CustomText type='REGULAR' fontSize={'16px'} text={new Date(event?.endDate).toDateString()} width={'auto'} color={'black'} />
                    </VStack>
                    <VStack spaceY={[4, 4, 6, 6]} w="full" p={[0, 0, 0, 0]} flex={1}>
                        <Box w="100%" h="200px" overflow={'hidden'} display={['block', 'block', 'none', 'none']}>
                            <Image
                                src={eventImage}
                                alt={eventTitle}
                                w="auto"
                                h="200px"
                                objectFit="cover"
                                borderRadius={'20px'}
                            />
                        </Box>
                        {/* Ticket Types */}
                        <VStack spaceY={4} px={['10px', '10px', '0px', '0px']} w="full" h="auto">
                            {event?.productTypeData?.map((ticket) => {

                                return (
                                    <Box
                                        key={ticket.ticketType}
                                        w="full"
                                        h="100px"
                                        border="1px solid"
                                        borderRadius="lg"
                                        p={4}
                                        bg={getTicket(ticket?.ticketType) ? "blue.50" : "white"}
                                        borderWidth={getTicket(ticket?.ticketType)?.ticketType ? "2px" : "1px"}
                                        borderStyle={getTicket(ticket?.ticketType) ? "solid" : "solid"}
                                        borderColor={getTicket(ticket?.ticketType) ? "blue.400" : "gray.200"}
                                    >
                                        <Flex justify="space-between" align="center" justifyContent={'center'} h="full">
                                            <Box flex="1">
                                                <HStack spaceX={3} mb={2}>
                                                    <Text fontSize="lg" fontWeight="semibold" color={getTicket(ticket?.ticketType) ? 'black' : 'grey'}>
                                                        {ticket.ticketType}
                                                    </Text>

                                                </HStack>
                                                {ticket.ticketType === 'Early Bird' ? (
                                                    <Badge colorPalette="red" fontSize="sm" mt={1} >
                                                        Sales end on {new Date(ticket.endDate as number).toDateString()}
                                                    </Badge>
                                                )
                                                    :
                                                    (
                                                        <Badge colorPalette="blue" fontSize="sm" mt={1} >
                                                            Total Tickets available - {totalTickets}
                                                        </Badge>
                                                    )
                                                }
                                            </Box>

                                            <HStack spaceX={1}>
                                                <IconButton
                                                    aria-label="Decrease quantity"
                                                    size="sm"
                                                    variant="outline"
                                                    borderRadius="full"
                                                    disabled={!getTicket(ticket.ticketType)}
                                                    onClick={() => decrement(ticket.ticketType)}
                                                >
                                                    <Minus size="16" />
                                                </IconButton>

                                                <Text fontSize="lg" fontWeight="semibold" color={getTicket(ticket?.ticketType)?.quantity ? 'black' : 'grey'} >
                                                    {getTicket(ticket.ticketType)?.quantity ? getTicket(ticket?.ticketType)?.quantity : 0}
                                                </Text>

                                                <IconButton
                                                    aria-label="Increase quantity"
                                                    size="sm"
                                                    variant="outline"
                                                    borderRadius="full"
                                                    onClick={() => increment(ticket.ticketType)}
                                                >
                                                    <Add size="16px" />
                                                </IconButton>
                                            </HStack>
                                        </Flex>
                                    </Box>
                                );
                            })}

                            <HStack fontFamily={'Raleway-Regular'} w="full">
                                <Text color="grey" fontSize={'14px'}>Powered by</Text>
                                <Text color="primaryColor" fontSize={'16px'} fontStyle={'italic'} fontWeight={600}>Chasescroll</Text>
                            </HStack>




                        </VStack>




                    </VStack>

                    <HStack w="full" h="70px" borderTopWidth={'2px'} borderTopColor={'lightgrey'} justifyContent={'flex-end'}>
                        <Button
                            bgColor="primaryColor"
                            size="lg"
                            w="35%"
                            h="35px"
                            borderRadius="full"
                            onClick={() => handleNext()}
                            disabled={selectedTickets === null || selectedTickets?.length < 1}
                            display={['none', 'none', 'block', 'block']}
                        >
                            Get Ticket
                        </Button>
                    </HStack>
                </Flex>

                {/* Left Side - Event Image */}
                <Box flex="0.45" position="relative" bgColor="whitesmoke" borderRadius={'10px'} overflow={'hidden'} display={'flex'} flexDir={'column'}>
                    <Box w="100%" h="270px" overflow={'hidden'} display={['none', 'none', 'block', 'block']} bg="gray.200">
                        <Image
                            src={eventImage}
                            alt={eventTitle}
                            w="100%"
                            h="270px"
                            objectFit="contain"

                        />
                    </Box>

                    {/* <VStack alignItems={'center'} borderBottomWidth={'2px'} borderBottomColor={'lightgrey'} pb="10px" h="70px" justifyContent={'center'}>
                        <Text fontFamily={'Raleway-Bold'} fontSize={'18px'}>{totalTickets}</Text>
                        <Text fontSize={'14px'}>Tickets available for this event</Text>
                    </VStack> */}

                    {selectedTickets === null || selectedTickets?.length < 1 && (
                        <VStack flex={1} justifyContent={'center'} alignItems={'center'}>
                            <ShoppingCart size="60px" variant='Outline' color="lightgrey" />
                        </VStack>
                    )}

                    {/* Order Summary */}
                    {selectedTickets !== null && selectedTickets.length > 0 && (
                        <Box p="20px">
                            {/* <Divider mb={4} /> */}
                            <Text fontSize="lg" fontWeight="bold" mb={4}>
                                Order summary
                            </Text>

                            <VStack spaceY={3} align="stretch">
                                {selectedTickets !== null && selectedTickets.length > 0 && selectedTickets.map((item) => (
                                    <Flex justify="space-between" mb="10px">
                                        <Text>
                                            {item?.quantity} x {item?.ticketType}
                                        </Text>
                                        <Text fontWeight="semibold">
                                            {formatNumber((getTicketPrice(item.ticketType) as number) * item.quantity)}
                                        </Text>
                                    </Flex>
                                ))}

                                {/* <Divider /> */}

                                <Flex justify="space-between" fontSize="lg" fontWeight="bold">
                                    <Text>Total</Text>
                                    <Text>
                                        NGN {calculateTotal()}
                                    </Text>
                                </Flex>
                            </VStack>

                            <Button
                                bgColor="primaryColor"
                                size="lg"
                                w="100%"
                                h="60px"
                                borderRadius="full"
                                onClick={() => handleNext()}
                                disabled={selectedTickets === null}
                                _disabled={{
                                    bg: "gray.300",
                                    color: "gray.500",
                                    cursor: "not-allowed"
                                }}
                                display={['block', 'block', 'none', 'none']}
                                mt="20px"
                            >
                                Get Ticket
                            </Button>
                        </Box>
                    )}

                </Box>
            </Flex>
        </Box>
    );
};

export default TicketSelection;