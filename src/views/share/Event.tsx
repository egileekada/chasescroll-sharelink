'use client';
import httpService from '@/services/httpService';
import { URLS } from '@/services/urls';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

function Event({ id }: { id: string }) {
    const { isLoading, data, isError, error } = useQuery({
        queryKey: ['get-external-events'],
        queryFn: () => httpService.get(`${URLS.event}/event`, {
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

export default Event
