import React, { useEffect, useState } from 'react'
import VerticalLayoutTextboxSearch from '../@components/layout/VerticalLayoutTextboxSearch'
import { useRouter } from "next/router";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, TablePagination, Paper } from "@mui/material";
import { players } from "@prisma/client";
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import { GetServerSidePropsContext, NextPage } from 'next';

import { PrismaClient, Prisma, users, leagues } from "@prisma/client";


const tableBoxStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '65%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const prisma = new PrismaClient();

export async function getServerSideProps(context: GetServerSidePropsContext) {

  const {leagueId} = context.query as {leagueId?: string};

  const dbleague: leagues | null = await prisma.leagues.findUnique({
    where: {ID: Number(leagueId)}
  }
  );

  const participants = await prisma.$queryRaw`
          SELECT user_name, team_name FROM league_participants_view WHERE game = ${dbleague?.game} AND league_ID_fk = ${dbleague?.ID}
      `;

  return { props: {
    dbleague: {
      ...dbleague,
      created_at: dbleague?.created_at ? dbleague.created_at.toISOString() : null,
    },
    participants: participants
  } };
}


const globalDetailColnames = {
  age: "Edad",
  height: "Altura(cm)",
  best_foot: "Pie",
  weak_foot_5stars: "Pie malo",
  heading: "Cabeceo",
  jump: "Salto",
  long_pass: "Pase largo",
  short_pass: "Pase corto",
  dribbling: "Regate",
  acceleration: "Aceleración",
  speed: "Velocidad",
  shot_power: "Potencia de disparo",
  long_shot: "Disparo largo",
  stamina: "Aguante",
  defense: "Defensa",
  interception: "Intercepción"
};


// Custom column names
const globalColnames = {
  nickname: "Jugador",
  average: "Pt. Global",
  positions: "Posiciones",
  team_name: "Equipo de origen"
};

type globalColTypes = {
  nickname: string
  average: string
  positions: string[]
}

type RowData = {
  ID: number;
  nickname: string | null;
  positions: string[] | null;
  country_code: string | null;
  value: number | null;
  wage: number | null;
  average: number | null;
  global_position: string | null;
  team_name: string | null;
  detail: {
    age: number | null;
    height: number | null;
    best_foot: string | null;
    weak_foot_5stars: number | null;
    heading: number | null;
    jump: number | null;
    long_pass: number | null;
    short_pass: number | null;
    dribbling: number | null;
    acceleration: number | null;
    speed: number | null;
    shot_power: number | null;
    long_shot: number | null;
    stamina: number | null;
    defense: number | null;
    interception: number | null;
  };
};

type playersFull = players & {
  teams: {
    ID: string | null;
    game: string | null;
    team_country: string | null;
    team_league: string | null;
    team_name: string | null;
  }; // Adding a new property
};

function mergeData(A: playersFull[], B: any[]) {
  // Create a lookup map from B, grouping all `y` values by `x`
  const bMap = B.reduce((acc, item) => {
    if (!acc[item.player_name]) {
      acc[item.player_name] = [];
    }
    acc[item.player_name].push(item.position_name);
    return acc;
  }, {} as Record<string, string[]>);

  // Map over A and add the new `y` array property
  return A.map((item) => ({
    ...item,
    positions: bMap[item.name!] || [] // If there are no matches, use an empty array
  }));
}


function reshapeData(data: ReturnType<typeof mergeData>) {
  
  return data.reduce((acc, item) => {
    const existingItem = acc.find((x) => x.ID === item.ID && x.nickname === item.nickname && x.average === item.average && x.positions === item.positions && 
    x.country_code === item.country_code && x.value === item.value && x.wage === item.wage && x.global_position === item.global_position && x.team_name === item.teams.team_name );
    
    const newXEntry = {
      age: item.age,
      height: item.height,
      best_foot: item.best_foot,
      weak_foot_5stars: item.weak_foot_5stars,
      heading: item.heading,
      jump: item.jump,
      long_pass: item.long_pass,
      short_pass: item.short_pass,
      dribbling: item.dribbling,
      acceleration: item.acceleration,
      speed: item.speed,
      shot_power: item.shot_power,
      long_shot: item.long_shot,
      stamina: item.stamina,
      defense: item.defense,
      interception: item.interception
    };

    if (existingItem) {
      existingItem.detail = newXEntry;
    } else {
      acc.push({
        ID: item.ID,
        nickname: item.nickname,
        average: item.average,
        positions: item.positions,
        global_position: item.global_position,
        wage: item.wage,
        value: item.value,
        country_code: item.country_code,
        team_name: item.teams.team_name,
        detail: newXEntry
      });
    }

    return acc;
  }, [] as RowData[]);
}



const getRowColor = (status: string | null) => {
  switch (status) {
    case "Delantero": return "#80ccff"; 
    case "Centrocampista": return "#83ff80"; 
    case "Defensa": return  "#ffee80" ; 
    case "Portero": return "#ff9380 "; 
    default: return "#fafafa";
  }
};


