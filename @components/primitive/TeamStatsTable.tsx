import React, { useState, useMemo, ReactNode  } from "react";
import { CardContent, Modal, Typography, Grid } from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Card, Box, IconButton, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { SelectChangeEvent } from '@mui/material';
import { ListItemText, ListItemIcon, Checkbox, TableSortLabel } from '@mui/material';
import { team_budget } from "@prisma/client";

interface TeamStats {
    team_id_fk: number;
    team_name: string;
    team_avg: number;
    GK_avg: number | null;
    DEF_avg: number | null;
    MID_avg: number | null;
    FWD_avg: number | null;
    team_league: string;
    team_country: string;
}


  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '65%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  // Custom column names
  const columnNames = {
    team_name: "Equipo",
    team_avg: "Pt. Global",
    team_avg_std: "Pt. Global",
    GK_avg: "Pt. Portería",
    DEF_avg: "Pt. Defensa",
    MID_avg: "Pt. Centrocampo",
    FWD_avg: "Pt. Delantera",
    GK_avg_std: "Pt. Portería",
    DEF_avg_std: "Pt. Defensa",
    MID_avg_std: "Pt. Centrocampo",
    FWD_avg_std: "Pt. Delantera",/*
    team_league: "Liga",
    team_country: "País"*/
};

