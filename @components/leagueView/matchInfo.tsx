import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,  ListItem,  ListItemText,  Box, Typography, Chip, Divider, Paper, Button } from "@mui/material";
import MatchCard from '@/@components/primitive/leagueView/MatchCard';
import { MatchInfo } from '../types/MatchInfo';
import { TeamWithPlayers } from '../types/TeamWithPlayers';
import { ParticipantsFull } from '../types/ParticipantsFull';
import groupPlayerData from '../utils/groupPlayerData';
import getRowColor from '../utils/getRowColor';
import { RowData } from '../types/RowData';
import Checkbox from '@mui/material/Checkbox';

interface MatchInfoDashboardProps {
    matchInfo: MatchInfo; 
    completeLeagueTeams: ParticipantsFull[];
    game: string;
}

const globalColnames = {
    nickname: "Jugador",
  };

interface MatchDetailsUpdated {
    team: string;
    goals: any[]; // You can replace 'any' with a more specific type if needed, like 'number[]' for goals.
    cards: any[]; // Same as goals, replace 'any' with a more specific type if necessary.
    groupedPlayers: {
        [key: string]: RowData[];
    };
    players: RowData[]
}

interface MatchInfoUpdated {
    local: MatchDetailsUpdated;
    visitor: MatchDetailsUpdated;
    played: boolean;
}

interface PlayerStats {
    goals: number;
    ycard: boolean;
    rcard: boolean;
  }
  
  interface MatchStats {
    [nickname: string]: PlayerStats;
  }

