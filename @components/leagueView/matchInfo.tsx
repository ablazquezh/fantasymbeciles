import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, Divider, Paper, Button } from "@mui/material";
import MatchCard from '@/@components/primitive/leagueView/MatchCard';
import { MatchInfo } from '../types/MatchInfo';
import { TeamWithPlayers } from '../types/TeamWithPlayers';
import { ParticipantsFull } from '../types/ParticipantsFull';
import groupPlayerData from '../utils/groupPlayerData';
import getRowColor from '../utils/getRowColor';
import { RowData } from '../types/RowData';

interface MatchInfoDashboardProps {
    matchInfo: MatchInfo; 
    completeLeagueTeams: ParticipantsFull[];
    game: string;
}

const globalColnames = {
    nickname: "Jugador",
  };

export interface MatchDetailsUpdated {
    team: string;
    goals: any[]; // You can replace 'any' with a more specific type if needed, like 'number[]' for goals.
    cards: any[]; // Same as goals, replace 'any' with a more specific type if necessary.
    groupedPlayers: {
        [key: string]: RowData[];
    };
}

export interface MatchInfoUpdated {
    local: MatchDetailsUpdated;
    visitor: MatchDetailsUpdated;
    played: boolean;
}

 
const MatchInfoDashboard: React.FC<MatchInfoDashboardProps> = ({matchInfo, completeLeagueTeams, game}) => {

    const [participantData, setParticipantData] = useState<MatchInfoUpdated>()
    
    useEffect(() => {
        
        const updated: MatchInfoUpdated = {
            local: {
              ...matchInfo.local,
              groupedPlayers: completeLeagueTeams.find(item => item.team_name === matchInfo.local.team)?.groupedPlayers ?? {} 
            },
            visitor: {
              ...matchInfo.visitor,
              groupedPlayers: completeLeagueTeams.find(item => item.team_name === matchInfo.visitor.team)?.groupedPlayers ?? {}
            },
            played: matchInfo.played
          };

        setParticipantData(updated)

    }, [completeLeagueTeams, matchInfo]);


  return (
    <Paper className="parent" sx={{ padding: 4, marginTop: 10, display: "flex", flexDirection: "row", flexWrap: "wrap", mb: 10}}>

        <MatchCard matchInfo={matchInfo} game={game!} handleMatchClick={null} ></ MatchCard>
        <Box sx={{width: "100%", display: "flex", alignContent: "center", justifyContent: "center"}}>

            <Box sx={{mr: "40%", mt: "2%"}}>
                <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", maxWidth: "310px", minWidth: "310px", overflowY: "auto" }} >
    
                    <Table stickyHeader>
                    <TableBody sx={{backgroundColor: '#fafafa'}}>
    
                    {participantData && Object.keys(participantData.local.groupedPlayers).map((category) => (
                        <React.Fragment key={category}>
                            {/* Render category header */}
                            <TableRow>
                            <TableCell colSpan={3} style={{ fontWeight: "bold", backgroundColor: "#f1f1f1" }}>
                                {category}
                            </TableCell>
                            </TableRow>
            
                            {/* Render rows for this category */}
                            {participantData?.local.groupedPlayers[category].map((row, index) => (
                                                
                                <TableRow sx={{ bgcolor: getRowColor(row.global_position), position:"relative"}} >
                            
                                    { Object.keys(globalColnames).map((col) => (
    
                                        <TableCell key={col} >
                                            {row[col as keyof typeof globalColnames] !== null &&
                                            row[col as keyof typeof globalColnames] !== undefined ? (
                                                row[col as keyof typeof globalColnames]
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

            <Box sx={{mt: "2%"}}>
                <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", maxWidth: "310px", minWidth: "310px", overflowY: "auto", }} >
    
                    <Table stickyHeader>
                    <TableBody sx={{backgroundColor: '#fafafa'}}>
    
                    {participantData && Object.keys(participantData.visitor.groupedPlayers).map((category) => (
                        <React.Fragment key={category}>
                            {/* Render category header */}
                            <TableRow>
                            <TableCell colSpan={3} style={{ fontWeight: "bold", backgroundColor: "#f1f1f1" }}>
                                {category}
                            </TableCell>
                            </TableRow>
            
                            {/* Render rows for this category */}
                            {participantData?.visitor.groupedPlayers[category].map((row, index) => (
                                                
                                <TableRow sx={{ bgcolor: getRowColor(row.global_position), position:"relative"}} >
                            
                                    { Object.keys(globalColnames).map((col) => (
    
                                        <TableCell key={col} >
                                            {row[col as keyof typeof globalColnames] !== null &&
                                            row[col as keyof typeof globalColnames] !== undefined ? (
                                                row[col as keyof typeof globalColnames]
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
                
        </Box>
                       
    </ Paper>
  )
}
  
export default MatchInfoDashboard