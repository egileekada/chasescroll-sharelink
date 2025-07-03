import { activeTicketAtom } from '@/states/activeTicket';
import { Dialog, HStack, Portal, Image, VStack, Text, Flex, Button, CloseButton } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import React from 'react'
import ChasescrollBox from '../ChasescrollBox';
import { RESOURCE_URL } from '@/constants';
import { textLimit } from '@/utils/textlimiter';
import { toaster } from '@/components/ui/toaster';
import { Add, Minus } from 'iconsax-reactjs';
import { formatNumber } from '@/utils/formatNumber';

interface IProps {
    isOpen: boolean;
    onClose: () => void;
}

function TicketPurchaseModal({ isOpen, onClose }: IProps) {
    const [ticketCount, setTicketCount] = React.useState(1);
    const [activeTicket, setActiveTicket] = useAtom(activeTicketAtom);

    const handleAddition = () => {
        const maxBuy = activeTicket?.event?.productTypeData.filter((item) => item.ticketType === activeTicket.ticketType)[0].maxTicketBuy as number;
        if (maxBuy === ticketCount) {
            toaster.create({
                title: 'warning',
                description: `You can not buy more than ${maxBuy} ticket`,
                type: 'error',
            })
        } else {
            setTicketCount((prev) => prev + 1);
        }
    }

    const handleSubtraction = () => {
        if (ticketCount === 1) {
            toaster.create({
                title: 'warning',
                description: `You need to buy at least 1 ticket`,
                type: 'error',
            })
        } else {
            setTicketCount((prev) => prev - 1);
        }
    }
    return (
        <Dialog.Root lazyMount open={isOpen} onOpenChange={() => {
            setTicketCount(1);
            onClose();
        }} size={'sm'} placement={'center'}>
            <Portal>
                <Dialog.CloseTrigger top="0" insetEnd="-12" asChild>
                    <CloseButton bg="black" size="sm" />
                </Dialog.CloseTrigger>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius={'16px'} bgColor="white">
                        <Dialog.Body py={'20px'}>
                            <HStack w="full" h="150px" bgColor="gray.100" borderRadius={'16px'} p="2">
                                <ChasescrollBox width="40%" height="120px" borderRadius='20px'>
                                    <Image src={RESOURCE_URL + (activeTicket?.event?.currentPicUrl as string)} w="full" h="full" objectFit="cover" />
                                </ChasescrollBox>
                                <VStack alignItems={'flex-start'} w="60%">
                                    <Text fontSize="18px" fontWeight="600" color={'black'} >{activeTicket?.event?.eventName}</Text>
                                    <Text fontSize="16px" fontWeight="400" color={'black'} >{(activeTicket?.event?.eventDescription?.length as number) > 70 ? textLimit(activeTicket?.event?.eventDescription as string, 70) : activeTicket?.event?.eventDescription}</Text>
                                    <Text fontSize="12px" color="primaryColor" fontFamily={'body'} >{(activeTicket?.event?.location?.locationDetails?.length as number) > 40 ? textLimit(activeTicket?.event?.location?.locationDetails as string, 40) + '...' : activeTicket?.event?.location?.locationDetails}</Text>
                                </VStack>
                            </HStack>

                            <VStack w="full" h="100px" borderRadius={'16px'} borderWidth={'1px'} borderColor={'gray.200'} mt='20px' justifyContent={'center'} alignItems={'center'}>
                                <Text fontSize={'16px'} fontWeight={'200'} color='black'>Number of tickets</Text>
                                <HStack w="34%" alignItems={'center'} justifyContent={'space-between'}>
                                    <Flex onClick={() => handleSubtraction()} w="40px" h="40px" borderRadius={'13px'} justifyContent={'center'} alignItems={'center'} borderWidth={'2px'} borderColor="gray.200" cursor='pointer'>
                                        <Minus size="25px" variant='Outline' />
                                    </Flex>
                                    <Text fontSize={'16px'} fontWeight={600}>{ticketCount}</Text>
                                    <Flex onClick={() => handleAddition()} w="40px" h="40px" borderRadius={'13px'} justifyContent={'center'} alignItems={'center'} borderWidth={'2px'} borderColor="gray.200" cursor='pointer'>
                                        <Add size="25px" variant='Outline' />
                                    </Flex>
                                </HStack>
                            </VStack>

                            <HStack w="full" justifyContent={'space-between'} alignItems={'center'} mt='20px'>
                                <Text>{activeTicket?.ticketType} [{ticketCount}]</Text>
                            </HStack>

                            <HStack w="full" justifyContent={'space-between'} alignItems={'center'} mt='20px'>
                                <Text>Ticket Price</Text>
                                <Text>{formatNumber((activeTicket?.boughtPrice as number) * ticketCount)}</Text>
                            </HStack>

                            <HStack w="full" justifyContent={'space-between'} alignItems={'center'} mt='20px'>
                                <Text>Service Fee</Text>
                                <Text>{formatNumber(60)}</Text>
                            </HStack>

                            <HStack w="full" justifyContent={'space-between'} alignItems={'center'} mt='20px'>
                                <Text>Processing Fee</Text>
                                <Text>{formatNumber(163.35)}</Text>
                            </HStack>

                            <HStack w="full" justifyContent={'space-between'} alignItems={'center'} mt='20px'>
                                <Text>Total</Text>
                                <Text>{formatNumber(((activeTicket?.boughtPrice as number) * ticketCount) + 163.35 + 60)}</Text>
                            </HStack>

                            <Button w="full" h="50px" borderRadius={'16px'} bgColor="primaryColor" color="white" mt="20px">Pay Now</Button>
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default TicketPurchaseModal
