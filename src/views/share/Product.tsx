'use client';
import httpService from '@/services/httpService';
import { URLS } from '@/services/urls';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

function Product({ id }: { id: string }) {
    const { isLoading, data, isError, error } = useQuery({
        queryKey: [`get-external-product-single-${id}`],
        queryFn: () => httpService.get(`${URLS.product}/search`, {
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

export default Product
