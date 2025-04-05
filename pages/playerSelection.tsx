import React, { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, TablePagination, Paper } from "@mui/material";
import { players } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from 'next';
import CollapsableCard from "../@components/primitive/MovableCard"; // Ruta del componente
import { PrismaClient, Prisma, users, leagues } from "@prisma/client";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot} from "@hello-pangea/dnd";
import Row from "../@components/primitive/Row"
import mergeData from '@/@components/utils/mergeData';
import reshapeData from '@/@components/utils/reshapeData';

const prisma = new PrismaClient();

export async function getServerSideProps(context: GetServerSidePropsContext) {

  const {leagueId} = context.query as {leagueId?: string};

  const dbleague: leagues | null = await prisma.leagues.findUnique({
    where: {ID: Number(leagueId)}
  }
  );

  const participants = await prisma.$queryRaw`
          SELECT participant_id, user_name, team_name FROM league_participants_view WHERE game = ${dbleague?.game} AND league_ID_fk = ${dbleague?.ID}
      `;

  return { props: {
    dbleague: {
      ...dbleague,
      created_at: dbleague?.created_at ? dbleague.created_at.toISOString() : null,
    },
    participants: participants
  } };
}

// Custom column names
const globalColnames = {
  nickname: "Jugador",
  average: "Pt. Global",
  positions: "Posiciones",
  team_name: "Equipo de origen"
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

interface PlayerSelectProps {
  dbleague: leagues;
  participants: any[];
}


const PlayerSelectionPage: NextPage<PlayerSelectProps> = ({dbleague, participants}) => {

    //console.log(participants)
    //console.log(dbleague)
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
    

    const handleOnDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        console.log("*******")
        console.log(source)
        console.log(destination)
        console.log("*******")

        /*if (!destination) return; // If dropped outside
    
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
          return; // If dropped in the same place
        }
    
        let sourceData = source.droppableId === "mainTable" ? mainTableData : childTableData;
        let destinationData = destination.droppableId === "mainTable" ? mainTableData : childTableData;
    
        const [movedRow] = sourceData.splice(source.index, 1); // Remove the row from the source table
        destinationData.splice(destination.index, 0, movedRow); // Add the row to the destination table
        */
        
    };

    return (
      <Box sx={{
        margin: "auto",
        width: "60%",
        display: "flex",
        flexDirection: "column",
      }}>
        <DragDropContext onDragEnd={handleOnDragEnd}>

          <Paper sx={{ padding: 4, marginTop: 10 }}>
            

            <Droppable droppableId="mainTable" isDropDisabled={true}>
              {(provided, snapshot) => (

                <TableContainer sx={{ minHeight: "200px", maxHeight: "550px", overflowY: "auto" }} ref={provided.innerRef}
                  {...provided.droppableProps}>

                  <Table stickyHeader>

                    <TableHead>
                      <TableRow>
                        <TableCell />
                        {Object.keys(globalColnames).map((col) => (
                          <TableCell
                            key={col}
                            sx={{
                              fontWeight: "bold",
                              textAlign: "center"
                            }}
                          >
                            {globalColnames[col as keyof typeof globalColnames]}
                          </TableCell>
                        ))}
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>


                    <TableBody sx={{backgroundColor: '#fafafa'}}>
                        {shapedData.map((row, index) => (
                          <Draggable key={row.ID} draggableId={String(row.ID)} index={index}>
                            {(provided, snapshot) => {
                        
                              return(
                                <Row key={row.nickname} row={row} gamekey={dbleague.game} provided={provided} snapshot={snapshot}/>
                            )}}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                    </TableBody>
                    
                  </Table>

                </TableContainer>
            
              )}
                      
            </Droppable>

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
          
          <CollapsableCard participants={participants} gamekey={dbleague.game} />
          
        </DragDropContext>
      </ Box>
    )
  }
  
  export default PlayerSelectionPage
  