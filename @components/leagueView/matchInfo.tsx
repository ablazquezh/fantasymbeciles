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
import { Schedule } from '../types/Schedule';

interface MatchInfoDashboardProps {
    matchInfo: MatchInfo; 
    matchIndex: number;
    matchRound: boolean;
    matchDay: number;
    completeLeagueTeams: ParticipantsFull[];
    game: string;
    setSchedule: React.Dispatch<React.SetStateAction<Schedule | null>>;
}

const globalColnames = {
    nickname: "Jugador",
  };

interface MatchDetailsUpdated {
    team: string;
    goals: any[]; // You can replace 'any' with a more specific type if needed, like 'number[]' for goals.
    ycards: any[]; // Same as goals, replace 'any' with a more specific type if necessary.
    rcards: any[]; // Same as goals, replace 'any' with a more specific type if necessary.
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

const findTeamNameByPlayerName = (participants: ParticipantsFull[], playerName: string): string | undefined => {
// Iterate over all participants
for (const participant of participants) {
    // Check if any player in the current participant's players array matches the given player name
    const player = participant.players.find(p => p.nickname === playerName);

    if (player) {
    // If a match is found, return the team_name of the participant
    return participant.team_name;
    }
}

// If no match is found, return undefined
return undefined;
};

const getPlayerGoals = (arr: any[], playerName: string): number => {
    const player = arr.find(item => item.player === playerName);
    return player ? player.n : 0;  
  };

const MatchInfoDashboard: React.FC<MatchInfoDashboardProps> = ({matchInfo, matchIndex, matchRound, matchDay, completeLeagueTeams, game, setSchedule }) => {

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
        
        const transformTeam = (teamData: MatchDetailsUpdated, type: string) => {
            
            return teamData.players.reduce((acc, player) => {
                acc[player.nickname!] = {
                  goals: type === "local" ? getPlayerGoals(matchInfo.local.goals, player.nickname!) : getPlayerGoals(matchInfo.visitor.goals, player.nickname!),
                  ycard: type === "local" ? matchInfo.local.ycards.includes(player.nickname!) : matchInfo.visitor.ycards.includes(player.nickname!),
                  rcard: type === "local" ? matchInfo.local.rcards.includes(player.nickname!) : matchInfo.visitor.rcards.includes(player.nickname!),
                };
                return acc;
              }, {} as Record<string, { goals: number; ycard: boolean; rcard: boolean }>);
        }

        const item = {...transformTeam(participantData!.local, "local"), ...transformTeam(participantData!.visitor, "visitor")}

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

      setSchedule((prevData) => {
        // Clone the previous ida and vuelta to avoid direct mutation
        const updateItem = matchRound ? [...prevData!.ida] : [...prevData!.vuelta]
  
        // Find the match based on matchday and matchIndex
        const match = updateItem.find((m) => m.matchday === matchDay)?.matches[matchIndex];
  
        const updateTeam = findTeamNameByPlayerName(completeLeagueTeams, playerName)
        
        if (match) {
          // Add a goal to the specified team's goals array
          if(match.local.team === updateTeam){

            const existingPlayer = match.local.goals.find(item => item.player === playerName);
            if(existingPlayer){
                existingPlayer.n = Number(value)
            }else{
                match.local.goals.push({player: playerName, n: Number(value) });  // Customize the goal object as needed
            }
            
          }else{

            const existingPlayer = match.visitor.goals.find(item => item.player === playerName);
            if(existingPlayer){
                existingPlayer.n = Number(value)
            }else{
                match.visitor.goals.push({player: playerName, n: Number(value) });  // Customize the goal object as needed
            }

          }

          match.played = true
        }

        if(matchRound){
            return { ...prevData, ida: updateItem, vuelta: [...prevData!.vuelta] };
        }else{
            return { ...prevData, ida: [...prevData!.ida], vuelta: updateItem };
        }
      });

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

        setSchedule((prevData) => {
            // Clone the previous ida and vuelta to avoid direct mutation
            const updateItem = matchRound ? [...prevData!.ida] : [...prevData!.vuelta]
      
            // Find the match based on matchday and matchIndex
            const match = updateItem.find((m) => m.matchday === matchDay)?.matches[matchIndex];
      
            const updateTeam = findTeamNameByPlayerName(completeLeagueTeams, playerName)
            
            if (match) {
              if(match.local.team === updateTeam){
    
                const existingPlayer = match.local.ycards.find(item => item === playerName);
                if(existingPlayer){
                    match.local.ycards.filter(item => item !== existingPlayer);
                }else{
                    match.local.ycards.push(playerName);  // Customize the goal object as needed
                }
                
              }else{
    
                const existingPlayer = match.visitor.ycards.find(item => item === playerName);
                if(existingPlayer){
                    match.visitor.ycards.filter(item => item !== existingPlayer);
                }else{
                    match.visitor.ycards.push(playerName);  // Customize the goal object as needed
                }
    
              }
    
              match.played = true
            }
    
            if(matchRound){
                return { ...prevData, ida: updateItem, vuelta: [...prevData!.vuelta] };
            }else{
                return { ...prevData, ida: [...prevData!.ida], vuelta: updateItem };
            }
          });
             
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

        setSchedule((prevData) => {
            // Clone the previous ida and vuelta to avoid direct mutation
            const updateItem = matchRound ? [...prevData!.ida] : [...prevData!.vuelta]
      
            // Find the match based on matchday and matchIndex
            const match = updateItem.find((m) => m.matchday === matchDay)?.matches[matchIndex];
      
            const updateTeam = findTeamNameByPlayerName(completeLeagueTeams, playerName)
            
            if (match) {
              if(match.local.team === updateTeam){
    
                const existingPlayer = match.local.rcards.find(item => item === playerName);
                if(existingPlayer){
                    match.local.rcards.filter(item => item !== existingPlayer);
                }else{
                    match.local.rcards.push(playerName);  // Customize the goal object as needed
                }
                
              }else{
    
                const existingPlayer = match.visitor.rcards.find(item => item === playerName);
                if(existingPlayer){
                    match.visitor.rcards.filter(item => item !== existingPlayer);
                }else{
                    match.visitor.rcards.push(playerName);  // Customize the goal object as needed
                }
    
              }
    
              match.played = true
            }
    
            if(matchRound){
                return { ...prevData, ida: updateItem, vuelta: [...prevData!.vuelta] };
            }else{
                return { ...prevData, ida: [...prevData!.ida], vuelta: updateItem };
            }
          });
             
    };

    const handleMatchInfoClick = () => {
        
        setSchedule((prevData) => {
            // Clone the previous ida and vuelta to avoid direct mutation
            const updateItem = matchRound ? [...prevData!.ida] : [...prevData!.vuelta]
      
            // Find the match based on matchday and matchIndex
            const match = updateItem.find((m) => m.matchday === matchDay)?.matches[matchIndex];
                  
            if (match) {
              match.played = true
            }
    
            if(matchRound){
                return { ...prevData, ida: updateItem, vuelta: [...prevData!.vuelta] };
            }else{
                return { ...prevData, ida: [...prevData!.ida], vuelta: updateItem };
            }
          });
             
    };
    

    return (
    <Paper className="parent" sx={{ padding: 4, marginTop: 10, display: "flex", flexDirection: "row", flexWrap: "wrap", mb: 10}}>

        <MatchCard matchInfo={matchInfo} game={game!} handleMatchClick={undefined} handleMatchInfoClick={handleMatchInfoClick} matchIndex={null} matchRound={null} matchDay={null} />
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