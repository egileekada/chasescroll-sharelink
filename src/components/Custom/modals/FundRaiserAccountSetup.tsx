import {
    Box,
    Button,
    Image,
    VStack,
    HStack,
    Flex,
    Text,
    Input,
    Checkbox,
    Badge,
    IconButton
} from '@chakra-ui/react'
import React, { useState } from 'react'
import CustomText from '../CustomText'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMutation } from '@tanstack/react-query'
import httpService from '@/services/httpService'
import { URLS } from '@/services/urls'
import { toaster } from '@/components/ui/toaster'
import { signIn, useSession, getSession } from 'next-auth/react';
import { getToken } from 'next-auth/jwt';
import { currentIdAtom, showTicketModalAtom } from '@/views/share/Event'
import { useGoogleTokens } from '@/hooks/useGoogleTokens';
import { activeEventAtom, activeTicketAtom, canPayAtom, createdTicketAtom, currentUrlAtom, paystackDetailsAtom, ticketCountAtom, ticketurchaseStepAtom } from '@/states/activeTicket'
import { ArrowLeft, CloseSquare, Edit } from 'iconsax-reactjs'
import { formatNumber } from '@/utils/formatNumber'
import { RESOURCE_URL } from '@/constants'
import useForm from '@/hooks/useForm'
import { accountCreationSchema } from '@/services/validation'
import CustomInput from '../CustomInput'
import { STORAGE_KEYS } from '@/utils/StorageKeys'
import { usePaystackPayment } from 'react-paystack';
import { ITicketCreatedModel } from '@/models/TicketCreatedModel'
import PaymentButton from '../PaymentButton'
import { IUser } from '@/models/User'
import { activeFundRaiserAtom, donationAmountAtom } from '@/states/activeFundraiser'

export interface ICustomOrderDto {
    seller: string;
    price: number;
    currency: 'NGN';
    orderType: 'DONATION' | 'PPRODUCT';
    typeID: string;
}

interface Props {
    params: {
        type: string
    },
    searchParams: {
        id: string
    }
}