const MatchInfoDashboard: React.FC<MatchInfoDashboardProps> = ({matchInfo, completeLeagueTeams, game}) => {

    const [participantData, setParticipantData] = useState<MatchInfoUpdated>()
    const [matchStats, setMatchStats] = useState<MatchStats>()

    useEffect(() => {
        
        const updated: MatchInfoUpdated = {
            local: {
              ...matchInfo.local,
              groupedPlayers: completeLeagueTeams.find(item => item.team_name === matchInfo.local.team)?.groupedPlayers ?? {},
              players: completeLeagueTeams.find(item => item.team_name === matchInfo.local.team)?.players ?? []
            },
            visitor: {
              ...matchInfo.visitor,
              groupedPlayers: completeLeagueTeams.find(item => item.team_name === matchInfo.visitor.team)?.groupedPlayers ?? {},
              players: completeLeagueTeams.find(item => item.team_name === matchInfo.visitor.team)?.players ?? []
            },
            played: matchInfo.played
          };

        setParticipantData(updated)

    }, [completeLeagueTeams, matchInfo]);


    useEffect(() => {

        if(!participantData) return;
        
        const transformTeam = (teamData: MatchDetailsUpdated) => {
            return teamData.players.reduce((acc, player) => {
                acc[player.nickname!] = {
                  goals: 0,
                  ycard: false,
                  rcard: false,
                };
                return acc;
              }, {} as Record<string, { goals: number; ycard: boolean; rcard: boolean }>);
        }

        const item = {...transformTeam(participantData!.local), ...transformTeam(participantData!.visitor)}

        setMatchStats(item)
    }, [participantData]);
    

    const handleGoalsChange = (value: string, playerName: string) => {
    
      // Check if the value is a valid number and greater than or equal to 0
      if (value === '' || Number(value) >= 0) {
        setMatchStats((prev) => ({
            ...prev,
            [playerName]: {
              ...prev![playerName],
              goals: Number(value),
            },
          })
        );
      }
    };

    const handleYCardChange = (value: boolean, playerName: string) => {
        
        setMatchStats((prev) => ({
            ...prev,
            [playerName]: {
                ...prev![playerName],
                ycard: value,
            },
            })
        );
             
    };

    const handleRCardChange = (value: boolean, playerName: string) => {
        
        setMatchStats((prev) => ({
            ...prev,
            [playerName]: {
                ...prev![playerName],
                rcard: value,
            },
            })
        );
             
    };


  return (
    <Paper className="parent" sx={{ padding: 4, marginTop: 10, display: "flex", flexDirection: "row", flexWrap: "wrap", mb: 10}}>

        <MatchCard matchInfo={matchInfo} game={game!} handleMatchClick={null} ></ MatchCard>
        <Box sx={{width: "100%", display: "flex", alignContent: "center", justifyContent: "center"}}>

            <Box sx={{mr: "30%", mt: "2%", width: "30%"}}>
                <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", maxWidth: "100%", minWidth: "100%", overflowY: "auto" }} >
    
                    <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {["Jugador", "Goles", "T.Am.", "T.R."].map((col) => (
                                <TableCell
                                    key={col}
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: "center" // Center text in the header
                                    }}
                                >
                                    {col}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody sx={{backgroundColor: '#fafafa'}}>
    
                    {participantData && matchStats && Object.keys(participantData.local.groupedPlayers).map((category) => (
                        <React.Fragment key={category}>
                            {/* Render category header 
                            <TableRow>
                            <TableCell colSpan={4} style={{ fontWeight: "bold", backgroundColor: "#f1f1f1" }}>
                                {category}
                            </TableCell>
                            </TableRow>*/}
            
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

                                    <TableCell sx={{ textAlign: "center"}} >
                                        
                                        <TextField
                                            type="number"
                                            value={matchStats[row.nickname!].goals}
                                            onChange={(e) => handleGoalsChange(e.target.value, row.nickname!)}
                                            inputProps={{ min: 0 }}
                                            variant="outlined"
                                            InputProps={{
                                                sx: {
                                                    backgroundColor: 'white', 
                                                    height: 40,
                                                    width: 80
                                                }
                                            }}
                                        />

                                    </TableCell>

                                    <TableCell >

                                        <Checkbox
                                            checked={matchStats[row.nickname!].ycard}
                                            onChange={(e) => handleYCardChange(e.target.checked, row.nickname!)}
                                            name="checkedA"
                                            color="primary"
                                            sx={{
                                                '&.Mui-checked': {
                                                  color: "black",  // Change color when checked (e.g., green)
                                                },  // Change color when unchecked (e.g., blue)
                                              }}
                                        />

                                    </TableCell>

                                    <TableCell >

                                        <Checkbox
                                            checked={matchStats[row.nickname!].rcard}
                                            onChange={(e) => handleRCardChange(e.target.checked, row.nickname!)}
                                            name="checkedA"
                                            color="primary"
                                            sx={{
                                                '&.Mui-checked': {
                                                  color: "black",  // Change color when checked (e.g., green)
                                                },  // Change color when unchecked (e.g., blue)
                                              }}
                                        />

                                    </TableCell>

                                </TableRow>
                                        
                            ))}
                        </React.Fragment>
                        ))}
                        
                    </TableBody>
                    
                    </Table>
    
                </TableContainer>
            </Box>

            <Box sx={{ mt: "2%", width: "30%"}}>
                <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", maxWidth: "100%", minWidth: "100%", overflowY: "auto", }} >
    
                    <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {["Jugador", "Goles", "T.Am.", "T.R."].map((col) => (
                                <TableCell
                                    key={col}
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: "center" // Center text in the header
                                    }}
                                >
                                    {col}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody sx={{backgroundColor: '#fafafa'}}>
    
                    {participantData && matchStats && Object.keys(participantData.visitor.groupedPlayers).map((category) => (
                        <React.Fragment key={category}>
                            {/* Render category header 
                            <TableRow>
                            <TableCell colSpan={4} style={{ fontWeight: "bold", backgroundColor: "#f1f1f1" }}>
                                {category}
                            </TableCell>
                            </TableRow>*/}
            
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

                                    <TableCell sx={{ textAlign: "center"}} >
                                        
                                        <TextField
                                            type="number"
                                            value={matchStats[row.nickname!].goals}
                                            onChange={(e) => handleGoalsChange(e.target.value, row.nickname!)}
                                            inputProps={{ min: 0 }}
                                            variant="outlined"
                                            InputProps={{
                                                sx: {
                                                    backgroundColor: 'white', 
                                                    height: 40,
                                                    width: 80
                                                }
                                            }}
                                        />

                                    </TableCell>

                                    <TableCell >

                                        <Checkbox
                                            checked={matchStats[row.nickname!].ycard}
                                            onChange={(e) => handleYCardChange(e.target.checked, row.nickname!)}
                                            name="checkedA"
                                            color="primary"
                                            sx={{
                                                '&.Mui-checked': {
                                                  color: "black",  // Change color when checked (e.g., green)
                                                },  // Change color when unchecked (e.g., blue)
                                              }}
                                        />

                                    </TableCell>

                                    <TableCell >

                                        <Checkbox
                                            checked={matchStats[row.nickname!].rcard}
                                            onChange={(e) => handleRCardChange(e.target.checked, row.nickname!)}
                                            name="checkedA"
                                            color="primary"
                                            sx={{
                                                '&.Mui-checked': {
                                                  color: "black",  // Change color when checked (e.g., green)
                                                },  // Change color when unchecked (e.g., blue)
                                              }}
                                        />

                                    </TableCell>

                                    
                                            
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