import React from 'react'
import { type TypographyProps, Typography } from '@mui/material'

export default function ProductPrice(props: TypographyProps): React.ReactElement {
  return <Typography variant={'h5'} sx={{ fontWeight: 'bold' }} {...props} />
}
