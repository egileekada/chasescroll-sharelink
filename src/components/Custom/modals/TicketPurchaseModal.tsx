import { activeTicketAtom } from '@/states/activeTicket';
import { Dialog, HStack, Portal, Image, VStack, Text, Flex, Button, CloseButton, Steps, ColorPicker } from '@chakra-ui/react';
import { atom, useAtom } from 'jotai';
import React from 'react'
import ChasescrollBox from '../ChasescrollBox';
import { RESOURCE_URL } from '@/constants';
import { textLimit } from '@/utils/textlimiter';
import { toaster } from '@/components/ui/toaster';
import { Add, Minus } from 'iconsax-reactjs';
import { formatNumber } from '@/utils/formatNumber';
import TicketSelection from './TicketSelection';
import AccountSetup from './AccountSetup';
import AccountVerification from './AccountVerification';

export const ticketurchaseStepAtom = atom(0);
export const ticketCountAtom = atom(1);
export const currentUrlAtom = atom<string | null>(null);

const titles = [
    'Select Tickets',
    'Enter Details',
    'Verify Your Email'
]
interface IProps {
    isOpen: boolean;
    onClose: () => void;
}

function TicketPurchaseModal({ isOpen, onClose }: IProps) {
    const [ticketCount, setTicketCount] = React.useState(1);
    const [currentStep, setCurrentStep] = useAtom(ticketurchaseStepAtom);


    return (
        <Dialog.Root lazyMount open={isOpen} onOpenChange={() => {
            setTicketCount(1);
            onClose();
        }} size={'md'} placement={'center'} closeOnEscape={false} closeOnInteractOutside={false}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius={'16px'} bgColor="white">
                        <Dialog.Body py={'20px'}>
                            <Steps.Root
                                variant={'solid'}
                                colorPalette={'blue'}
                                step={currentStep}
                                onStepChange={(e) => {
                                    console.log(e.step);
                                    setCurrentStep(e.step)
                                }}
                                count={titles.length}
                            >
                                <Steps.List>
                                    {titles.map((item, index) => (
                                        <Steps.Item key={index} index={index} title={item}>
                                            <Steps.Trigger>
                                                <Steps.Indicator colorScheme={'blue'} />
                                                <Steps.Title>{item}</Steps.Title>
                                            </Steps.Trigger>
                                            <Steps.Separator color={'black'} />
                                        </Steps.Item>
                                    ))}
                                </Steps.List>
                                {titles.map((item, index) => (
                                    <Steps.Content index={index} key={index.toString()}>
                                        {index === 0 && (
                                            <TicketSelection />
                                        )}
                                        {index === 1 && (
                                            <AccountSetup />
                                        )}
                                        {index === 2 && (
                                            <AccountVerification />
                                        )}
                                    </Steps.Content>
                                ))}
                            </Steps.Root>
                        </Dialog.Body>
                        <Dialog.CloseTrigger top="0" insetEnd="-12" asChild>
                            <CloseButton bg="black" color={'white'} size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default TicketPurchaseModal
