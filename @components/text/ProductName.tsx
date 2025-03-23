import React from 'react'
import { type TypographyProps, Typography } from '@mui/material'

export default function ProductName(props: TypographyProps): React.ReactElement {
  return <Typography variant={'body1'} sx={{ margin: 'auto' }} {...props} />
}
