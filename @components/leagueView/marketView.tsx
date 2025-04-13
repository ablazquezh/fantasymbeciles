import React, { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, TablePagination, Paper, Button } from "@mui/material";
import { players } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from 'next';
import CollapsableCard from "../primitive/MovableCard"; // Ruta del componente
import { PrismaClient, Prisma, users, leagues } from "@prisma/client";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot} from "@hello-pangea/dnd";
import Row from "../primitive/Row"
import mergeData from '@/@components/utils/mergeData';
import reshapeData from '@/@components/utils/reshapeData';
import CustomDropdownSelect from '@/@components/primitive/CustomDropdown';
import MinMax from '@/@components/primitive/MinMax';
import { RowData } from '@/@components/types/RowData';
import { ParticipantsFull } from '../types/ParticipantsFull';
import groupPlayerData from '../utils/groupPlayerData';

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
    setCompleteLeagueTeams: React.Dispatch<React.SetStateAction<ParticipantsFull[]>>;
    completeLeagueTeams: ParticipantsFull[];
}

//const PlayerSelectionPage: NextPage<PlayerSelectProps> = ({dbleague, participants}) => {
const MarketView: React.FC<PlayerSelectProps> = ({dbleague, participants, completeLeagueTeams, setCompleteLeagueTeams}) => {

  console.log(participants)
  const router = useRouter();
  const { leagueId } = router.query;
  const [league, setLeague] = useState<string | null>(null);

  const [players, setPlayers] = useState<playersFull[]>([]);
  const [playerPositions, setPlayerPositions] = useState([]);    
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);


  // CUSTOM DROPDOWN CONTROL
  const [selected, setSelected] = useState<string[]>([]); 
  // CUSTOM DROPDOWN CONTROL

  // MIN-MAX CONTROL
  const [minValue, setMinValue] = useState('0');
  const [maxValue, setMaxValue] = useState('99');
  // MIN-MAX CONTROL

  const isInvalidRange = minValue === '' || maxValue === '' || +minValue > +maxValue;

  const handleSend = async () => {

    setPage(0);

    const res = await fetch(`/api/players?page=${page + 1}&pageSize=${rowsPerPage}&game=${dbleague.game}&minValue=${minValue}&maxValue=${maxValue}&positions=${selected}`);
    
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Something went wrong');

    setPlayers(data.data);
    setTotal(data.total);
  };

  useEffect(() => {
    if (leagueId) {
        setLeague(leagueId as string);
    }
  }, [leagueId]);


  useEffect(() => {
    const fetchPlayers= async () => {
        const res = await fetch(`/api/players?page=${page + 1}&pageSize=${rowsPerPage}&game=${dbleague.game}&minValue=${minValue}&maxValue=${maxValue}&positions=${selected}`);
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
    players: completeLeagueTeams.find(item2 => item2.team_id === item.team_id)?.players // Empty array for 'items'
  })))

  const handleOnDragEnd = (result: DropResult) => {
      const { source, destination } = result;
      
      if (!destination) return; // If dropped outside
  
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return; // If dropped in the same place
      }
      
      let inputPlayer = null
      if(source.droppableId == "mainTable"){
        inputPlayer = completePlayerInfo[source.index]
      }else{
        const foundItem = participantData.find(item => item.team_name === source.droppableId)
        inputPlayer = foundItem.players[source.index]
      }
      
      // Apart from this -> setCompleteLeagueTeams
      const playerCopy = JSON.parse(JSON.stringify(inputPlayer));
      delete playerCopy.teams;
      setCompleteLeagueTeams(prevData =>
        prevData.map(participant => {
          if (participant.team_name === destination.droppableId) {
            // If the participant matches, add the new player to the 'players' array

            if (participant.players.some(item => item.nickname === inputPlayer?.nickname)){
              // If that participant already contains the player, do nothing
              return participant
            }

            return {
              ...participant,
              players: [...participant.players, playerCopy], // Add the new player
              groupedPlayers: groupPlayerData([...participant.players, playerCopy])
            };
          }else{

            if (participant.players.some(item => item.nickname === inputPlayer.nickname)){
              // If that player was assigned to other participant, it should be dropped from the previous one
              
              return {
                ...participant,
                players: participant.players.filter(
                  item => item.nickname?.toLowerCase() !== inputPlayer.nickname?.toLowerCase()
                ),
                groupedPlayers: groupPlayerData(participant.players.filter(
                    item => item.nickname?.toLowerCase() !== inputPlayer.nickname?.toLowerCase()
                  ))
              };
            }
          }

          // Otherwise, return the participant unchanged
          return participant;
        })
      );


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

  const handleOnSelect = (team_name: string, player: RowData) => {

    // Apart from this -> setCompleteLeagueTeams
    setCompleteLeagueTeams(prevData =>
        prevData.map(participant => {
          if (participant.team_name === team_name) {
            // If the participant matches, add the new player to the 'players' array
  
            return {
              ...participant,
              players: [...participant.players, player], // Add the new player
              groupedPlayers: groupPlayerData([...participant.players, player])
            };
          }else{
            
            if (participant.players.some(item => item.nickname === player.nickname)){
              // If that player was assigned to other participant, it should be dropped from the previous one
              
              return {
                ...participant,
                players: participant.players.filter(
                  item => item.nickname?.toLowerCase() !== player.nickname?.toLowerCase()
                ),
                groupedPlayers: groupPlayerData(participant.players.filter(
                    item => item.nickname?.toLowerCase() !== player.nickname?.toLowerCase()
                  ))
              };
            }
          }
  
          // Otherwise, return the participant unchanged
          return participant;
        })
      );

    setParticipantData(prevData =>
      prevData.map(participant => {
        if (participant.team_name === team_name) {
          // If the participant matches, add the new player to the 'players' array

          return {
            ...participant,
            players: [...participant.players, player] // Add the new player
          };
        }else{
          
          if (participant.players.some((item:playersFull) => item.nickname === player.nickname)){
            // If that player was assigned to other participant, it should be dropped from the previous one
            
            return {
              ...participant,
              players: participant.players.filter(
                (item:playersFull) => item.nickname?.toLowerCase() !== player.nickname?.toLowerCase()
              ) // Add the new player
            };
          }
        }

        // Otherwise, return the participant unchanged
        return participant;
      })
    );
    
  };

  const handleRemovePlayer = (participantIndex: number, playername: string) => {

    // Apart from this -> setCompleteLeagueTeams
    setCompleteLeagueTeams(prevData => {
        const newData = [...prevData];
        const participant = newData[participantIndex];
    
        if (!participant) return prevData;
    
        const updatedPlayers = participant.players.filter(
          player => player.nickname !== playername
        );
    
        newData[participantIndex] = {
          ...participant,
          players: updatedPlayers,
          groupedPlayers: groupPlayerData(updatedPlayers)
        };
    
        return newData;
      });

    setParticipantData(prevData => {
      const newData = [...prevData];
      const participant = newData[participantIndex];
  
      if (!participant) return prevData;
  
      const updatedPlayers = participant.players.filter(
        (player: playersFull) => player.nickname !== playername
      );
  
      newData[participantIndex] = {
        ...participant,
        players: updatedPlayers,
      };
  
      return newData;
    });
  };


