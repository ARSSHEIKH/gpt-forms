import { Box, Grid, IconButton, Stack, TextField, Typography } from '@mui/material'
import React from 'react'
import Header from './Header'
import CustomTextField from './theme-elements/CustomTextField'
import { IFormFields } from '@/app/types/interfaces'
import PromptArea from './PromptArea'
import ChatContainer from './ChatContainer'
import SimpleTable from '../Tables/SimpleTable'
import { tableRowDataType } from '@/app/types/types';

type ErrorType = {
    title: string;
    description: string;
    heading: string;
}
type PropsType = {
    formData: IFormFields,
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>, fieldName: string) => void,
    errors: ErrorType,
    handleSubmit: (event: React.FormEvent<HTMLFormElement>, save: 0 | 1) => void,
    loading: boolean,
    title: string,
    formSubmited: boolean,
    setTableData: React.Dispatch<React.SetStateAction<tableRowDataType[]>>,
    disabledField: boolean,
    chatReset: boolean,
    setFormSubmited: React.Dispatch<React.SetStateAction<boolean>>,

}

const CustomForm = ({
    formData,
    handleInputChange,
    errors,
    formSubmited,
    title,
    setTableData,
    disabledField,
    chatReset,
    setFormSubmited,
    handleSubmit
}: PropsType) => {

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Header title={title} />
                <Stack>
                    <Box mt="25px">
                        {/* <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            component="label"
                            htmlFor="Heading"
                            mb="5px"
                        >
                            Heading *
                        </Typography> */}
                        <CustomTextField
                            label='Heading'
                            disabled={disabledField}
                            required
                            name="heading"
                            variant="outlined"
                            fullWidth
                            value={formData.heading}
                            onChange={handleInputChange}
                            error={errors?.heading}
                            helperText={errors?.heading}
                        />

                    </Box>

                    <Box mt="25px">

                        {/* <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            component="label"
                            htmlFor="title"
                            mb="5px"
                        >
                            Title *
                        </Typography> */}
                        <CustomTextField
                            label='Title'
                            disabled={disabledField}
                            required
                            name="title"
                            variant="outlined"
                            fullWidth
                            value={formData.title}
                            onChange={handleInputChange}
                            error={errors?.title}
                            helperText={errors?.title}

                        />
                    </Box>
                </Stack>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} >


                        <PromptArea
                            disabled={disabledField}
                            handleChange={handleInputChange}
                            error={errors.description}
                            value={formData.description}
                            handleSubmit={handleSubmit}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div style={{ flex: 1, marginTop: 25 }}>
                            <ChatContainer
                                setTableData={setTableData}
                                formSubmited={formSubmited}
                                chatReset={chatReset}
                                setFormSubmited={setFormSubmited}
                            />
                        </div>
                    </Grid>
                </Grid>
            </Grid>


            {/* <div style={{ marginTop: 20, width: "100%" }}>
                <SimpleTable />
            </div> */}

        </Grid>
    )
}

export default CustomForm
