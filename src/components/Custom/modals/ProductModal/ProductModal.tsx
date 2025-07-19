import { activeEventAtom, activeTicketAtom, createdTicketAtom, ticketCountAtom, ticketurchaseStepAtom } from '@/states/activeTicket';
import { Dialog, Portal, CloseButton } from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import React from 'react'
import LoginModal from '../TicketPurchaseModal/LoginModal';
import { currentIdAtom } from '@/views/share/Event';
import { STORAGE_KEYS } from '@/utils/StorageKeys';
import ProductReviewPage from './ProductReviewPage';
import ProductAddressPage from './ProductAddressPage';
import ProductSuccessPage from './ProductSuccessPage';

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

function ProductModal({ isOpen, onClose }: IProps) {

    const [quantity, setQuantity] = useAtom(ticketCountAtom)
    const [currentStep, setCurrentStep] = useAtom(ticketurchaseStepAtom);
    const [event, setEvent] = useAtom(activeEventAtom);
    const [activeTicket, setActiveTicket] = useAtom(activeTicketAtom);
    const currentId = useAtomValue(currentIdAtom);
    const createdTicket = useAtomValue(createdTicketAtom);

    React.useEffect(() => {
        setQuantity(() => {
            const quantity = localStorage.getItem(STORAGE_KEYS.TICKET_COUNT);
            return quantity ? Number(quantity) : 1;
        })
    }, [])

    return (
        <Dialog.Root lazyMount open={isOpen} onOpenChange={() => {
            onClose();
        }} size={currentStep === 3 ? 'sm' : 'xl'} placement={'center'} closeOnEscape={false} closeOnInteractOutside={false} modal={false}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius={'16px'} bgColor="white" p="0">
                        <Dialog.Body p="0px">
                            {currentStep === 1 && (
                                <ProductReviewPage />
                            )}
                            {currentStep === 2 && (
                                <ProductAddressPage />
                            )}
                            {currentStep === 3 && (
                                <LoginModal
                                    callbackUrl={`/share/product?id=${currentId}`}
                                    onLoggedIn={() => {
                                        setCurrentStep(2);
                                    }} />
                            )}
                            {currentStep === 4 && (
                                <ProductSuccessPage
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

export default ProductModal;
