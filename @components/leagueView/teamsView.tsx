
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, Divider, Paper, Button } from "@mui/material";
import { RowData } from '../types/RowData';
import { ParticipantsFull } from '../types/ParticipantsFull';
import { TeamWithPlayers } from '../types/TeamWithPlayers';
import groupPlayerData from '../utils/groupPlayerData';
import getRowColor from '../utils/getRowColor';

interface TeamsViewProps {
  participantData: ParticipantsFull[]; 
  game: string| null; 
}

const globalColnames = {
    nickname: "Jugador",
    average: "Pt. Global",
    positions: "Posiciones",
  };


const TeamsView: React.FC<TeamsViewProps> = ({participantData, game}) => {

    return (
    <Paper
    sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${participantData.length}, 1fr)`, // Distribuye uniformemente
        justifyItems: "center",
        alignItems: "stretch",
        gap: 2, // Espaciado entre imágenes
        width: "100%", // Usa todo el ancho disponible
        padding: 2,
        mt: 10
    }} >
    
    {participantData.map((participant, pindex) => (
        <Box key={pindex}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',}}>
                <img
                key={pindex}
                src={`/static/teams/${game}/${String(participant["team_name"]).replace("/", "_")}.png`} // Ruta basada en team_name
                alt={participant.team_name}
                style={{
                    width: "100%", // Ocupa todo el espacio disponible en su celda
                    maxWidth: "45px", // Evita que sean demasiado grandes
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: "8px",
                    padding: "5px",
                    boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
                    marginRight: "auto"
                }}
                />
                <Typography gutterBottom variant="body1" component="div" sx={{margin: "auto"}}>
                    N. jugadores: {participant.players.length}
                </Typography>
            </div>

            <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", maxWidth: "310px", minWidth: "310px", overflowY: "auto" }} >

                <Table stickyHeader>
                <TableBody sx={{backgroundColor: '#fafafa'}}>

                    {Object.keys(participant.groupedPlayers).map((category) => (
                    <React.Fragment key={category}>
                        {/* Render category header */}
                        <TableRow>
                        <TableCell colSpan={3} style={{ fontWeight: "bold", backgroundColor: "#f1f1f1" }}>
                            {category}
                        </TableCell>
                        </TableRow>
        
                        {/* Render rows for this category */}
                        {participant.groupedPlayers[category].map((row, index) => (
                                            
                            <TableRow sx={{ bgcolor: getRowColor(row.global_position), position:"relative"}} >
                        
                                { Object.keys(globalColnames).map((col) => (

                                    <TableCell key={col} >
                                        {row[col as keyof typeof globalColnames] !== null &&
                                        row[col as keyof typeof globalColnames] !== undefined ? (
                                            Array.isArray(row[col as keyof typeof globalColnames]) ? (
                                            (row[col as keyof typeof globalColnames] as string[]).map((item, index) => (
                                                <Chip key={index} label={item} sx={{ margin: "2px" }} />
                                            ))
                                            ) : (
                                            row[col as keyof typeof globalColnames]
                                            )
                                        ) : (
                                            "-"
                                        )}
                                    </ TableCell>

                                ))}
                                        
                            </TableRow>
                                    
                        ))}
                    </React.Fragment>
                    ))}
                    
                </TableBody>
                
                </Table>

            </TableContainer>
            
        </Box>
                    
    ))}
    </Paper>
    )
}

export default TeamsView