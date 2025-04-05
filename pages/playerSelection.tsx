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
    
    const [participantData, setParticipantData] = useState(participants.map(item => ({
      ...item,
      players: [] as playersFull[] // Empty array for 'items'
    })))

    const handleOnDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        console.log(source)
        console.log(destination)
       
        if (!destination) return; // If dropped outside
    
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
          return; // If dropped in the same place
        }
        
        let inputPlayer = null
        if(source.droppableId == "mainTable"){
          inputPlayer = players[source.index]
        }else{
          const foundItem = participantData.find(item => item.team_name === source.droppableId)
          inputPlayer = foundItem.players[source.index]
        }

        console.log(inputPlayer)

        setParticipantData(prevData =>
          prevData.map(participant => {
            if (participant.team_name === destination.droppableId) {
              // If the participant matches, add the new player to the 'players' array

              if (participant.players.some((item:playersFull) => item.nickname === inputPlayer?.nickname)){
                // If that participant already contains the player, do nothing
                return participant
              }

              return {
                ...participant,
                players: [...participant.players, inputPlayer] // Add the new player
              };
            }else{

              if (participant.players.some((item:playersFull) => item.nickname === inputPlayer.nickname)){
                // If that player was assigned to other participant, it should be dropped from the previous one
                
                return {
                  ...participant,
                  players: participant.players.filter(
                    (item:playersFull) => item.nickname?.toLowerCase() !== inputPlayer.nickname?.toLowerCase()
                  ) // Add the new player
                };
              }
            }

            // Otherwise, return the participant unchanged
            return participant;
          })
        );
        
        
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
          
          <CollapsableCard participants={participantData} gamekey={dbleague.game} />
          
        </DragDropContext>
      </ Box>
    )
  }
  
  export default PlayerSelectionPage
  