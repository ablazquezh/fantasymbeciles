import { Card as MuiCard, type CardProps } from '@mui/material'
import React from 'react'

export default function Card({ sx, ...props }: CardProps): React.ReactElement {
  return (
    <MuiCard sx={{ display: 'inline-block', ...sx }} elevation={6} {...props} />
  )
}
