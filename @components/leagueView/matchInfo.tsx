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
import { leagues } from '@prisma/client';
import getRedCardPlayersWithTeamFromPreviousMatchday from '../utils/getRedCardPlayersWithTeamFromPreviousMatchday';
import getPlayersWithXYellowCardsWithReset from '../utils/getPlayersWithXYellowCardsWithReset';
import getInjuredPlayers from '../utils/getInjuredPlayers';

interface MatchInfoDashboardProps {
    matchInfo: MatchInfo; 
    matchIndex: number;
    matchRound: boolean;
    matchDay: number;
    completeLeagueTeams: ParticipantsFull[];
    game: string;
    setSchedule: React.Dispatch<React.SetStateAction<Schedule | null>>;
    schedule: Schedule;
    leagueInfo: leagues;
}

const globalColnames = {
    nickname: "Jugador",
  };

interface MatchDetailsUpdated {
    team: string;
    goals: any[]; // You can replace 'any' with a more specific type if needed, like 'number[]' for goals.
    ycards: any[]; // Same as goals, replace 'any' with a more specific type if necessary.
    rcards: any[]; // Same as goals, replace 'any' with a more specific type if necessary.
    injuries: any[];
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
    injury: boolean;
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

return undefined;
};

const getPlayerGoals = (arr: any[], playerName: string): number => {
    const player = arr.find(item => item.player === playerName);
    return player ? player.n : 0;  
};  


