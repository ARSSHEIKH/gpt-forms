"use client"
import React from 'react'
import { Button } from '@mui/material'
import Link from 'next/link'
import cookie from 'js-cookie';
import { IDataFields } from '@/types/interfaces'
import { deleteCall } from '@/services/delete'
// import { FullPageLoader } from '../loading'
// import DataGrid from '../components/Tables/DataGrid'
// import ListHeader from '../components/forms/Header/ListHeader';
// import FormListTable from '@/pages/FormListTable'
import Cookies from 'js-cookie'
import { fetchApi } from '@/services/get';
import DataGrid from '@/components/tables/DataGrid';
import ListHeader from '@/components/headers/ListHeader';

export default function Page() {
    const token = Cookies.get("token");
    const [tableRow, setTableRow] = React.useState<IDataFields[]>([])
    const [loading, setLoading] = React.useState(false)


    React.useEffect(() => {
        setLoading(true)
        token && fetchList()
    }, [token])


    const fetchList = async () => {
        const response = await fetchApi(token);
        const data = response?.data
        console.log("data", data)
        setLoading(false)
        setTableRow(data)
    };
    const handleDelete = async (selected: readonly string[]) => {
        setLoading(true)
        await deleteCall(token, selected)
        await fetchList()
    }

    return (
        <div>
            <ListHeader
                heading='Forms'
                title='Here you will find your gpt forms'
                redirectTo="/forms/create"
            />
            <div style={{ width: "100%" }}>
                {/* {loading && <FullPageLoader />} */}
                <DataGrid
                    handleDelete={handleDelete}
                    rows={tableRow}
                />
                {/* <FormListTable
                    listData={tableRow}
                /> */}
            </div>
        </div>
    )
};
