import { Box, Button, Typography } from '@mui/material'
import React from 'react'
import CustomTextField from '../theme-elements/CustomTextField'

type PropsType = {
    value: string,
    error: string | null,
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>, fieldName: string) => void,
    disabled: boolean,
    handleSubmit: (event: React.FormEvent<HTMLFormElement>, save: 0 | 1) => void,
}

const PromptArea = ({ value, error, handleChange, disabled, handleSubmit }: PropsType) => {
    return (
        <Box mt="25px">
            {/* <Typography
                variant="subtitle1"
                fontWeight={600}
                component="label"
                htmlFor="Description"
                mb="5px"
            >
                Prompt area *
            </Typography> */}
            <CustomTextField
                label="Prompt"
                disabled={disabled}
                required
                name="description"
                variant="outlined"
                multiline
                rows={400 * 0.047}
                fullWidth
                value={value}
                onChange={handleChange}
                error={error}
                helperText={error}
            />
            <Box width={"100%"} mt="25px" display={"flex"} flexDirection={"row"} justifyContent={"center"} >
                <Button
                    onClick={(e) => handleSubmit(e, 0)}
                    disabled={disabled}
                    style={{
                        textAlign: "center",
                        margin: "0 auto"
                    }}
                    color="primary"
                    variant="contained"
                    size="large"
                // fullWidth
                // href="/"
                // type="submit"
                >
                    Save
                </Button>
            </Box>
        </Box>
    )
}

export default PromptArea
