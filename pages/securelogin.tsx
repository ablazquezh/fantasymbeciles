// pages/index.tsx
'use client'

import { useState } from 'react'
import Cookies from 'js-cookie'
import VerticalLayoutTextboxSearch from '../@components/layout/VerticalLayoutTextboxSearch'
import { Box, Button, Paper, TextField, Typography } from '@mui/material'

export default function Home() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const verify = async () => {
    const res = await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      window.location.href = '/'
    } else {
      const data = await res.json()
      setError(data.error)
    }
  }

  return (
    <Box sx={{ margin: "auto", width: "20%", display: "flex", flexDirection: "column", mt: "10%"}}>
      <Paper sx={{padding: 2, display: "flex", flexDirection: "column" }}>
        <TextField
          label="Uno di noi?"
          variant="outlined"
          fullWidth
          value={code}
          onChange={(e) => setCode(e.target.value)}
          margin="normal"
        />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={verify} variant="contained" sx={{width: "50%", mt: 2}}>
            Acceder
          </Button>
        </Box>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </Paper>
    </Box>
  )
}
