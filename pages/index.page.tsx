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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea'
import VerticalLayoutTextboxSearch from '../@components/layout/VerticalLayoutTextboxSearch'

const TextBoxSearch: NextPage = ({}) => {

  // Looped execution
  //const [search, setSearch] = useState(textSearch)

  /*function handleDeleteText(): void {
    setSearch("")
  }*/

  return (

    <VerticalLayoutTextboxSearch sx={{ width: "60%" }}>

      <Box justifyContent="space-evenly" sx={{ display: "flex", marginTop: 10  }}>
      
        <Card sx={{ maxWidth: 345, width: 345}}>
          <CardActionArea>
            <CardMedia
              component="img"
              height="200"
              image="/static/drogba_tity_1.jpg"
              alt="nueva liga"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Nueva Liga
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card sx={{ maxWidth: 345 }}>
          <CardActionArea>
            <CardMedia
              component="img"
              height="200"
              image="/static/floren_1.png"
              alt="todas nuestras ligas"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Todas nuestras Ligas
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
      

    </VerticalLayoutTextboxSearch>
  )
}

export default TextBoxSearch
