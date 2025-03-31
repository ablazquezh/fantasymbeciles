import React, { useEffect, useState } from 'react'
import type { GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from 'next'
import VerticalLayoutTextboxSearch from '../@components/layout/VerticalLayoutTextboxSearch'
import { useRouter } from "next/router";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Card,
  Box,
  CardContent,
  Typography,
  TablePagination 
} from "@mui/material";
import { players } from "@prisma/client";
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';


// Custom column names
const globalColnames = {
  nickname: "Jugador",
  average: "Pt. Global"
};

const getRowColor = (status: string | null) => {
  switch (status) {
    case "Delantero": return "#80ccff"; 
    case "Centrocampista": return "#83ff80"; 
    case "Defensa": return  "#ffee80" ; 
    case "Portero": return "#ff9380 "; 
    default: return "#fafafa";
  }
};
function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number,
  price: number,
) {
  return {
    name,
    calories,
    fat,
    carbs,
    protein,
    price,
    history: [
      {
        date: '2020-01-05',
        customerId: '11091700',
        amount: 3,
      },
      {
        date: '2020-01-02',
        customerId: 'Anonymous',
        amount: 1,
      },
    ],
  };
}

function Row(props: { row: ReturnType<typeof createData> }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">{row.calories}</TableCell>
        <TableCell align="right">{row.fat}</TableCell>
        <TableCell align="right">{row.carbs}</TableCell>
        <TableCell align="right">{row.protein}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Total price ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.date}
                      </TableCell>
                      <TableCell>{historyRow.customerId}</TableCell>
                      <TableCell align="right">{historyRow.amount}</TableCell>
                      <TableCell align="right">
                        {Math.round(historyRow.amount * row.price * 100) / 100}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const PlayerSelectionPage = () => {

    const router = useRouter();
    const { leagueId } = router.query;
    const [league, setLeague] = useState<string | null>(null);

    const [players, setPlayers] = useState<players[]>([]);
    const [playerPositions, setPlayerPositions] = useState([]);    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
      if (leagueId) {
          setLeague(leagueId as string);
      }
    }, [leagueId]);


    useEffect(() => {
      const fetchPlayers= async () => {
          const res = await fetch(`/api/players?page=${page + 1}&pageSize=${rowsPerPage}`);
          const data = await res.json();
          
          setPlayers(data.data);
          setTotal(data.total);
      };

      fetchPlayers();
    }, [page, rowsPerPage]);

    useEffect(() => {
      const fetchPlayers= async () => {

          const idList = players.map(player => player.ID);

          const res = await fetch(`/api/playerpositions?game=fifa13&idList=${idList}`);
          const data = await res.json();
          
          setPlayerPositions(data.positions);
      };

      fetchPlayers();
    }, [players]);


    const columns = players.length > 0 ? Object.keys(players[0]) : [];


    console.log(players)
    console.log(playerPositions)

    return (
      <VerticalLayoutTextboxSearch sx={{ width: "60%" }}>
  
          {/* Table */}
          <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", overflowY: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {Object.keys(globalColnames).map((col) => (
                    <TableCell
                      key={col}
                      sx={{
                        fontWeight: "bold",
                        textAlign: "center" // Center text in the header
                      }}
                    >
                      {globalColnames[col as keyof typeof globalColnames]}
                    </TableCell>
                  ))}
                  {/* Add a column for the "Add" button */}
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{backgroundColor: '#fafafa'}}>
                  {players.map((row, index) => (
                      <TableRow key={index}  sx={{ bgcolor: getRowColor(row.global_position) }} >
                      { Object.keys(globalColnames).map((col) => (
                          <TableCell key={col}  >
                            <Box
                                    display="flex"
                                    justifyContent="center" // Center the image horizontally
                                    alignItems="center" // Center the image vertically
                                    sx={{
                                        height: "100%", // Make sure the Box takes the full height of the cell
                                        padding: 0 // Optional: Remove any padding
                                    }}
                                >
                                {row[col as keyof players] ?? "-"} 
                            </Box>
                          </TableCell>
                          ))}
                          
                      </TableRow>
                  ))}
              </TableBody>
            </Table>

            <TablePagination
                component="div"
                count={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0); // Reset to first page
                }}
            />

          </TableContainer>

    </ VerticalLayoutTextboxSearch>
    )
  }
  
  export default PlayerSelectionPage
  