import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Modal,
  Button,
  Typography,
} from "@mui/material";
import { leagues } from '@prisma/client';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { useRouter } from "next/router";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import modalStyle from '../types/ModalStyle';

interface LeagueSelectProps {
    leagues: leagues[];
  }

const LoadLeagueStep: React.FC<LeagueSelectProps> = ({ leagues }) => {
  const router = useRouter();

  const [leagueRows, setLeagueRows] = useState(leagues);
  
  const [openModal, setOpenModal] = useState(false);
  const [deleteInModal, setDeleteInModal] = useState(-1);

  const handleCloseModal = () => {
    setOpenModal(false); 
    setDeleteInModal(-1)
  };

  const handleClickOpen = (leagueId: number) => {
    setOpenModal(true); 
    setDeleteInModal(leagueId)
  };

  const handleClick = (leagueId: number) => {
    router.push(`/league?leagueId=${String(leagueId)}`);
  };

  const handleRemove = () => {
    
    const removeLeague = async () => {

      try {
        const response = await fetch("/api/removeleague", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leagueId: deleteInModal }),
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
    setLeagueRows(prevList => prevList.filter(item => item.ID !== deleteInModal));
    setOpenModal(false); 
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
                                  onClick={() => handleClickOpen(row.ID)} // Trigger function on click
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

      <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={modalStyle}>
            <Typography variant="h5">¿Estás seguro?</Typography>
            <Box sx={{display: "flex", p:0, gap: 2}}>
              <Button variant="contained" 
                onClick={() => handleRemove()} sx={{ backgroundColor:"red", color:"white",
                                                width: 150, mt: 2, ml: "auto", padding: 1, '&:hover': {
                                          backgroundColor: "brown", // Change to a lighter green on hover
                                      } }}>
                  Borrar
              </Button>
              <Button variant="contained" color="primary"
                onClick={handleCloseModal} sx={{ width: 150, mt: 2, padding: 0 }}>
                  Cancelar
              </Button>
            </Box>
          </Box>
        </Modal>
    </Paper>
  );
};

export default LoadLeagueStep;
