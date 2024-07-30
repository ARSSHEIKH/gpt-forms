import React from 'react'
import { Button, CircularProgress } from '@mui/material'

const LoadingButton = ({
    size
}
    :
    {
        size: number
    }
) => {
    return (
        <Button disabled fullWidth variant='contained'>
            <CircularProgress color='inherit' size={size} />
        </Button>
    )
}

export default LoadingButton;
