import React, { useState } from 'react'
import { Box, Button, Modal, ModalOverlay, ModalContent, useDisclosure } from '@chakra-ui/react'
import LoginModal from './LoginModal'

function LoginModalDemo() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [showSignUp, setShowSignUp] = useState(false);

    const handleSignUpClick = () => {
        setShowSignUp(true);
        // Here you would typically navigate to sign up modal or page
        console.log('Navigate to sign up');
    };

    return (
        <Box p={8}>
            <Button onClick={onOpen} colorScheme="blue">
                Open Login Modal
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay bg="blackAlpha.600" />
                <ModalContent bg="transparent" boxShadow="none" maxW="fit-content">
                    <LoginModal 
                        onClose={onClose}
                        onSignUpClick={handleSignUpClick}
                    />
                </ModalContent>
            </Modal>
        </Box>
    )
}

export default LoginModalDemo