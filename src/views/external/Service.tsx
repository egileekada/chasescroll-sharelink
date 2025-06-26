'use client';
import httpService from '@/services/httpService';
import { URLS } from '@/services/urls';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

function Service({ userId }: { userId: string }) {
    const { isLoading, data, isError, error } = useQuery({
        queryKey: [`get-external-service-${userId}`],
        queryFn: () => httpService.get(`${URLS.service}/search`, {
            params: {
                vendorID: userId
            }
        })
    })
    return (
        <div>

        </div>
    )
}

export default Service
