'use client';
import httpService from '@/services/httpService';
import { URLS } from '@/services/urls';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

function Fundraiser({ id }: { id: string }) {
    const { isLoading, data, isError, error } = useQuery({
        queryKey: [`get-external-fundraiser-by-id-${id}`],
        queryFn: () => httpService.get(`${URLS.fundraiser}/search`, {
            params: {
                id
            }
        })
    })
    return (
        <div>

        </div>
    )
}

export default Fundraiser
