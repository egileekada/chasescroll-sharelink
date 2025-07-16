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
} from '@chakra-ui/react'
import React from 'react'
import { useAtomValue } from 'jotai'
import { activeEventAtom, ticketCountAtom } from '@/states/activeTicket'
import { CloseSquare, TickCircle } from 'iconsax-reactjs'

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
            {/* Close Button */}
            <IconButton
                aria-label="Close"
                position="absolute"
                top={4}
                right={4}
                zIndex={10}
                variant="ghost"
                color="gray.600"
                onClick={onClose}
                _hover={{ bg: "gray.100" }}
            >
                <CloseSquare size="24" />
            </IconButton>

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

                {/* Event Details Section */}
                <Box mb={8}>
                    <Text fontSize="sm" color="gray.600" mb={2} textTransform="uppercase" letterSpacing="wide">
                        YOU'RE GOING TO
                    </Text>

                    <Flex justify="space-between" align="start" mb={6}>
                        <Text fontSize="3xl" fontWeight="bold" color="primaryColor">
                            {event?.eventName || "Tech Submit"}
                        </Text>
                        {/* <Button
                            bgColor="primaryColor"
                            size="lg"
                            borderRadius="full"
                            px={8}
                        >
                            View Ticket
                        </Button> */}
                    </Flex>

                    {/* Event Info Grid */}
                    <SimpleGrid columns={[1, 1, 3, 3]} gap={8} mb={6}>
                        <GridItem>
                            <VStack align="start" spaceY={2}>
                                <Text fontSize="sm" color="gray.600" fontWeight="semibold" textTransform="uppercase">
                                    {quantity} TICKET SENT TO
                                </Text>
                                <Text fontSize="md" color="black">
                                    {email}
                                </Text>
                                {/* <Link fontSize="sm" color="blue.500" fontWeight="medium">
                                    Change
                                </Link> */}
                            </VStack>
                        </GridItem>

                        <GridItem>
                            <VStack align="start" spaceY={2}>
                                <Text fontSize="sm" color="gray.600" fontWeight="semibold" textTransform="uppercase">
                                    DATE
                                </Text>
                                <Text fontSize="md" color="black">
                                    {event?.startDate ? formatEventDate(event.startDate) : "Saturday, July 26"}
                                </Text>
                                <Text fontSize="md" color="primaryColor">
                                    {event?.startDate ? formatEventTime(event.startDate) : "10am-6pm"}
                                </Text>
                            </VStack>
                        </GridItem>

                        <GridItem>
                            <VStack align="start" spaceY={2}>
                                <Text fontSize="sm" color="gray.600" fontWeight="semibold" textTransform="uppercase">
                                    LOCATION
                                </Text>
                                <Text fontSize="md" color="primaryColor" cursor="pointer"
                                    onClick={() => {
                                        if (event?.location?.latlng) {
                                            const [lat, lng] = event.location.latlng.split(' ');
                                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                                        }
                                    }}
                                >
                                    {event?.location?.locationDetails || "Online"}
                                </Text>
                            </VStack>
                        </GridItem>
                    </SimpleGrid>
                </Box>

                {/* Products Section */}
                {/* <Box>
                    <Flex justify="space-between" align="center" mb={6}>
                        <Text fontSize="xl" fontWeight="bold" color="black">
                            Product available for this event
                        </Text>
                        <Link fontSize="sm" color="blue.500" fontWeight="medium">
                            View Kiosk
                        </Link>
                    </Flex>

                
                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    {mockProducts.map((product) => (
                        <GridItem key={product.id}>
                            <Box
                                bg="gray.50"
                                borderRadius="lg"
                                overflow="hidden"
                                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                                transition="all 0.2s"
                                cursor="pointer"
                            >
                                <Box position="relative">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        w="100%"
                                        h="150px"
                                        objectFit="cover"
                                    />
                                    {product.available && (
                                        <Badge
                                            position="absolute"
                                            top={2}
                                            right={2}
                                            colorScheme="gray"
                                            fontSize="xs"
                                        >
                                            {product.available} Avail
                                        </Badge>
                                    )}
                                </Box>
                                <Box p={4}>
                                    <Text fontSize="lg" fontWeight="bold" color="black" mb={1}>
                                        ₦{formatNumber(product.price)}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        {product.name}
                                    </Text>
                                </Box>
                            </Box>
                        </GridItem>
                    ))}
                </Grid>
            </Box>  */}
            </Box>
        </Box >
    )
}

export default TicketPurchaseSuccessModal