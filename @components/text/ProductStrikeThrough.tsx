import React from 'react'
import { type TypographyProps, Typography } from '@mui/material'

export default function ProductStrikeTrough(props: TypographyProps): React.ReactElement {
  return <Typography variant={'subtitle1'} sx={{ textDecoration: "line-through", color: "#a9a8a8", marginRight: 1 }} {...props} />
}
