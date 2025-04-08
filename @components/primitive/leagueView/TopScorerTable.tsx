import React, { useState, useMemo, ReactNode  } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Card, Box, IconButton, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";


interface TopScorer {
    team_name: string;
    player_name: string;
    goals: number;
}

const columnNames = {
    team_name: "Equipo",
    player_name: "Jugador",
    goals: "Goles"
};

interface TopScorerTableProps {
    data: TopScorer[];
    game: string;
  }

  const TopScorerTable: React.FC<TopScorerTableProps> = ({ data, game }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page
    };

    // Sort the filtered data
    const sortedData = useMemo(() => {
        const sorted = [...data].sort((a, b) => {
            const aValue = a["goals" as keyof TopScorer];
            const bValue = b["goals" as keyof TopScorer];

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

    let paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ width: "20%", backgroundColor: "lightgray", height: "fit-content"}}>
            <TableContainer sx={{ minHeight: "550px", maxHeight: "550px", overflowY: "auto"}}>
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
                        {paginatedData.map((row, index) => (
                            <TableRow key={index} >
                            {columns.map((col) => (
                                <TableCell key={col}  >
                                    {col === "team_name" ? (
                                        <Box display="flex" alignItems="center" justifyContent='center'>
                                            {/* Render the image based on the team_name */}
                                            <img 
                                                src={`/static/teams/${game}/${String(row[col as keyof TopScorer]).replace("/", "_")}.png`} // Load the image based on team_name
                                                alt={row[col as keyof TopScorer] as string}
                                                style={{ width: "30px", height: "30px", marginRight: "8px" }}
                                            />
                                        </Box>
                                    ) : (
                                        <>{ row[col as keyof TopScorer] }</>
                                    )}
                                </TableCell>
                                ))}
                               
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </TableContainer>            

            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{margin: "auto", marginRight: 0}}
            />

        </Box>
    );
};

export default TopScorerTable;