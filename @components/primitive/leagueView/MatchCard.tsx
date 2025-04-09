import React, { useState, useMemo, ReactNode  } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Card, Box, IconButton, TextField, MenuItem, Select, InputLabel, FormControl, Typography } from "@mui/material";


interface MatchDetails {
    team: string;
    goals: any[]; // You can replace 'any' with a more specific type if needed, like 'number[]' for goals.
    cards: any[]; // Same as goals, replace 'any' with a more specific type if necessary.
  }
  
interface matchInfo {
    local: MatchDetails;
    visitor: MatchDetails;
    played: boolean;
  }

interface MatchProps {
    matchInfo: matchInfo;
    game: string;
    handleMatchClick: ((
        matchInfo: matchInfo
      ) => void) | null;
  }

  const MatchCard: React.FC<MatchProps> = ({ matchInfo, game, handleMatchClick }) => {

    const handleClick = () => {
        handleMatchClick!(matchInfo);
    };

    return (
        <Box sx={{ display: "flex", width: "100%", mt: 2, height: "60px", cursor: 'pointer' }} onClick={handleClick} >
            
            <Paper sx={{  display: "flex", alignItems: "center", padding: 1, backgroundColor: "lightgray", width: "100%"}}>
                <Box sx={{  display: "flex", mr: "auto", alignItems: "center", width:"30%" }}>
                    <img 
                        src={`/static/teams/${game}/${matchInfo.local.team.replace("/", "_")}.png`} // Load the image based on team_name
                        alt={matchInfo.local.team}
                        style={{ width: "40px", height: "40px", padding: 2 }}
                    />
                    <Typography sx={{ textAlign: 'center', mr: 'auto' }}>
                        {matchInfo.local.team}
                    </Typography>
                </Box>
                
                <Paper sx={{ ml: 1, mr: 1, display: "flex", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "black"}}>
                    <Typography sx={{pl: 1.5, pr: 1.5, fontWeight: 'bold', color: "white"}}>
                        {matchInfo.played ? matchInfo.local.goals.reduce((sum, goal) => sum + goal.n, 0) : "-"}
                    </Typography>
                </Paper>
                    <Typography sx={{fontWeight: 'bold', fontSize: 20}}>
                        :
                    </Typography>
                <Paper sx={{ ml: 1, mr: 1, display: "flex", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "black"}}>
                    <Typography sx={{pl: 1.5, pr: 1.5, fontWeight: 'bold', color: "white"}}>
                        {matchInfo.played ? matchInfo.visitor.goals.reduce((sum, goal) => sum + goal.n, 0) : "-"}
                    </Typography>
                </Paper>

                <Box sx={{  display: "flex", ml: "auto", alignItems: "center", width:"30%" }}>
                    <Typography sx={{ textAlign: 'center', ml: 'auto' }}>
                        {matchInfo.visitor.team}
                    </Typography>
                    <img 
                        src={`/static/teams/${game}/${matchInfo.visitor.team.replace("/", "_")}.png`} // Load the image based on team_name
                        alt={matchInfo.visitor.team}
                        style={{ width: "40px", height: "40px", padding: 2 }}
                    />
                </Box>

            </Paper>

        </Box>
    );
};

export default MatchCard;