interface TeamStatsTableProps {
    teamBudgets: team_budget[];
    data: TeamStats[]; 
    game: string; 
    onSelect: (value: string, valueFK: number) => void;
    localOptions: Record<string, any>;
    formData: {
        options?: Record<string, any>;
    }
  }

  const TeamStatsTable: React.FC<TeamStatsTableProps> = ({ teamBudgets, data, game, onSelect, localOptions, formData}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [countryFilter, setCountryFilter] = useState<string>('');
    const [leagueFilter, setLeagueFilter] = useState<string>('');
    const [sortColumn, setSortColumn] = useState<string>('team_avg'); // Default sort by team_avg
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState<string>("");


    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page
    };

    // Handle filter by country
    const handleCountryFilterChange = (event: SelectChangeEvent<string>, child: ReactNode) => {
        const selectedValue = event.target.value;
        //setCountryFilter(event.target.value as string);
        setCountryFilter((prev) => (prev[0] === selectedValue ? '' : selectedValue)); // Select or deselect
        setLeagueFilter(''); // Reset league filter
    };

    // Handle filter by league
    const handleLeagueFilterChange = (event: SelectChangeEvent<string>, child: ReactNode) => {
        // Access the selected value through event.target.value
        const selectedValue = event.target.value;
        setLeagueFilter((prev) => (prev[0] === selectedValue ? '' : selectedValue)); // Select or deselect
        setCountryFilter(''); // Reset country filter
    };

     // Handle sorting of the columns
     const handleSortRequest = (column: string) => {
        const isAsc = sortColumn === column && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortColumn(column);
    };

    // Filter and sort data
    const filteredData = useMemo(() => {
        return data.filter((row) => {
            const countryMatch = countryFilter ? row.team_country === countryFilter : true;
            const leagueMatch = leagueFilter ? row.team_league === leagueFilter : true;
            return countryMatch && leagueMatch;
        });
    }, [data, countryFilter, leagueFilter]);

    // Sort the filtered data
    const sortedData = useMemo(() => {
        if (sortColumn !== null) {
            const sorted = [...filteredData].sort((a, b) => {
                const aValue = a[sortColumn as keyof TeamStats];
                const bValue = b[sortColumn as keyof TeamStats];
    
                // Handle undefined or null values by treating them as the lowest possible values
                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
                if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
    
                // Now we can safely compare values
                if (aValue < bValue) {
                    return sortDirection === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });
            return sorted;
        }
        return filteredData;
    }, [filteredData, sortColumn, sortDirection]);

    if (!data || data.length === 0) return <p>No data available</p>;

    let columns = Object.keys(data[0])
    columns = columns.filter(item => item !== "team_league" && item !== "team_country" )

    let paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    for (const key in localOptions) {
        if (localOptions[key] !== null) {
            paginatedData = paginatedData.filter((item) => item.team_name.toLowerCase() !== localOptions[key][0].toLowerCase());
        }
    }

    if (search.length > 1){
        const matchedData = sortedData.filter((item) => item.team_name.toLowerCase().includes(search.toLowerCase()));
        paginatedData = matchedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    }
    return (
        <Box sx={modalStyle}>

            <TableContainer sx={{ minHeight: "550px", maxHeight: "550px", overflowY: "auto" }}>
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
                                    {col === "team_avg_std" ? (
                                        <TableSortLabel
                                        active={sortColumn === 'team_avg_std'}
                                        direction={sortColumn === 'team_avg_std' ? sortDirection : 'asc'}
                                        onClick={() => handleSortRequest('team_avg_std')}
                                      >
                                        {columnNames[col as keyof typeof columnNames]} {/* Display the custom column name */}
                                      </TableSortLabel>
                                    ) : col === "GK_avg_std" ? (
                                        <TableSortLabel
                                        active={sortColumn === 'GK_avg_std'}
                                        direction={sortColumn === 'GK_avg_std' ? sortDirection : 'asc'}
                                        onClick={() => handleSortRequest('GK_avg_std')}
                                      >
                                        {columnNames[col as keyof typeof columnNames]} {/* Display the custom column name */}
                                      </TableSortLabel>
                                    ) : col === "DEF_avg_std" ? (
                                        <TableSortLabel
                                        active={sortColumn === 'DEF_avg_std'}
                                        direction={sortColumn === 'DEF_avg_std' ? sortDirection : 'asc'}
                                        onClick={() => handleSortRequest('DEF_avg_std')}
                                      >
                                        {columnNames[col as keyof typeof columnNames]} {/* Display the custom column name */}
                                      </TableSortLabel>
                                    ) : col === "MID_avg_std" ? (
                                        <TableSortLabel
                                        active={sortColumn === 'MID_avg_std'}
                                        direction={sortColumn === 'MID_avg_std' ? sortDirection : 'asc'}
                                        onClick={() => handleSortRequest('MID_avg_std')}
                                      >
                                        {columnNames[col as keyof typeof columnNames]} {/* Display the custom column name */}
                                      </TableSortLabel>
                                    ) :col === "FWD_avg_std" ? (
                                        <TableSortLabel
                                        active={sortColumn === 'FWD_avg_std'}
                                        direction={sortColumn === 'FWD_avg_std' ? sortDirection : 'asc'}
                                        onClick={() => handleSortRequest('FWD_avg_std')}
                                        
                                      >
                                        {columnNames[col as keyof typeof columnNames]} {/* Display the custom column name */}
                                      </TableSortLabel>
                                    ) : (
                                        columnNames[col as keyof typeof columnNames] 
                                    )}
                                </TableCell>
                                 
                            ))}
                            {formData.options?.leaguetype === "pro" &&
                                <TableCell
                                    key={"budget"}
                                    sx={{
                                        fontWeight: "bold",
                                        textAlign: "center" // Center text in the header
                                    }}
                                >
                                    Presupuesto
                                </TableCell>
                            }
                            {/* Add a column for the "Add" button */}
                            <TableCell></TableCell>
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
                                                src={`/static/teams/${game}/${String(row[col as keyof TeamStats]).replace("/", "_")}.png`} // Load the image based on team_name
                                                alt={row[col as keyof TeamStats] as string}
                                                style={{ width: "30px", height: "30px", marginRight: "8px" }}
                                            />
                                            {/* Render the team name text */}
                                            {row[col as keyof TeamStats]}
                                        </Box>
                                    ) : col === "team_country" ? (
                                        <Box
                                                display="flex"
                                                justifyContent="center" // Center the image horizontally
                                                alignItems="center" // Center the image vertically
                                                sx={{
                                                    height: "100%", // Make sure the Box takes the full height of the cell
                                                    padding: 0 // Optional: Remove any padding
                                                }}
                                            >
                                                {/* Render only the image based on the country */}
                                                <img
                                                    src={`/static/flags/${row[col as keyof TeamStats]}.png`} // Load the image based on team_country
                                                    alt={row[col as keyof TeamStats] as string}
                                                    style={{
                                                        width: "20px", // Adjust the width of the image
                                                        height: "20px", // Adjust the height of the image
                                                    }}
                                                />
                                            </Box>
                                    ) : col !== "team_id_fk" ? (
                                        <Box
                                                display="flex"
                                                justifyContent="center" // Center the image horizontally
                                                alignItems="center" // Center the image vertically
                                                sx={{
                                                    height: "100%", // Make sure the Box takes the full height of the cell
                                                    padding: 0 // Optional: Remove any padding
                                                }}
                                            >
                                            {row[col as keyof TeamStats] ?? "-" } 
                                        </Box>
                                    ) : (<></>)}
                                </TableCell>
                                ))}
                                {formData.options?.leaguetype === "pro" &&
                                    <TableCell>
                                        {Number(teamBudgets.find(item => item.team_name === row.team_name)?.team_avg_std) >= 80 ?
                                            Intl.NumberFormat('de-DE').format(teamBudgets.find(item => item.team_name === row.team_name)?.budget! * formData.options.bigTeamMultiplier!) : 

                                            Number(teamBudgets.find(item => item.team_name === row.team_name)?.team_avg_std) >= 75 ?
                                            Intl.NumberFormat('de-DE').format(teamBudgets.find(item => item.team_name === row.team_name)?.budget! * formData.options.mediumTeamMultiplier!) : 

                                            Intl.NumberFormat('de-DE').format(teamBudgets.find(item => item.team_name === row.team_name)?.budget! * formData.options.smallTeamMultiplier!) }
                                    </TableCell>
                                }
                                {/* Add a cell for the "Add" button */}
                                <TableCell>
                                    <IconButton
                                        onClick={() => onSelect(row.team_name, row.team_id_fk)} // Trigger function on click
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
                                        <AddIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" marginTop={2} gap={2} >

                <FormControl sx={{ minWidth: 80 }}>
                    <InputLabel id="country-filter-label">País</InputLabel>
                    <Select
                        labelId="country-filter-label"
                        value={countryFilter}
                        onChange={handleCountryFilterChange}
                        label="País"
                        renderValue={(selected) => (
                            selected ? (
                                <Box display="flex" alignItems="center" justifyContent="center">
                                    <img
                                        src={`/static/flags/${selected}.png`} 
                                        alt={selected}
                                        style={{ width: "20px", height: "20px" }} // Small size for selected
                                    />
                                </Box>
                            ) : "Select Country"
                        )}
                    >
                        <MenuItem value="">Todos los países</MenuItem>
                        {Array.from(new Set(data.map((row) => row.team_country)))
                            .sort()
                            .map((country) => (
                                <MenuItem key={country} value={country} sx={{justifyContent: 'center', backgroundColor: '#f0eeee'}}>
                                    <img
                                        src={`/static/flags/${country}.png`} // Load the image based on team_country
                                        alt={country}
                                        style={{
                                            width: "30px", // Adjust the width of the image
                                            height: "30px", // Adjust the height of the image
                                        }}
                                    />
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="league-filter-label">Liga</InputLabel>
                    <Select
                        labelId="league-filter-label"
                        value={leagueFilter}
                        onChange={handleLeagueFilterChange}
                        label="Liga"
                    >
                        <MenuItem value="">Todas las ligas</MenuItem>
                        {Array.from(new Set(data.map((row) => row.team_league)))
                            .sort()
                            .map((league) => (
                                <MenuItem key={league} value={league} sx={{ backgroundColor: '#f0eeee'}}>
                                    {league}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Buscar equipo por nombre"
                    variant="outlined"
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ marginBottom: 2, width: '30%' }}
                />

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
        </Box>
    );
};

export default TeamStatsTable;