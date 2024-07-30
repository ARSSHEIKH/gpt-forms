import { Box, Button, Typography } from '@mui/material'
import Link from 'next/link'
import React from 'react'

const ListHeader = ({ heading, title }: { heading: string, title?: string }) => {
    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <div>
                <h1>{heading}</h1>
                <p>{title}</p>
            </div>
            <Button
            
                LinkComponent={Link}
                href='/forms/create'
                style={{
                    float: 'right',
                    marginTop: '10px'
                }}>
                Add New
            </Button>
        </div>
    )
}

export default ListHeader