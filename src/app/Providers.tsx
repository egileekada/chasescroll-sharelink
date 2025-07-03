'use client';
import React, { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import THEME from '../../theme';
import { ChakraProvider } from '@chakra-ui/react';

const queryClient = new QueryClient();

function Providers({ children }: PropsWithChildren) {
    return (
        <div>
            <QueryClientProvider client={queryClient}>
                <ChakraProvider value={THEME}>
                    {children}
                </ChakraProvider>
            </QueryClientProvider>
        </div>
    )
}

export default Providers
