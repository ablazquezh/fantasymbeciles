import React, { useState, useMemo, ReactNode, useEffect  } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Card, Box, IconButton, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";


interface HistoryData {
    user_name: string;
    matches_played: number;
    victories: number;
    draws: number;
    losses: number;
    total_points: number;
    goals_favor: number;
    goals_against: number;
    goal_diff: number;
    yellow_cards: number;
    red_cards: number;
}

const columnNames = {
    user_name: "Jugador",
    total_points: "Pts.",
    matches_played: "PJ",
    victories: "PG",
    draws: "PE",
    losses: "PP",
    goals_favor: "GF",
    goals_against: "GC",
    goal_diff: "DG",
    yellow_cards: "T.Am.",
    red_cards: "T.Rojas"
};

interface TrophyRoomProps {
}

const TrophyRoom: React.FC<TrophyRoomProps> = () => {

    const [historyData, setHistoryData] = useState<HistoryData[]>([]);

    useEffect(() => {

        const fetchTeams = async () => {
            const res = await fetch(`/api/userhistory?leagueType=raw`);
            const data = await res.json();
            setHistoryData(data);
        };

        fetchTeams();
    }, []);

    const columns = Object.keys(columnNames)

    return (
        <Paper
  sx={{
    padding: 4,
    marginTop: 11,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  <TableContainer sx={{ overflowY: "auto" }}>
    <Table stickyHeader>
      <TableHead>
        <TableRow>
          {columns.map((col) => (
            <TableCell
              key={col}
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                backgroundColor:
                    col === "total_points" ? "lightgray" : "transparent",
                // Left border for goals_favor column
                borderLeft:
                  col === "goals_favor" ? "1px solid lightgray" : undefined,
                // Right border for goal_diff column
                borderRight:
                  col === "goal_diff" ? "1px solid lightgray" : undefined,
              }}
            >
              {columnNames[col as keyof typeof columnNames]}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody sx={{ backgroundColor: "#fafafa" }}>
        {historyData &&
          historyData.length > 0 &&
          historyData.map((row, index) => (
            <TableRow key={index}>
              {columns.map((col) => (
                <TableCell
                  key={col}
                  align="center"
                  sx={{
                    backgroundColor:
                      col === "total_points" ? "lightgray" : "transparent",

                    // Left border for goals_favor column
                    borderLeft:
                      col === "goals_favor"
                        ? "1px solid lightgray"
                        : undefined,

                    // Right border for goal_diff column
                    borderRight:
                      col === "goal_diff"
                        ? "1px solid lightgray"
                        : undefined,
                  }}
                >
                  {row[col as keyof HistoryData]}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>

    );
    };

export default TrophyRoom;