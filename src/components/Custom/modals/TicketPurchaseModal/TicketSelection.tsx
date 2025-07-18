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
import { Add, Minus } from 'iconsax-reactjs';
import { useAtom, useSetAtom } from 'jotai';
import { activeEventAtom, activeTicketAtom, ticketCountAtom, ticketurchaseStepAtom } from '@/states/activeTicket';
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
    const [activeTicket, setActiveTicket] = useAtom(activeTicketAtom);
    const setStep = useSetAtom(ticketurchaseStepAtom);
    const [quantity, setQuantity] = useAtom(ticketCountAtom)


    const increment = (ticketType: string) => {
        if (activeTicket === null) {
            const ticket = event?.productTypeData.filter((item) => item.ticketType === ticketType)[0] as IProductTypeData;
            setActiveTicket(ticket);

            if (quantity + 1 > (ticket.maxTicketBuy as number)) {
                toaster.create({
                    title: 'Error',
                    description: `You can only buy ${ticket.maxTicketBuy} tickets`,
                    type: 'error',
                });
                return;
            }
            setQuantity((prev) => prev + 1);
        } else {
            // check the current active ticket
            const ticket = event?.productTypeData.filter((item) => item.ticketType === ticketType)[0] as IProductTypeData;
            if (ticket.ticketType !== activeTicket.ticketType) {
                setActiveTicket(ticket);
                if (quantity + 1 > (ticket.maxTicketBuy as number)) {
                    toaster.create({
                        title: 'Error',
                        description: `You can only buy ${ticket.maxTicketBuy} tickets`,
                        type: 'error',
                    });
                    return;
                }
                setQuantity(1);
            } else {
                if (quantity + 1 > (ticket.maxTicketBuy as number)) {
                    toaster.create({
                        title: 'Error',
                        description: `You can only buy ${ticket.maxTicketBuy} tickets`,
                        type: 'error',
                    });
                    return;
                }
                setQuantity((prev) => prev + 1);
            }
        }
    }

    const decrement = (ticketType: string) => {
        if (activeTicket === null) {
            const ticket = event?.productTypeData.filter((item) => item.ticketType === ticketType)[0] as IProductTypeData;
            setActiveTicket(ticket);

            if (quantity === 1) {
                toaster.create({
                    title: 'Error',
                    description: `You must buy at least one ticket`,
                    type: 'error',
                });
                return;
            }
            setQuantity((prev) => prev - 1);
        } else {
            // check the current active ticket
            const ticket = event?.productTypeData.filter((item) => item.ticketType === ticketType)[0] as IProductTypeData;
            if (ticket.ticketType !== activeTicket.ticketType) {
                setActiveTicket(ticket);
                if (quantity === 1) {
                    toaster.create({
                        title: 'Error',
                        description: `You must buy at least one ticket`,
                        type: 'error',
                    });
                    return;
                }
                setQuantity(1);
            } else {
                if (quantity === 1) {
                    toaster.create({
                        title: 'Error',
                        description: `You must buy at least one ticket`,
                        type: 'error',
                    });
                    return;
                }
                setQuantity((prev) => prev - 1);
            }
        }
    }

    const handleNext = () => {
        if (activeTicket === null) {
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
        <Box w="full" bg="white" borderRadius="xl" overflow="hidden">

            <Flex w="full" flexDirection={['column', 'column', 'row', 'row']}>


                {/* Right Side - Ticket Selection */}
                <Box flex="0.55" overflowY={'auto'}>
                    <VStack w="full" borderBottomWidth={'1px'} borderBottomColor={'lightgrey'} mb={["0px", "0px", "20px", "20px"]} pb="10px" pt="20px">
                        <CustomText type='HEADER' fontSize={'20px'} text={event?.eventName as string} width={'auto'} color={'black'} />
                    </VStack>
                    <VStack spaceY={[4, 4, 6, 6]} w="full" p={[0, 0, 8, 8]}>
                        <Box w="100%" h="200px" overflow={'hidden'} display={['block', 'block', 'none', 'none']}>
                            <Image
                                src={eventImage}
                                alt={eventTitle}
                                w="100%"
                                h="200px"
                                objectFit="cover"

                            />
                        </Box>
                        {/* Ticket Types */}
                        <VStack spaceY={4} px={['10px', '10px', '0px', '0px']} w="full" h="auto">
                            {event?.productTypeData?.map((ticket) => {

                                return (
                                    <Box
                                        key={ticket.ticketType}
                                        w="full"
                                        border="1px solid"
                                        borderRadius="lg"
                                        p={4}
                                        bg={activeTicket?.ticketType === ticket.ticketType ? "blue.50" : "white"}
                                        borderWidth={activeTicket?.ticketType === ticket.ticketType ? "2px" : "1px"}
                                        borderStyle={activeTicket?.ticketType === ticket.ticketType ? "solid" : "solid"}
                                        borderColor={activeTicket?.ticketType === ticket.ticketType ? "blue.400" : "gray.200"}
                                    >
                                        <Flex justify="space-between" align="center">
                                            <Box flex="1">
                                                <HStack spaceX={3} mb={2}>
                                                    <Text fontSize="lg" fontWeight="semibold" color={activeTicket?.ticketType === ticket.ticketType ? 'black' : 'grey'}>
                                                        {ticket.ticketType}
                                                    </Text>

                                                </HStack>
                                                <Text fontSize="sm" mb={2} color={activeTicket?.ticketType === ticket.ticketType ? 'grey' : 'lightgrey'} >
                                                    Ticket Available for this Event
                                                </Text>
                                            </Box>

                                            <HStack spaceX={1}>
                                                <IconButton
                                                    aria-label="Decrease quantity"
                                                    size="sm"
                                                    variant="outline"
                                                    borderRadius="full"
                                                    disabled={quantity === 0}
                                                    onClick={() => decrement(ticket.ticketType)}
                                                >
                                                    <Minus size="16" />
                                                </IconButton>

                                                <Text fontSize="lg" fontWeight="semibold" color={activeTicket?.ticketType === ticket.ticketType ? 'black' : 'grey'} >
                                                    {activeTicket?.ticketType === ticket.ticketType ? quantity : 0}
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

                            <Button
                                bgColor="primaryColor"
                                size="lg"
                                w="100%"
                                h="60px"
                                borderRadius="full"
                                onClick={() => handleNext()}
                                disabled={activeTicket === null}
                                _disabled={{
                                    bg: "gray.300",
                                    color: "gray.500",
                                    cursor: "not-allowed"
                                }}
                                display={['none', 'none', 'block', 'block']}
                            >
                                Get Ticket
                            </Button>
                        </VStack>




                    </VStack>
                </Box>

                {/* Left Side - Event Image */}
                <Box flex="0.45" position="relative" bgColor="whitesmoke">
                    <Box w="100%" h="200px" overflow={'hidden'} display={['none', 'none', 'block', 'block']}>
                        <Image
                            src={eventImage}
                            alt={eventTitle}
                            w="100%"
                            h="200px"
                            objectFit="cover"

                        />
                    </Box>

                    {/* Order Summary */}
                    {activeTicket !== null && (
                        <Box p="20px">
                            {/* <Divider mb={4} /> */}
                            <Text fontSize="lg" fontWeight="bold" mb={4}>
                                Order summary
                            </Text>

                            <VStack spaceY={3} align="stretch">
                                <Flex justify="space-between">
                                    <Text>
                                        {quantity} x {activeTicket.ticketType}
                                    </Text>
                                    <Text fontWeight="semibold">
                                        {formatNumber((activeTicket.ticketPrice as number) * quantity)}
                                    </Text>
                                </Flex>

                                {/* <Divider /> */}

                                <Flex justify="space-between" fontSize="lg" fontWeight="bold">
                                    <Text>Total</Text>
                                    <Text>
                                        NGN {formatNumber((activeTicket.ticketPrice as number) * quantity)}
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
                                disabled={activeTicket === null}
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