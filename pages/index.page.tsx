import React, { useState } from 'react'
import type { GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from 'next'

import { TextField} from '@mui/material'
// import VerticalLayout from '../@components/layout/VerticalLayout'
// import Row from '../@components/layout/Row'
import Button from '@mui/material/Button'
import SendIcon from '@mui/icons-material/Send'
import DeleteIcon from '@mui/icons-material/Delete';
import Link from 'next/link'
import Box from '@mui/material/Box';
import VerticalLayoutTextboxSearch from '../@components/layout/VerticalLayoutTextboxSearch'


const TextBoxSearch: NextPage = ({}) => {

  // Looped execution
  //const [search, setSearch] = useState(textSearch)

  /*function handleDeleteText(): void {
    setSearch("")
  }*/

  return (

    <VerticalLayoutTextboxSearch sx={{ width: "60%" }}>

      <Box sx={{ display: "flex", alignItems: "end", marginTop: 4 }}>

        <Button sx={{ marginLeft: "auto" }}
                color="primary" startIcon={<DeleteIcon />}>
          Borrar texto
        </Button>
        

      </Box>

      

    </VerticalLayoutTextboxSearch>
  )
}

export default TextBoxSearch
