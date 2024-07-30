import { Box, Button, Grid, Typography } from '@mui/material'
import Link from 'next/link'
import React from 'react'
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

const ListHeader = ({ heading, title, redirectTo }: { heading: string, title?: string, redirectTo: string }) => {
    return (
        <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
                <Typography variant="h3" component="h3" gutterBottom>
                    {heading}
                </Typography>
            </Grid>
            <Grid item>
                <Button

                    LinkComponent={Link}
                    href={redirectTo}
                    sx={{ mt: { xs: 2, md: 0 } }}
                    variant="contained"
                    startIcon={<AddTwoToneIcon fontSize="small" />}
                >
                    Add New
                </Button>
            </Grid>
        </Grid>
    )
}

export default ListHeader
