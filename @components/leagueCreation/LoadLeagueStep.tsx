import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
} from "@mui/material";
import { leagues } from '@prisma/client';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { useRouter } from "next/router";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

interface LeagueSelectProps {
    leagues: leagues[];
  }

const LoadLeagueStep: React.FC<LeagueSelectProps> = ({ leagues }) => {
  const router = useRouter();

  const [leagueRows, setLeagueRows] = useState(leagues);

  const handleClick = (leagueId: number) => {
    router.push(`/league?leagueId=${String(leagueId)}`);
  };

  const handleRemove = (leagueId: number) => {
    
    const removeLeague = async () => {

      try {
        const response = await fetch("/api/removeleague", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leagueId: leagueId }),
          });
    
        const data = await response.json();
    
        if (response.ok) {
          console.log("Success:", data);
        } else {
          console.error("Error:", data.error);
        }
      } catch (error) {
        console.error("Request failed:", error);
      }
    };
    removeLeague();
    setLeagueRows(prevList => prevList.filter(item => item.ID !== leagueId));
  }

  return (
    <Paper sx={{ paddingTop: 4, paddingBottom: 4, marginTop: 11,  display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

      <Box sx={{marginRight: 6, marginLeft: 6, display: "flex", flexDirection: "column", width:"70%" }}>

        <TableContainer sx={{ minHeight: "550px", maxHeight: "550px", overflowY: "auto" }}>
          <Table stickyHeader>
              <TableHead>
                  <TableRow>
                      {["Nombre", "FIFA", "Fecha"].map((col) => (
                          <TableCell
                              key={col}
                              sx={{
                                  fontWeight: "bold",
                                  textAlign: "center" // Center text in the header
                              }} >
                            {col}
                          </TableCell>
                            
                      ))}
                      {/* Add a column for the "Load" button */}
                      <TableCell></TableCell>
                      {/* Add a column for the "Remove" button */}
                      <TableCell></TableCell>
                  </TableRow>
              </TableHead>
              <TableBody sx={{backgroundColor: '#fafafa'}}>
                  {leagueRows.map((row, index) => (
                      <TableRow key={index} sx={{ backgroundColor: 'white' }} >
                          <TableCell sx={{ textAlign: "center"  }} >
                            {row.league_name}
                          </TableCell >
                          <TableCell sx={{ textAlign: "center"  }} >
                            {row.game?.replace("fifa", "")}
                          </TableCell >
                          <TableCell sx={{ textAlign: "center" }} >
                            { new Date(row.created_at!).toLocaleDateString('en-GB')}
                          </TableCell>
                          
                           {/* Add a cell for the "Add" button */}
                          <TableCell sx={{width:"10%"}}>
                              <IconButton
                                  onClick={() => handleRemove(row.ID)} // Trigger function on click
                                  color="primary"
                                  sx={{
                                      backgroundColor: "darkred", // Set the default color to green
                                      color: "white", // Set the icon color to white
                                      '&:hover': {
                                          backgroundColor: "pink", // Change to a lighter green on hover
                                      },
                                      padding: "0px", // Optional: Adjust button padding if necessary
                                  }}
                              >
                                  <DeleteForeverIcon />
                              </IconButton>
                          </TableCell>

                          {/* Add a cell for the "Add" button */}
                          <TableCell sx={{width:"10%"}}>
                              <IconButton
                                  onClick={() => handleClick(row.ID)} // Trigger function on click
                                  color="primary"
                                  sx={{
                                      backgroundColor: "green", // Set the default color to green
                                      color: "white", // Set the icon color to white
                                      '&:hover': {
                                          backgroundColor: "lightgreen", // Change to a lighter green on hover
                                      },
                                      padding: "0px", // Optional: Adjust button padding if necessary
                                  }}
                              >
                                  <PlayArrowIcon />
                              </IconButton>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
        </TableContainer>

      </Box>
    </Paper>
  );
};

export default LoadLeagueStep;
