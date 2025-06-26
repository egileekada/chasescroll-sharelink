'use client';
import httpService from '@/services/httpService';
import { URLS } from '@/services/urls';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

function Fundraiser({ userId }: { userId: string }) {
    const { isLoading, data, isError, error } = useQuery({
        queryKey: [`get-external-fundraiser-${userId}`],
        queryFn: () => httpService.get(`${URLS.fundraiser}/search`, {
            params: {
                creatorID: userId
            }
        })
    })
    return (
        <div>

        </div>
    )
}

export default Fundraiser
