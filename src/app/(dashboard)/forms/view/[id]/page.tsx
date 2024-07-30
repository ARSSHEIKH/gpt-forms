"use client"
import { useParams } from 'next/navigation'
import React from 'react'
import cookie from 'js-cookie';
import { getView } from '@/services/view';
import dynamic from 'next/dynamic';
import useSWR from 'swr'
// import { FullPageLoader } from '@/(DashboardLayout)/loading';
import { IDataFields } from '@/types/interfaces';
import FormCreate from '../../create/page';
// const FormCreate = dynamic(() => import('../../create/page'), {
//     ssr: false, // Disable server-side rendering for this component
//   });

interface PageProps {
    data: IDataFields | undefined;
    status: number;
    error?: any;
}

const fetcher = (token: string | undefined, id: string | undefined) => getView(token, id);

const Page = () => {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const token = cookie.get("token");
    const { data, error, isLoading } = useSWR<PageProps>(id ? `/api/forms/view/${id}` : null, () => fetcher(token, id));
    console.log("data", data)

    return (

        // isLoading ?
        //     <FullPageLoader />
        //     :
        <FormCreate
            data={data?.data}
        />

    )
}

export default Page