function FundRaiserAccountSetup() {

    const [step, setStep] = useAtom(ticketurchaseStepAtom);
    const [activeFundRaider, setActiveFundRaiser] = useAtom(activeFundRaiserAtom);
    const [amount, setAmount] = useAtom(donationAmountAtom);
    const [canPay, setCanPay] = useAtom(canPayAtom);
    const [paystackDetails, setPaystackDetails] = useAtom(paystackDetailsAtom);

    const [token, setToken] = React.useState(() => localStorage.getItem(STORAGE_KEYS.token));
    const [userId, setUserId] = React.useState(() => localStorage.getItem(STORAGE_KEYS.USER_ID));
    const [userDetails, setUserDetails] = React.useState<IUser | null>(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DETAILS) as string));
    const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
        const token = localStorage.getItem(STORAGE_KEYS.token);
        const user_id = localStorage.getItem(STORAGE_KEYS.USER_ID);
        return token !== null && user_id !== null;
    });

    const { data: session, status } = useSession();


    const { renderForm, values, setFieldValue, setValues } = useForm({
        defaultValues: {
            firstName: userDetails?.firstName || '',
            lastName: userDetails?.lastName || '',
            email: userDetails?.email || ''
        },
        onSubmit: (data) => {
            if (isLoggedIn) {
                // check the amount
                if (amount === 0) {
                    toaster.create({
                        title: 'Amount is required',
                        description: 'Please enter an amount',
                        type: 'error',
                    })
                    return;
                }
                // create customorder
                createCustomOrder.mutate({
                    seller: activeFundRaider?.createdBy?.userId || '',
                    price: amount,
                    currency: 'NGN',
                    orderType: 'DONATION',
                    typeID: activeFundRaider?.id || ''
                })
                return;
            } else {
                checkEmailMutation(data);
            }
        },
        validationSchema: accountCreationSchema,
    });

    React.useEffect(() => {
        if (status === 'authenticated') {
            // LOGIN USER
            const idToken = session.token?.idToken;
            googleAuth.mutate(idToken);
        }
    }, [status])

    React.useEffect(() => {
        if (userDetails) {
            setFieldValue('firstName', userDetails?.firstName || '', true).then();
            setFieldValue('lastName', userDetails?.lastName || '', true).then();
            setFieldValue('email', userDetails?.email || '', true).then();
        }
    }, [userDetails])

    React.useEffect(() => {
        if (token !== null && userId !== null) {
            setIsLoggedIn(true);
        }
    }, [token, userId, status])

    const createCustomOrder = useMutation({
        mutationFn: (data: ICustomOrderDto) => httpService.post(`${URLS.payments}/createCustomOrder`, data),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: (data) => {
            const item: ITicketCreatedModel = data?.data;
            setPaystackDetails({
                amount: item?.content?.orderTotal * 100,
                email: userDetails?.email as string,
                reference: item?.content?.orderCode,
            });
            setCanPay(true);
            console.log('CUSTOM ORDER CREATED', data?.data);
        }
    })

    const getPublicProfile = useMutation({
        mutationFn: (data: any) => httpService.get(`${URLS.GET_PUBLIC_PROIFLE}/${data}`),
        onError: (error) => { },
        onSuccess: (data) => {
            const details: IUser = data?.data;
            console.log(`User details`, details);
            localStorage.setItem(STORAGE_KEYS.USER_DETAILS, JSON.stringify(details));
            setUserDetails(details);
        },
    })

    const googleAuth = useMutation({
        mutationFn: async (data: any) => httpService.get(`${URLS.auth}/signinWithCredentials`, {
            headers: {
                Authorization: `Bearer ${data}`
            }
        }),
        onError: (error) => {
            toaster.create({
                title: 'Login failed',
                description: error?.message || 'Invalid credentials',
                type: 'error',
            })
        },
        onSuccess: (data) => {
            console.log('Login successful', data?.data);
            localStorage.setItem(STORAGE_KEYS.USER_ID, data?.data?.user_id);
            localStorage.setItem(STORAGE_KEYS.token, data?.data?.access_token);
            localStorage.setItem(STORAGE_KEYS.refreshToken, data?.data?.refresh_token);
            const user_id = localStorage.getItem(STORAGE_KEYS.USER_ID);
            getPublicProfile.mutate(user_id);
        }
    });

    const { mutate: checkEmailMutation, isPending } = useMutation({
        mutationFn: async (data: any) => httpService.post(`${URLS.auth}/temporary-signup`, data),
        onError: (error) => {
            toaster.create({
                title: 'An error occured',
                description: error?.message,
                type: 'error',
            });
            // setStep((prev) => prev + 1);
        },
        onSuccess: (data) => {
            console.log('data', data?.data);
            if (data?.data['stackTrace']) {
                // save everything in local storage
                localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, step.toString());
                setStep((prev) => prev + 1);
                alert('You already have an account');
            } else {
                setUserId(data?.data?.id);
                setToken(data?.data?.token);
                localStorage.setItem(STORAGE_KEYS.token, data?.data?.access_token);
                localStorage.setItem(STORAGE_KEYS.USER_ID, data?.data?.user_id);
                createCustomOrder.mutate({
                    seller: activeFundRaider?.createdBy?.userId || '',
                    price: amount,
                    currency: 'NGN',
                    orderType: 'DONATION',
                    typeID: activeFundRaider?.id || ''
                })

            }
        }
    });

    return renderForm(
        <Box w="full" bg="white" borderRadius="xl" overflow="hidden">
            <Flex w="full">
                {/* Left Side - Checkout Form */}
                <Box flex="0.6">
                    {/* Header */}
                    <HStack mb={6} borderBottomWidth={'1px'} spaceX={6} borderBottomColor={'lightgrey'} p="10px">
                        <IconButton
                            aria-label="Go back"
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep((prev) => prev - 1)}
                        >
                            <ArrowLeft size="20" />
                        </IconButton>
                        <VStack align="start" spaceY={0}>
                            <Text fontSize="xl" fontWeight="bold">Checkout</Text>
                        </VStack>
                    </HStack>

                    <Box p="20px">

                        {/* Event Info */}
                        <HStack mb={8} p={4} borderRadius="lg" borderWidth="1px" borderColor={'lightgrey'}>
                            <Image
                                src={RESOURCE_URL + '/' + activeFundRaider?.bannerImage || "/images/tech-event.jpg"}
                                w="120px"
                                h="120px"
                                objectFit="cover"
                                borderRadius="md"
                            />
                            <VStack align="start" spaceY={1} flex="1">
                                <Text fontWeight="semibold">{activeFundRaider?.name || "Tech Submit"}</Text>
                                <Text fontSize="sm" color="gray.600">
                                    {new Date(activeFundRaider?.endDate).toLocaleString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    FundRaiser Goal - NGN {formatNumber((activeFundRaider?.goal as number))}
                                </Text>
                                <HStack>
                                    <Text fontSize="xs" color="gray.500">Donations So far</Text>
                                    <Badge colorScheme="red" fontSize="xs">{formatNumber((activeFundRaider?.total as number))}</Badge>
                                </HStack>
                            </VStack>

                        </HStack>

                        {/* Contact Information */}
                        {!canPay && (
                            <VStack align="start" spaceY={6} mb={8}>

                                <Box w="full">
                                    <Text>Donation Amount</Text>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        width='full'
                                        height={'60px'}
                                        color="black"
                                        borderWidth='2px'
                                        borderColor={"#E5E5E5"}
                                        bgColor="#F5F5F5"
                                        borderRadius={"full"}
                                        mt="10px"
                                    />
                                </Box>

                                <HStack spaceX={4} w="full">

                                    <Box w="full">
                                        <CustomInput name="firstName" label='First Name' isPassword={false} />
                                    </Box>

                                    <Box w="full">
                                        <CustomInput name="lastName" label='Last Name' isPassword={false} />
                                    </Box>
                                </HStack>
                                <Box w="full">
                                    <CustomInput name="email" label='Email' isPassword={false} />
                                </Box>

                            </VStack>
                        )}

                        {/* Footer */}
                        <HStack justify="space-between" align="center">
                            {!canPay && (
                                <Button
                                    w="full"
                                    h="60px"
                                    bgColor="primaryColor"
                                    size="lg"
                                    borderRadius="full"
                                    px={8}
                                    loading={isPending || createCustomOrder.isPending || googleAuth.isPending || getPublicProfile.isPending}
                                    type={'submit'}
                                >
                                    Confirm Details
                                </Button>
                            )}
                            {canPay && (
                                <PaymentButton
                                    reference={paystackDetails?.reference as string}
                                    email={paystackDetails?.email as string}
                                    amount={paystackDetails?.amount as number}
                                    text={'Pay'}
                                />
                            )}
                        </HStack>

                    </Box>
                </Box>

                {/* Right Side - Event Image & Order Summary */}
                <Box flex="0.4" position="relative" bgColor="whitesmoke">
                    {/* Close Button */}
                    <IconButton
                        aria-label="Close"
                        position="absolute"
                        top={4}
                        right={4}
                        zIndex={10}
                        variant="ghost"
                        color="white"
                        _hover={{ bg: "blackAlpha.600" }}
                    >
                        <CloseSquare size="24" />
                    </IconButton>

                    {/* Event Image */}
                    <Box w="100%" h="300px" overflow="hidden">
                        <Image
                            src={RESOURCE_URL + '/' + activeFundRaider?.bannerImage || "/images/tech-event.jpg"}
                            w="100%"
                            h="300px"
                            objectFit="cover"
                        />
                    </Box>

                    {/* Order Summary */}
                    <Box p={6}>
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                            Donation summary
                        </Text>

                        <VStack spaceY={3} align="stretch">
                            <Flex justify="space-between">
                                <Text>Amount</Text>
                                <Text fontWeight="semibold">NGN {formatNumber(amount)}</Text>
                            </Flex>
                        </VStack>
                    </Box>
                </Box>
            </Flex>
        </Box>
    )
}

export default FundRaiserAccountSetup