import React from 'react'
import { type TypographyProps, Typography } from '@mui/material'

export default function Caption(props: TypographyProps): React.ReactElement {
  return <Typography variant={'subtitle1'} color={'grey'} {...props} />
}
