import React, { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, TablePagination, Paper, Button } from "@mui/material";
import { GetServerSidePropsContext, NextPage } from 'next';


interface PlayerSelectProps {
}


const LeaguePage: NextPage<PlayerSelectProps> = ({}) => {
  
  const router = useRouter();
  const { leagueId } = router.query;

  return (
    <Box sx={{
      margin: "auto",
      width: "60%",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }}>

      {leagueId}
      
    </ Box>
  )
}
  
  export default LeaguePage