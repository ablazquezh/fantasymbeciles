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


const PlayerSelectionPage = () => {

    const router = useRouter();
    const { leagueId } = router.query;
    const [league, setLeague] = useState<string | null>(null);

    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
      if (leagueId) {
          setLeague(leagueId as string);
      }
    }, [leagueId]);

    



    const [teams, setTeams] = useState([]);
    const [currentUser, setCurrentUser] = useState<string>('');

    useEffect(() => {
        const fetchTeams = async () => {
            const res = await fetch(`/api/teams?game=fifa13`);
            const data = await res.json();
            setTeams(data.teams);
        };

        fetchTeams();
    }, []);
    console.log("********")
console.log(teams)

  
    console.log(`/api/players?page=${page + 1}&pageSize=${rowsPerPage}`)

    useEffect(() => {
      console.log("************")
      const fetchPlayers= async () => {
          const res = await fetch(`/api/players?page=${page + 1}&pageSize=${rowsPerPage}`);
          const data = await res.json();
          
          setData(data.data);
          setTotal(data.total);
      };

      fetchPlayers();
    }, [page, rowsPerPage]);

    console.log(data)
    const columns = data.length > 0 ? Object.keys(data[0]) : [];







    return (
      <VerticalLayoutTextboxSearch sx={{ width: "60%" }}>
  
          {/* Table */}
          <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", overflowY: "auto" }}>
            <Table>
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
                      {col}
                    </TableCell>
                  ))}
                  {/* Add a column for the "Add" button */}
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{backgroundColor: '#fafafa'}}>
                  {data.map((row, index) => (
                      <TableRow key={index} >
                      {columns.map((col) => (
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
  