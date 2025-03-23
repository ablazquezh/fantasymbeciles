import React from 'react'
import { type TypographyProps, Typography } from '@mui/material'

export default function Title(props: TypographyProps): React.ReactElement {
  return <Typography variant={'h5'} {...props} />
}