function Row(props: { row: RowData, gamekey: string | null }) {
  
  const { row, gamekey } = props;
  const [open, setOpen] = React.useState(false);
  console.log(row)
  return (
    <React.Fragment>
      <TableRow sx={{ bgcolor: getRowColor(row.global_position) }} >
        <TableCell sx={{width: 0}}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        { Object.keys(globalColnames).map((col) => (
          <TableCell key={col} >
            {col === "nickname" ? (
              <Box
                display="flex"
                justifyContent="center" // Center the image horizontally
                alignItems="center" // Center the image vertically
                sx={{
                    height: "100%", // Make sure the Box takes the full height of the cell
                    padding: 0 // Optional: Remove any padding
                }}
              >
                <img
                  src={`/static/players/${gamekey}/${row["ID"]-1}.png`} // Load the image based on team_name
                  alt={row[col as keyof typeof globalColnames] as string}
                  style={{ width: "45px", height: "45px", marginRight: "8px" }}
                />
                {row[col as keyof typeof globalColnames] !== null &&
                  row[col as keyof typeof globalColnames] !== undefined ? (
                    Array.isArray(row[col as keyof typeof globalColnames]) ? (
                      (row[col as keyof typeof globalColnames] as string[]).map((item, index) => (
                        <Chip key={index} label={item} sx={{ margin: "2px" }} />
                      ))
                    ) : (
                      row[col as keyof typeof globalColnames]
                    )
                  ) : (
                    "-"
                )}
              </Box>
            ) : col === "team_name" ?(
              <Box
                display="flex"
                justifyContent="center" // Center the image horizontally
                alignItems="center" // Center the image vertically
                sx={{
                    height: "100%", // Make sure the Box takes the full height of the cell
                    padding: 0 // Optional: Remove any padding
                }}
              >
                <img 
                  src={`/static/teams/${gamekey}/${String(row["team_name"]).replace("/", "_")}.png`} // Load the image based on team_name
                  alt={row[col as keyof typeof globalColnames] as string}
                  style={{ width: "38px", height: "38px", marginRight: "8px" }}
                  title={row[col as keyof typeof globalColnames] as string}
                />
              </Box>
            ) : (
              <Box
                display="flex"
                justifyContent="center" // Center the image horizontally
                alignItems="center" // Center the image vertically
                sx={{
                    height: "100%", // Make sure the Box takes the full height of the cell
                    padding: 0 // Optional: Remove any padding
                }}
              >
                {row[col as keyof typeof globalColnames] !== null &&
                  row[col as keyof typeof globalColnames] !== undefined ? (
                    Array.isArray(row[col as keyof typeof globalColnames]) ? (
                      (row[col as keyof typeof globalColnames] as string[]).map((item, index) => (
                        <Chip key={index} label={item} sx={{ margin: "2px" }} />
                      ))
                    ) : (
                      row[col as keyof typeof globalColnames]
                    )
                  ) : (
                    "-"
                  )}
              </Box>
            )}
          </TableCell>
        ))}
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ height: 200, overflow: 'hidden'}}> {/* Set a fixed height */}
                <List
                  sx={{
                    display: 'grid', // Using grid layout
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // Automatically create columns
                    gridGap: '3px', // Space between items
                    maxHeight: '100%', // Make sure it doesn't exceed the container height
                    overflow: 'auto', // Scroll if the list exceeds the container
                  }}
                >
                  {Object.entries(row.detail).map(([key, value]) => (
                    <ListItem key={key} >
                      {globalDetailColnames[key as keyof typeof globalDetailColnames]}: {row.detail[key as keyof RowData['detail']] ?? '-'}
                    </ListItem>
                  ))}
                </List>
              </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

interface PlayerSelectProps {
  dbleague: leagues;
  participants: any[];
}


const PlayerSelectionPage: NextPage<PlayerSelectProps> = ({dbleague, participants}) => {

    console.log(participants)
    console.log(dbleague)
    const router = useRouter();
    const { leagueId } = router.query;
    const [league, setLeague] = useState<string | null>(null);

    const [players, setPlayers] = useState<playersFull[]>([]);
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
          const res = await fetch(`/api/players?page=${page + 1}&pageSize=${rowsPerPage}&game=${dbleague.game}`);
          const data = await res.json();
          
          setPlayers(data.data);
          setTotal(data.total);
      };

      fetchPlayers();
    }, [page, rowsPerPage]);

    useEffect(() => {
      const fetchPlayers= async () => {

          const idList = players.map(player => player.ID);

          const res = await fetch(`/api/playerpositions?game=${dbleague.game}&idList=${idList}`);
          const data = await res.json();
          
          setPlayerPositions(data.positions);
      };

      fetchPlayers();
    }, [players]);

    const completePlayerInfo = mergeData(players, playerPositions)
    const shapedData = reshapeData(completePlayerInfo)
    
    return (
      <VerticalLayoutTextboxSearch>
        <Paper sx={{ padding: 4, marginTop: 10 }}>
          {/* Table */}
          <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", overflowY: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell />
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
                  {shapedData.map((row, index) => (
                    <Row key={row.nickname} row={row} gamekey={dbleague.game} />
                  ))}
              </TableBody>
            </Table>

            

          </TableContainer>

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
        </Paper>
    </ VerticalLayoutTextboxSearch>
    )
  }
  
  export default PlayerSelectionPage
  