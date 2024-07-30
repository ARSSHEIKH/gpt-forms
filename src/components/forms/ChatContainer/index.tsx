"use client"
import { Box, Button, CircularProgress, Grid, IconButton, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import ChatBox from './ChatBox'
import updateForm from '@/services/updateForm';
import Cookies from 'js-cookie';
import { tableRowDataType } from '@/types/types';
import LinkIcon from '@mui/icons-material/Link';

const ChatContainer = ({ formSubmited, setTableData, chatReset, setFormSubmited }: {
    formSubmited: boolean,
    setTableData: React.Dispatch<React.SetStateAction<tableRowDataType[]>>,
    chatReset: boolean,
    setFormSubmited: React.Dispatch<React.SetStateAction<boolean>>,
}) => {
    const [loading, setLoading] = React.useState(false)
    const [generatedLink, setGeneratedLink] = React.useState(null)

    const promptId: any = Cookies.get("promptId");
    const handleSubmit = async () => {
        setLoading(true);
        const response = await updateForm({ save: 1 }, promptId);
        setFormSubmited(true);
        setTableData(response.data?.tableData)
        setLoading(false)

    }
    const onCopy = async () => {
        // copy a link to clipboard
        generatedLink && await navigator.clipboard.writeText(generatedLink)
    }
    return (
        <Box>
            <div style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    Preview
                </Typography>

                {generatedLink && <IconButton onClick={onCopy}>
                    <LinkIcon />
                </IconButton>}
            </div>
            <Box bgcolor={"#f3f3f3"} width={"100%"} height={450}>

                {chatReset && <ChatBox formSubmited={formSubmited} setFormSubmited={setFormSubmited} setGeneratedLink={setGeneratedLink} />}


            </Box>
            <Box sx={{
                // display: formSubmited ? "flex" : "none"
            }} width={"100%"}
                mt="25px"
                display={"flex"} flexDirection={"row"} justifyContent={"center"} >
                {/* <LoadingButton
                    disabled={formSubmited}
                    loading={loading}
                    onClick={handleSubmit}
                    style={{
                        textAlign: "center",
                        margin: "0 auto"
                    }}
                    color="primary"
                    variant="contained"
                    size="large"
                >
                    Submit
                </LoadingButton> */}
            </Box>
        </Box>
    )
}

export default ChatContainer