const MatchInfoDashboard: React.FC<MatchInfoDashboardProps> = ({matchInfo, matchIndex, matchRound, matchDay, completeLeagueTeams, game, setSchedule, schedule, leagueInfo }) => {

    const [participantData, setParticipantData] = useState<MatchInfoUpdated>()
    const [matchStats, setMatchStats] = useState<MatchStats>()

    const [redCardPlayers, setRedCardPlayers] = useState<string[]>(getRedCardPlayersWithTeamFromPreviousMatchday(schedule, matchDay));
    const [yellowCardPlayers, setYellowCardPlayers] = useState<string[]>(getPlayersWithXYellowCardsWithReset(schedule, matchDay, leagueInfo.yellow_cards_suspension!, 2));
    const [injuredPlayers, setInjuredPlayers] = useState<string[]>(getInjuredPlayers(schedule, matchDay));
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
                  injury: type === "local" ? matchInfo.local.injuries.includes(player.nickname!) : matchInfo.visitor.injuries.includes(player.nickname!),
                };
                return acc;
              }, {} as Record<string, { goals: number; ycard: boolean; rcard: boolean, injury: boolean }>);
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
                rcard: value ? false : false,
            },
            })
        );
        setSchedule((prevData) => {
           
            // Clone the previous ida and vuelta to avoid direct mutation
            const updateItem = matchRound ? [...prevData!.ida] : [...prevData!.vuelta]
      
            // Find the match based on matchday and matchIndex
            const match = updateItem.find((m) => m.matchday === matchDay)?.matches[matchIndex];
      
            const updateTeam = findTeamNameByPlayerName(completeLeagueTeams, playerName)
            console.log(match)
            if (match) {
                if(match.local.team === updateTeam){
      
                    const existingPlayer = match.local.ycards.find(item => item === playerName);

                if(existingPlayer && !value){
                    match.local.ycards = match.local.ycards.filter(item => item !== existingPlayer);
                  }else if(!existingPlayer && value){
                    match.local.ycards.push(playerName);  
                    match.local.rcards = match.local.rcards.filter(item => item !== playerName);
                  }
                  
                }else{
      
                  const existingPlayer = match.visitor.ycards.find(item => item === playerName);
                  if(existingPlayer && !value){
                    match.visitor.ycards = match.visitor.ycards.filter(item => item !== existingPlayer);
                  }else if(!existingPlayer && value){
                    match.visitor.ycards.push(playerName);  // Customize the goal object as needed
                    match.visitor.rcards = match.visitor.rcards.filter(item => item !== playerName);
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
                ycard: value ? false : false
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
                if(existingPlayer && !value){
                    match.local.rcards = match.local.rcards.filter(item => item !== existingPlayer);
                }else if(!existingPlayer && value){
                    match.local.rcards.push(playerName);  // Customize the goal object as needed
                    match.local.ycards = match.local.ycards.filter(item => item !== playerName);
                }
                
              }else{
    
                const existingPlayer = match.visitor.rcards.find(item => item === playerName);
                if(existingPlayer && !value){
                    match.visitor.rcards = match.visitor.rcards.filter(item => item !== existingPlayer);
                }else if(!existingPlayer && value){
                    match.visitor.rcards.push(playerName);  // Customize the goal object as needed
                    match.visitor.ycards = match.visitor.ycards.filter(item => item !== playerName);
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

    const handleInjuryChange = (value: boolean, playerName: string) => {
        
        setMatchStats((prev) => ({
            ...prev,
            [playerName]: {
                ...prev![playerName],
                injury: value
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
    
                const existingPlayer = match.local.injuries.find(item => item === playerName);
                if(existingPlayer && !value){
                    match.local.injuries = match.local.injuries.filter(item => item !== existingPlayer);
                }else if(!existingPlayer && value){
                    match.local.injuries.push(playerName);  // Customize the goal object as needed
                }
                
              }else{
    
                const existingPlayer = match.visitor.injuries.find(item => item === playerName);
                if(existingPlayer && !value){
                    match.visitor.injuries = match.visitor.injuries.filter(item => item !== existingPlayer);
                }else if(!existingPlayer && value){
                    match.visitor.injuries.push(playerName);  // Customize the goal object as needed
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
    console.log("?=====================")
    console.log(completeLeagueTeams)
    console.log(participantData)
    console.log("--=====================")

    return (
    <Paper className="parent" sx={{ padding: 4, marginTop: 10, display: "flex", flexDirection: "row", flexWrap: "wrap", mb: 10}}>

        <MatchCard matchInfo={matchInfo} game={game!} handleMatchClick={undefined} handleMatchInfoClick={handleMatchInfoClick} matchIndex={null} matchRound={null} matchDay={null} />
        <Box sx={{width: "100%", display: "flex", alignContent: "center", justifyContent: "center"}}>

            <Box sx={{mr: "30%", mt: "2%", width: "30%"}}>
                <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", maxWidth: "100%", minWidth: "100%", overflowY: "auto" }} >
    
                    <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {["Jugador", "Goles", "T.Am.", "T.R.", "Lesión"].map((col) => (
                                <TableCell
                                    key={col}
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        borderLeft: col === "Lesión" || col === "T.Am." ? '1px solid rgba(0, 0, 0, 0.12)' : ''  // Center text in the header
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

                                    <TableCell sx={{ borderLeft: '1px solid rgba(0, 0, 0, 0.12)' }}>

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
                                            checked={matchStats[row.nickname!].rcard }
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

                                    <TableCell sx={{ borderLeft: '1px solid rgba(0, 0, 0, 0.12)' }}>

                                        <Checkbox
                                            checked={matchStats[row.nickname!].injury}
                                            onChange={(e) => handleInjuryChange(e.target.checked, row.nickname!)}
                                            name="checkedL"
                                            color="primary"
                                            sx={{
                                                '&.Mui-checked': {
                                                  color: "black",  // Change color when checked (e.g., green)
                                                },  // Change color when unchecked (e.g., blue)
                                              }}
                                        />

                                    </TableCell>

                                    {redCardPlayers.includes(row.nickname!) && (
                                    <div
                                        style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(94, 92, 92, 0.5)', // Gray with 50% opacity
                                        zIndex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="body1"
                                            sx={{
                                                fontWeight: 'bold',      // or 700
                                                color: 'white',          // font color
                                                backgroundColor: 'darkred', // background
                                                padding: '4px 35px',      // optional padding
                                                borderRadius: '4px',     // optional rounded corners
                                                textAlign: 'center'
                                        }}>SANCIONADO <br/> por guarro (ROJA)</Typography>
                                    </div>
                                    )}
                                    {yellowCardPlayers.includes(row.nickname!) && (
                                    <div
                                        style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(94, 92, 92, 0.5)', // Gray with 50% opacity
                                        zIndex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="body1"
                                            sx={{
                                                fontWeight: 'bold',      // or 700
                                                color: 'white',          // font color
                                                backgroundColor: 'darkred', // background
                                                padding: '4px 35px',      // optional padding
                                                borderRadius: '4px',  
                                                textAlign: 'center'   
                                        }}>SANCIONADO <br/>(AC. AMARILLAS)</Typography>
                                    </div>
                                    )}
                                    {injuredPlayers.includes(row.nickname!) && (
                                    <div
                                        style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(94, 92, 92, 0.5)', // Gray with 50% opacity
                                        zIndex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="body1"
                                            sx={{
                                                fontWeight: 'bold',      // or 700
                                                color: 'white',          // font color
                                                backgroundColor: 'rgb(120, 128, 20)', // background
                                                padding: '4px 35px',      // optional padding
                                                borderRadius: '4px',  
                                                textAlign: 'center'   
                                        }}>LESIONAT</Typography>
                                    </div>
                                    )}

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
                        {["Jugador", "Goles", "T.Am.", "T.R.", "Lesión"].map((col) => (
                                <TableCell
                                    key={col}
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        borderLeft: col === "Lesión" || col === "T.Am." ? '1px solid rgba(0, 0, 0, 0.12)' : ''  // Center text in the header
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

                                    <TableCell sx={{ borderLeft: '1px solid rgba(0, 0, 0, 0.12)' }}>

                                        <Checkbox
                                            checked={matchStats[row.nickname!].injury}
                                            onChange={(e) => handleInjuryChange(e.target.checked, row.nickname!)}
                                            name="checkedL"
                                            color="primary"
                                            sx={{
                                                '&.Mui-checked': {
                                                  color: "black",  // Change color when checked (e.g., green)
                                                },  // Change color when unchecked (e.g., blue)
                                              }}
                                        />

                                    </TableCell>

                                    {redCardPlayers.includes(row.nickname!) && (
                                    <div
                                        style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(94, 92, 92, 0.5)', // Gray with 50% opacity
                                        zIndex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="body1"
                                            sx={{
                                                fontWeight: 'bold',      // or 700
                                                color: 'white',          // font color
                                                backgroundColor: 'darkred', // background
                                                padding: '0px 35px',      // optional padding
                                                borderRadius: '4px', 
                                                textAlign: "center"    // optional rounded corners
                                        }}>SANCIONADO <br/> por guarro (ROJA)</Typography>
                                    </div>
                                    )}
                                    {yellowCardPlayers.includes(row.nickname!) && (
                                    <div
                                        style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(94, 92, 92, 0.5)', // Gray with 50% opacity
                                        zIndex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="body1"
                                            sx={{
                                                fontWeight: 'bold',      // or 700
                                                color: 'white',          // font color
                                                backgroundColor: 'darkred', // background
                                                padding: '4px 35px',      // optional padding
                                                borderRadius: '4px',     // optional rounded corners
                                                textAlign: 'center'
                                        }}>SANCIONADO <br/>(AC. AMARILLAS)</Typography>
                                    </div>
                                    )}
                                    {injuredPlayers.includes(row.nickname!) && (
                                    <div
                                        style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'rgba(94, 92, 92, 0.5)', // Gray with 50% opacity
                                        zIndex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="body1"
                                            sx={{
                                                fontWeight: 'bold',      // or 700
                                                color: 'white',          // font color
                                                backgroundColor: 'rgb(120, 128, 20)', // background
                                                padding: '4px 35px',      // optional padding
                                                borderRadius: '4px',  
                                                textAlign: 'center'   
                                        }}>LESIONAT</Typography>
                                    </div>
                                    )}
                                            
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