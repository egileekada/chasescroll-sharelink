import { activeEventAtom, activeTicketAtom, createdTicketAtom, ticketCountAtom, ticketurchaseStepAtom } from '@/states/activeTicket';
import { Dialog, Portal, CloseButton } from '@chakra-ui/react';
import { atom, useAtom, useAtomValue } from 'jotai';
import React from 'react'
import LoginModal from '../TicketPurchaseModal/LoginModal';
import { currentIdAtom } from '@/views/share/Event';
import TicketPurchaseSuccessModal from '../TicketPurchaseModal/TicketPurchaseSuccessModal';
import { STORAGE_KEYS } from '@/utils/StorageKeys';
import FundRaiserAccountSetup from './FundRaiserAccountSetup';
import { activeFundRaiserAtom, donationAmountAtom } from '@/states/activeFundraiser';

const titles = [
    'Select Tickets',
    'Enter Details',
    'Verify Your Email'
]
interface IProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'EVENT' | 'FUNDRAISER' | 'PRODUCT'
}

function FundRaiserModal({ isOpen, onClose }: IProps) {

    const [quantity, setQuantity] = useAtom(ticketCountAtom)
    const [currentStep, setCurrentStep] = useAtom(ticketurchaseStepAtom);
    const [event, setEvent] = useAtom(activeEventAtom);
    const [activeTicket, setActiveTicket] = useAtom(activeTicketAtom);
    const currentId = useAtomValue(currentIdAtom);
    const createdTicket = useAtomValue(createdTicketAtom);
    const [activeFundRaider, setActiveFundRaiser] = useAtom(activeFundRaiserAtom);
    const [amount, setAmount] = useAtom(donationAmountAtom);

    React.useEffect(() => {
        setActiveFundRaiser(() => {
            const data = localStorage.getItem(STORAGE_KEYS.DONATION_DETAILS);
            if (data) {
                return JSON.parse(data);
            } else {
                return null;
            }
        });

        setAmount(() => {
            const data = localStorage.getItem(STORAGE_KEYS.DONATION_AMOUNT);
            if (data) {
                return Number(data);
            } else {
                return 0;
            }
        })
    }, [])

    return (
        <Dialog.Root lazyMount open={isOpen} onOpenChange={() => {
            setCurrentStep(1);
            setActiveFundRaiser(null)
            setAmount(0)
            localStorage.clear()
            onClose();
        }} size={currentStep === 3 ? 'sm' : 'xl'} placement={'center'} closeOnEscape={false} closeOnInteractOutside={false} modal={false}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius={'16px'} bgColor="white" p="0">
                        <Dialog.Body p="0px">
                            {currentStep === 1 && (
                                <FundRaiserAccountSetup />
                            )}
                            {currentStep === 2 && (
                                <LoginModal
                                    callbackUrl={`/share/fundraiser?id=${currentId}`}
                                    onLoggedIn={() => {
                                        setCurrentStep(1);
                                    }} />
                            )}
                            {currentStep === 3 && (
                                <TicketPurchaseSuccessModal
                                    email={createdTicket?.content?.buyer?.email}
                                    orderNumber={createdTicket?.content?.orderCode}
                                    onClose={() => {
                                        localStorage.clear();
                                        setCurrentStep(1);
                                        setQuantity(1);
                                        setEvent(null)
                                        setActiveTicket(null);
                                        onClose();
                                    }}
                                    type='FUNDRAISER'
                                />
                            )}
                        </Dialog.Body>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton bg="black" color={'white'} size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default FundRaiserModal;
