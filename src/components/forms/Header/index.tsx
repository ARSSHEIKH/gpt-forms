import { Box, Button, Typography } from '@mui/material'
import React from 'react'

const Header = ({title}:{title: string}) => {
    return (
        <Box width={"100%"} display={"flex"} flexDirection={"row"} justifyContent={"space-between "} >
            <Typography
                variant="h4"
                // mb="5px"
            >
                {title}
            </Typography>
            {/* <Button
                onClick={(e) => handleSubmit(e, 1)}
                style={{
                    float: 'right',
                    marginTop: '10px'
                }}>
                Save
            </Button> */}
        </Box>
    )
}

export default Header