console.log(participantData)

    return (
      <Box sx={{
        margin: "auto",
        width: "60%",
        display: "flex",
        flexDirection: "column",
        position: "relative"
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
                        <TableCell sx={{fontWeight: "bold", textAlign: "center", borderLeft: '1px solid rgba(0, 0, 0, 0.12)' }} colSpan={2}>
                          Traspaso
                        </TableCell>
                      </TableRow>
                    </TableHead>


                    <TableBody sx={{backgroundColor: '#fafafa'}}>
                        {shapedData.map((row, index) => (
                          <Draggable key={row.ID} draggableId={String(row.ID)} index={index}>
                            {(provided, snapshot) => {
                        
                              return(
                                <Row key={row.nickname} row={row} gamekey={dbleague.game} provided={provided} 
                                  snapshot={snapshot} teams={participants.map(part => part.team_name)} onSelect={handleOnSelect} 
                                  selectedTeam={participantData.find(x =>
                                    x.players.some((aItem: RowData) => aItem.nickname === row.nickname)
                                  )?.team_name || 'Sin traspaso'} />
                            )}}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                    </TableBody>
                    
                  </Table>

                </TableContainer>
            
              )}
                      
            </Droppable>

            <Box display="flex" marginTop={2} gap={2} sx={{ justifyContent: "center", alignItems: "center", }} >
              
              <MinMax minValue={minValue} maxValue={maxValue} setMinValue={setMinValue} setMaxValue={setMaxValue} />
              <CustomDropdownSelect selected={selected} setSelected={setSelected} />

              <Button
                variant="contained"
                color="primary"
                disabled={isInvalidRange}
                onClick={handleSend}
                sx={{ marginLeft: 5 }}
              >
                Filtrar
              </Button>

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
                sx={{margin: "auto", marginRight: 0}}
              />
            </Box>

          </Paper>
          
          <CollapsableCard participants={participantData} gamekey={dbleague.game} handleRemovePlayer={handleRemovePlayer} />
          
        </DragDropContext>
      </ Box>
    )
  }
  
  export default MarketView