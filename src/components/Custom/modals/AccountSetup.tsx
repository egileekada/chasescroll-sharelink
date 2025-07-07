import { Box, Button, Image, VStack } from '@chakra-ui/react'
import React from 'react'
import CustomText from '../CustomText'
import { useAtom, useAtomValue } from 'jotai'
import { currentUrlAtom, ticketurchaseStepAtom } from './TicketPurchaseModal'
import { useMutation } from '@tanstack/react-query'
import httpService from '@/services/httpService'
import { URLS } from '@/services/urls'
import { toaster } from '@/components/ui/toaster'
import { signIn, useSession, getSession } from 'next-auth/react';
import { getToken } from 'next-auth/jwt';
import { currentIdAtom } from '@/views/share/Event'
import { useGoogleTokens } from '@/hooks/useGoogleTokens';

interface Props {
    params: {
        type: string
    },
    searchParams: {
        id: string
    }
}


function AccountSetup() {
    const [step, setStep] = useAtom(ticketurchaseStepAtom);
    const [currentUrl, setCurrentUrl] = useAtom(currentUrlAtom);
    const { data: session, status } = useSession();
    const { tokens, isLoading: tokensLoading, refreshTokens, sendTokensToBackend } = useGoogleTokens();

    const currentId = useAtomValue(currentIdAtom)

    // Method 1: Access tokens from session (client-side)
    const getTokensFromSession = () => {
        if (session?.token) {
            console.log('Access Token:', session.token.accessToken);
            console.log('ID Token:', session.token.idToken);
            console.log('Refresh Token:', session.token.refeshToken);
            return {
                accessToken: session.token.accessToken,
                idToken: session.token.idToken,
                refreshToken: session.token.refeshToken
            };
        }
        return null;
    };

    // Method 2: Get fresh session data
    const getTokensFromFreshSession = async () => {
        try {
            const freshSession = await getSession();
            if (freshSession?.token) {
                console.log('Fresh Access Token:', freshSession.token.accessToken);
                console.log('Fresh ID Token:', freshSession.token.idToken);
                return {
                    accessToken: freshSession.token.accessToken,
                    idToken: freshSession.token.idToken,
                    refreshToken: freshSession.token.refeshToken
                };
            }
        } catch (error) {
            console.error('Error getting fresh session:', error);
        }
        return null;
    };

    const handleGoogleSignIn = async () => {
        try {
            setCurrentUrl(`/share/event?id=${currentId}`);
            const result = await signIn('google',
                {
                    redirect: false,
                    // callbackUrl: `/share/event?id=${currentId}`

                }
            );

            if (result?.error) {
                toaster.create({
                    title: 'Sign in failed',
                    description: result.error,
                    type: 'error',
                });
            } else {
                toaster.create({
                    title: 'Success',
                    description: 'Successfully signed in with Google',
                    type: 'success',
                });
                
                // Wait a moment for session to update, then get tokens
                setTimeout(async () => {
                    const freshTokens = await refreshTokens();
                    if (freshTokens) {
                        console.log('Retrieved tokens after sign-in:', freshTokens);
                        
                        // Send tokens to your backend for storage/processing
                        try {
                            await sendTokensToBackend(freshTokens);
                            console.log('Tokens successfully sent to backend');
                        } catch (error) {
                            console.error('Failed to send tokens to backend:', error);
                        }
                    }
                }, 1000);
                
                setStep((prev) => prev + 1);
                console.log('Sign-in result:', result);
            }
        } catch (error) {
            toaster.create({
                title: 'An error occurred',
                description: 'Failed to sign in with Google',
                type: 'error',
            });
        }
    };

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => httpService.post(`${URLS.auth}/temporary-signup`, data),
        onError: (error) => {
            toaster.create({
                title: 'An error occured',
                description: error?.message,
                type: 'error',
            })
        },
        onSuccess: (data) => {
            console.log(data?.data);
            setStep((prev) => prev + 1);
            toaster.create({
                title: 'Account created',
                description: 'Your account has been created',
                type: 'success',
            })
        }
    });

    return (
        <Box w="full" h="full">
            <VStack w="full" mt='20px' alignItems={'center'} >
                <CustomText type='MEDIUM' fontSize='18px' color='black' text='Sign In' textAlign={'center'} width="auto" />
                <CustomText type='LIGHT' fontSize='14px' color='gray' text='You have to sign in to continue' textAlign={'center'} width="auto" />
            </VStack>
            <Box h="20px" />
            <Button onClick={handleGoogleSignIn} w="full" h="52px" bgColor="#F5F5F5" borderWidth="1px" borderRadius="full" borderColor="#0000001A" color='gray.600'>
                <Image src="/images/googleIcon.png" w="30px" h="30px" objectFit={'contain'} />
                Continue with Google
            </Button>
        </Box>
    )
}

export default AccountSetup