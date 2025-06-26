'use client';
import httpService from '@/services/httpService';
import { URLS } from '@/services/urls';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

function Rental({ userId }: { userId: string }) {
    const { isLoading, data, isError, error } = useQuery({
        queryKey: [`get-external-rentals-${userId}`],
        queryFn: () => httpService.get(`${URLS.rental}/search`, {
            params: {
                userId
            }
        })
    })
    return (
        <div>

        </div>
    )
}

export default Rental
