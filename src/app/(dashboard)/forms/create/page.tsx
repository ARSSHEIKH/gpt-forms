'use client'

import { formSubmit } from '@/services/posts'
import { LoadingButton } from '@mui/lab'
import { Card, CardContent, CardHeader, Container } from '@mui/material'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { IDataFields, IFormFields } from '@/types/interfaces';
import updateForm from '@/services/updateForm'
import { tableRowDataType } from '@/types/types'
import CustomForm from '@/components/forms/Form'
import CustomToast from '@/components/CustomToast'
import { ToastState } from '@/views/Login'

type ErrorType = {
    title: string;
    description: string;
    heading: string;
}
interface PageProps {
    data: IDataFields | undefined;
}

type PagePropsWithoutDefault = Omit<PageProps, "default">; // Remove only "default"

type postDataType = IFormFields & { save: 0 | 1 }


const FormCreate = ({ data }: any) => {

    const router = useRouter();
    // const state = 
    const [loading, setLoading] = useState(false)

    const [formSubmited, setFormSubmited] = useState(data?.save ? true : false);
    const [tableData, setTableData] = useState<tableRowDataType[]>([]);
    const [chatReset, setChatReset] = useState(data?.id ? true : false);

    const [toast, setToast] = React.useState<ToastState>({
        show: false,
        message: '',
        type: 'info',
    });
    const [formData, setFormData] = useState<IFormFields>({
        title: data?.title || '',
        description: data?.description || '',
        heading: data?.heading || '',
    });


    const [errors, setErrors] = useState<ErrorType>({
        title: '',
        description: '',
        heading: '',
    })
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value })
    };

    const validateValues = () => {

        let isValid = true;
        if (!formData.title) {
            isValid = false;
        }
        if (!formData.description) {
            isValid = false;
        }
        if (!formData.heading) {
            isValid = false;
        }
        return isValid;
    };

    const applyValidations = () => {

        let error = { ...errors };
        error.title = formData.title.length < 5 ? 'Title must be at least 5 characters long' : ''
        error.description = formData.description.length < 10 ? 'Description must be at least 10 characters long' : ''
        error.heading = formData.heading.length < 5 ? 'Heading must be at least 5 characters long' : ''
        setErrors(error)
    }


    const onSend = async (values: postDataType) => {
        const id: string = data?.id || history.state.query?.promptId
        return id ? await updateForm(values, id) : await formSubmit(values);
    }

    const clearChats = () => {
        setTableData([]);
        setChatReset(false);

    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, save: 0 | 1) => {

        clearChats()

        event.preventDefault();
        setErrors({
            title: '',
            description: '',
            heading: '',
        })

        setLoading(true)
        const isValid = validateValues()

        if (!isValid) {
            applyValidations()
            setLoading(false)
            return
        }
        const response = await onSend({ ...formData, save })
        if (response?.status == 200) {

            setChatReset(true);
            setToast({
                show: true,
                message: response?.message,
                type: 'success',
            })
            if (!data?.id || !history.state.query) {
                const pathname = `/forms/view/${response.data?.promptId}`
                router.push(pathname);
                console.log("response?.data", response?.data)
                history.pushState({ query: response?.data }, "", pathname)
            }
        }
        else {
            setToast({
                show: true,
                message: 'Failed to submit form. Please try again later.',
                type: 'error',
            })

        }
        setLoading(false)
    };
    return (
        <Card>
            <CardHeader title='Create a form' />
            <CardContent>
                <form onSubmit={(e) => handleSubmit(e, 0)}>
                    {/* {loading && <FullPageLoader />} */}
                    <CustomForm
                        title=""
                        formData={formData}
                        errors={errors}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        loading={loading}
                        formSubmited={formSubmited}
                        setTableData={setTableData}
                        setFormSubmited={setFormSubmited}
                        disabledField={data?.id ? true : false}
                        chatReset={chatReset}
                    />
                    {
                        formSubmited &&
                        <div style={{ marginTop: 20 }}>
                            {/* <ProductPerformance
                            tableData={tableData}
                            setTableData={setTableData}
                            formSubmited={formSubmited}
                        /> */}
                        </div>

                    }

                    <CustomToast toast={toast} setToast={setToast} />
                </form>
            </CardContent>
        </Card>
    )

}

export default FormCreate
