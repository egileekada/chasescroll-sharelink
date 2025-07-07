import { RESOURCE_URL } from '@/constants'
import { textLimit } from '@/utils/textlimiter'
import { Box, Button, Flex, HStack, VStack, Image, Text } from '@chakra-ui/react'
import { formatNumber } from '@/utils/formatNumber'
import { Minus, Add } from 'iconsax-reactjs'
import React from 'react'
import ChasescrollBox from '../ChasescrollBox'
import { useAtom } from 'jotai'
import { activeEventAtom, activeTicketAtom } from '@/states/activeTicket'
import { toaster } from '@/components/ui/toaster'
import { ticketCountAtom, ticketurchaseStepAtom } from './TicketPurchaseModal'

function TicketSelection() {
    const [ticketCount, setTicketCount] = useAtom(ticketCountAtom);
    const [activeTicket, setActiveTicket] = useAtom(activeTicketAtom);
    const [activeEvent, setActiveEvent] = useAtom(activeEventAtom);
    const [step, setStep] = useAtom(ticketurchaseStepAtom);

    const handleAddition = () => {
        const maxBuy = activeTicket?.maxTicketBuy;
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

    const handleNext = () => {
        setStep((prev) => prev + 1);
    }

    return (
        <Box w='full' h="full">
            <HStack w="full" h="150px" bgColor="gray.100" borderRadius={'16px'} p="2">
                <ChasescrollBox width="40%" height="120px" borderRadius='20px'>
                    <Image src={RESOURCE_URL + (activeEvent?.currentPicUrl as string)} w="full" h="full" objectFit="cover" />
                </ChasescrollBox>
                <VStack alignItems={'flex-start'} w="60%">
                    <Text fontSize="18px" fontWeight="600" color={'black'} >{activeEvent?.eventName}</Text>
                    <Text fontSize="16px" fontWeight="400" color={'black'} >{(activeEvent?.eventDescription?.length as number) > 70 ? textLimit(activeEvent?.eventDescription as string, 70) : activeEvent?.eventDescription}</Text>
                    <Text fontSize="12px" color="primaryColor" fontFamily={'body'} >{(activeEvent?.location?.locationDetails?.length as number) > 40 ? textLimit(activeEvent?.location?.locationDetails as string, 40) + '...' : activeEvent?.location?.locationDetails}</Text>
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
                <Text>{formatNumber((activeTicket?.ticketPrice as number) * ticketCount)}</Text>
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
                <Text>{formatNumber(((activeTicket?.ticketPrice as number) * ticketCount) + 163.35 + 60)}</Text>
            </HStack>

            <Button w="full" h="50px" borderRadius={'full'} bgColor="primaryColor" color="white" mt="20px" onClick={() => handleNext()}>Next</Button>
        </Box>
    )
}

export default TicketSelection
