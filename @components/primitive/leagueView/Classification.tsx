import React, { useState, useMemo, ReactNode  } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Card, Box, IconButton, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";


interface LeagueTable {
    team_name: string;
    n_played_matches: number;
    victories: number;
    draws: number;
    loses: number;
    points: number;
    goals_favor: number;
    goals_against: number;
    goal_diff: number;
    yellow_cards: number;
    red_cards: number;
}

const columnNames = {
    team_name: "Equipo",
    points: "Pts.",
    n_played_matches: "PJ",
    victories: "PG",
    draws: "PE",
    loses: "PP",
    goals_favor: "GF",
    goals_against: "GC",
    goal_diff: "DG",
    yellow_cards: "T.Am.",
    red_cards: "T.Rojas"
};

interface LeagueTableTableProps {
    data: LeagueTable[];
    game: string;
  }

  const LeagueTable: React.FC<LeagueTableTableProps> = ({ data, game }) => {
    
    // Sort the filtered data
    const sortedData = useMemo(() => {
        const sorted = [...data].sort((a, b) => {
            const aValue = a["points" as keyof LeagueTable];
            const bValue = b["points" as keyof LeagueTable];

            // Handle undefined or null values by treating them as the lowest possible values
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            // Now we can safely compare values
            if (aValue < bValue) {
                return 1;
            }
            if (aValue > bValue) {
                return -1;
            }
            return 0;
        });
        return sorted;
        
    }, [data]);

    //if (!data || data.length === 0) return <p>No data available</p>;

    const columns = Object.keys(columnNames)

    return (
        <Box sx={{ width: "100%", ml: 10, height: "fit-content"}}>
            <TableContainer sx={{ overflowY: "auto"}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((col) => (
                                <TableCell
                                    key={col}
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: "center" // Center text in the header
                                    }}
                                >
                                    { columnNames[col as keyof typeof columnNames] }
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{backgroundColor: '#fafafa'}}>
                        {sortedData.map((row, index) => (
                            <TableRow key={index}>
                            {columns.map((col) => (
                                <TableCell key={col} align="center" sx={{ backgroundColor: col === "points" ? 'lightgray' : 'transparent' }} >
                                    {col === "team_name" ? (
                                        <Box display="flex" alignItems="center" justifyContent='center'>
                                            {/* Render the image based on the team_name */}
                                            <img 
                                                src={`/static/teams/${game}/${String(row[col as keyof LeagueTable]).replace("/", "_")}.png`} // Load the image based on team_name
                                                alt={row[col as keyof LeagueTable] as string}
                                                style={{ width: "30px", height: "30px", marginRight: "8px" }}
                                            />
                                        </Box>
                                    ) : (
                                        <>
                                            { row[col as keyof LeagueTable] }
                                        </>
                                    )}
                                </TableCell>
                                ))}
                               
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </TableContainer>            

        </Box>
    );
};

export default LeagueTable;