import React, { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from "next/router";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, TablePagination, Paper, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";
import { players, team_budget } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from 'next';
import CollapsableCard from "../@components/primitive/MovableCard"; // Ruta del componente
import { PrismaClient, Prisma, users, leagues } from "@prisma/client";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot} from "@hello-pangea/dnd";
import Row from "../@components/primitive/Row"
import mergeData from '@/@components/utils/mergeData';
import reshapeData from '@/@components/utils/reshapeData';
import CustomDropdownSelect from '@/@components/primitive/CustomDropdown';
import MinMax from '@/@components/primitive/MinMax';
import { RowData } from '@/@components/types/RowData';
import { ParticipantsFull } from '@/@components/types/ParticipantsFull';
import reshapeLeagueTeams from '@/@components/utils/reshapeLeagueTeams';
import groupPlayerData from '@/@components/utils/groupPlayerData';
import NegotiationModal from '@/@components/primitive/NegotiationModal';

const prisma = new PrismaClient();

interface participant {
  participant_id: number;
  user_name: string;
  team_name: string;
  team_id: number;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  const {leagueId} = context.query as {leagueId?: string};

  const dbleague: leagues | null = await prisma.leagues.findUnique({
    where: {ID: Number(leagueId)}
  }
  );

  const participants: participant[] = await prisma.$queryRaw`
          SELECT participant_id, user_name, team_name, team_id FROM league_participants_view WHERE game = ${dbleague?.game} AND league_ID_fk = ${dbleague?.ID}
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
interface leagueTeams {
  player_id: number;
  team_id: number;
  player_name: string;
  team_name: string;
}

const PlayerSelectionPage: NextPage<PlayerSelectProps> = ({dbleague, participants}) => {
  const router = useRouter();
  const { leagueId } = router.query;
  const [league, setLeague] = useState<string | null>(null);

  const [players, setPlayers] = useState<playersFull[]>([]);
  const [playerPositions, setPlayerPositions] = useState([]);    
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // PRO STRUCTURES
  const [proleagueteams, setProleagueTeams] = useState<leagueTeams[]>([]);
  const [team_budgets, setTeamBudgets] = useState<team_budget[]>([])

  // CUSTOM DROPDOWN CONTROL
  const [selected, setSelected] = useState<string[]>([]); 

  // PLAYER NAME FILTER
  const [nameFilter, setNameFilter] = useState<string>(""); 

  // MIN-MAX CONTROL
  const [minValue, setMinValue] = useState('0');
  const [maxValue, setMaxValue] = useState('99');
  // MIN-MAX CONTROL

  const isInvalidRange = minValue === '' || maxValue === '' || +minValue > +maxValue;

  const handleSend = async () => {

    setPage(0);

    const res = await fetch(`/api/players?page=${page + 1}&pageSize=${rowsPerPage}&game=${dbleague.game}&minValue=${minValue}&maxValue=${maxValue}&positions=${selected}&playerName=${nameFilter}`);
    
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Something went wrong');

    setPlayers(data.data);
    setTotal(data.total);
  };

  useEffect(() => {
    if(dbleague.type === "pro"){
      const fetchProteams= async () => {
        const res = await fetch(`/api/proleagueteams?teamIds=${participants.map((item: participant) => item.team_id).join(",")}`);
        const data = await res.json();

        setProleagueTeams(data);   

      const fetchTeamBudgets = async () => {
          const res = await fetch(`/api/teambudgets?game=${dbleague.game}&idList=${participants.map((item: participant) => item.team_id).join(",")}`);
          const data = await res.json();

          data.teams.forEach((obj: team_budget) => {
            if (Number(obj.team_avg_std!) >= 80) {
              obj.budget! *= dbleague.big_team_multiplier!;
            } else if (Number(obj.team_avg_std!) >= 75) {
              obj.budget! *= dbleague.medium_team_multiplier!;
            } else {
              obj.budget! *= dbleague.small_team_multiplier!;
            }
          });
        

          setTeamBudgets(data.teams);
      };

      fetchTeamBudgets();
    };

    fetchProteams();
    }
  }, [participants]);
  useEffect(() => {
    if(proleagueteams.length > 0){
      
      const fetchPlayers= async () => {
        
        const res = await fetch(`/api/playersbyid?idList=${proleagueteams.map(item => item.player_id)}`);
        const data = await res.json();
  
        const res2 = await fetch(`/api/playerpositions?game=${dbleague.game}&idList=${proleagueteams.map(item => item.player_id)}`);
        const data2 = await res2.json();
          
        const completePlayerInfo = mergeData(data.data, data2.positions)
        const shapedData = reshapeData(completePlayerInfo)

        if (!Array.isArray(shapedData) || shapedData.length === 0) return;
        const participants = reshapeLeagueTeams(proleagueteams, shapedData)
    
        const transformed = participants.map((participant) => ({
        ...participant,
        groupedPlayers: groupPlayerData(participant.players),
        }));
        
        setParticipantData(participants)//transformed)
      }
      fetchPlayers();
    }
  }, [proleagueteams]);

  useEffect(() => {
    if (leagueId) {
        setLeague(leagueId as string);
    }
  }, [leagueId]);


  useEffect(() => {
    const fetchPlayers= async () => {
        const res = await fetch(`/api/players?page=${page + 1}&pageSize=${rowsPerPage}&game=${dbleague.game}&minValue=${minValue}&maxValue=${maxValue}&positions=${selected}&playerName=${nameFilter}`);
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

  const { prompt, Modal } = NegotiationModal();
  const handleOnDragEnd = async(result: DropResult) => {
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

      let allowance = true;

    if(dbleague.type === "pro"){
      let newBudget = team_budgets!.find(item => item.team_name === destination.droppableId)?.budget!;// - inputPlayer.value!
      let result = null;
      if(source.droppableId !== "mainTable"){
        result = await prompt(inputPlayer.value);

        if(result !== -1){
          newBudget = newBudget - Number(result);
          if(newBudget >= 0){
            const newSellerBudget = team_budgets!.find(item => item.team_name === source.droppableId)?.budget! + Number(result);//+ inputPlayer.value!
            setTeamBudgets(prevItems =>
              prevItems.map(item =>
                item.team_name === source.droppableId
                  ? { ...item, budget: newSellerBudget } // update X if A matches
                  : item                      // otherwise keep the same
              )
            );
          }
          }
      }else{

        const prevSelected = participantData.find(x =>
          x.players.some((aItem: RowData) => aItem.nickname === inputPlayer.nickname)
        )?.team_name || 'Sin traspaso'

        if(prevSelected !== "Sin traspaso"){
          result = await prompt(inputPlayer.value);

          if(result !== -1){
            newBudget = newBudget - Number(result);
            
            if(newBudget >= 0){
              const newSellerBudget = team_budgets!.find(item => item.team_name === prevSelected)?.budget! + Number(result);//inputPlayer.value!
              setTeamBudgets(prevItems =>
                prevItems.map(item =>
                  item.team_name === prevSelected
                    ? { ...item, budget: newSellerBudget } // update X if A matches
                    : item                      // otherwise keep the same
                )
              );
            } 
          }
        }
      }

      if (result === null){
        newBudget = newBudget - inputPlayer.value!;
      }
      if (newBudget >= 0 && result !== -1){
        setTeamBudgets(prevItems =>
          prevItems.map(item =>
            item.team_name === destination.droppableId
              ? { ...item, budget: newBudget } // update X if A matches
              : item                      // otherwise keep the same
          )
        );
      }else{
        allowance = false;
      }
    }

    if(allowance){
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
    }
      
  };
  

  const handleOnSelect = async(team_name: string, player: RowData, prev?: string, ) => {

    // HERE WE ONLY HAVE PROPAGATED INFO FROM ROW IF IT IS NOT PRO MODE, OR IF IT IS PROMODE AND TWO DIFFERENT TEAMS NEGOTIATE
    let allowance = true;

    if(dbleague.type === "pro"){
      
      let newBudget = team_budgets!.find(item => item.team_name === team_name)?.budget!;// - inputPlayer.value!
      let result = null;

      if(prev !== "Sin traspaso" && team_name === "Sin traspaso"){
        // REMOVAL FROM TEAM OF THE LEAGUE
        const newSellerBudget = team_budgets!.find(item => item.team_name === prev)?.budget! + Number(player.value);//+ inputPlayer.value!
        setTeamBudgets(prevItems =>
          prevItems.map(item =>
            item.team_name === prev
              ? { ...item, budget: newSellerBudget } // update X if A matches
              : item                      // otherwise keep the same
          )
        );

      }else if (prev === "Sin traspaso" && team_name !== "Sin traspaso"){
        // SALE FROM MARKET TO TEAM OF THE LEAGUE
        
      }else if(team_name !== prev){
        result = await prompt(player.value!);

        if(result !== -1){
          newBudget = newBudget - Number(result);
          if(newBudget >= 0){
            const newSellerBudget = team_budgets!.find(item => item.team_name === prev)?.budget! + Number(result);//+ inputPlayer.value!
            setTeamBudgets(prevItems =>
              prevItems.map(item =>
                item.team_name === prev
                  ? { ...item, budget: newSellerBudget } // update X if A matches
                  : item                      // otherwise keep the same
              )
            );
          }
        }
      }

      if (result === null && newBudget !== undefined){
        // THE MODAL HASN'T OPENED -> IT WAS A BUY FROM MARKET OR IT WAS A SALE TO MARKET
        newBudget = newBudget - player.value!;
      }
      if (newBudget >= 0 && result !== -1){
        setTeamBudgets(prevItems =>
          prevItems.map(item =>
            item.team_name === team_name
              ? { ...item, budget: newBudget } // update X if A matches
              : item                      // otherwise keep the same
          )
        );
      }else if (newBudget !== undefined){
        allowance = false;
      }
      
    }
    
    if(allowance){

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
    }
  };

  const handleRemovePlayer = (participantIndex: number, playername: string) => {

    let allowance = true;

    if(dbleague.type === "pro"){
      const newBudget = team_budgets!.find(item => item.team_name === participantData[participantIndex].team_name)?.budget! + 
        participantData[participantIndex].players.find((item:playersFull) => item.nickname === playername).value!

      if (newBudget >= 0 ){
        setTeamBudgets(prevItems =>
          prevItems.map(item =>
            item.team_name === participantData[participantIndex].team_name
              ? { ...item, budget: newBudget } // update X if A matches
              : item                      // otherwise keep the same
          )
        );
      }else{
        allowance = false;
      }
    }

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

  const handleBeginLeague = async () => {

    const transferRecords = participantData.flatMap(pData =>
      pData.players.map((player: playersFull) => ({
        player_id_fk: Number(player.ID),
        team_id_fk: Number(pData.team_id),
        league_id_fk: Number(leagueId)
      }))
    );

    const budgetRecords = team_budgets.flatMap((bData: team_budget)=> 
    ({
      team_id: bData.team_id,
      team_name: bData.team_name,
      budget: bData.budget,  
      game: bData.game,
      league_id_fk: Number(leagueId)
    })
    )

    try {
      const response = await fetch("/api/createtransfers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: transferRecords }),
        });
      const data = await response.json();

        
      const response2 = await fetch("/api/createteambudgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: budgetRecords }),
        });      
      const data2 = await response2.json();

  
      if (response.ok && response2.ok) {
        console.log("Success:", data, data2);
        router.push(`/league?leagueId=${leagueId}`);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  console.log("***********")
  console.log(participantData)





    return (
      <Box sx={{
        margin: "auto",
        width: "60%",
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}>

        <Button variant="contained" color="primary" disabled={false}
          sx={{ width: 150, ml: "calc(100% - 150px)", position: 'absolute', top: '20px', right: '8px', }}
          onClick={() => handleBeginLeague()}>
            empezar liga
        </Button>

        <DragDropContext onDragEnd={handleOnDragEnd}>

          <Paper sx={{ padding: 4, paddingBottom: 2, marginTop: 10 }}>
            

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
                        {dbleague.type === "pro" &&
                          <TableCell sx={{fontWeight: "bold", textAlign: "center", }}>
                              Precio
                          </TableCell>
                        }
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
                                <Row key={row.nickname} dbleague={dbleague} row={row} gamekey={dbleague.game} provided={provided} 
                                  snapshot={snapshot} teams={participants.map(part => part.team_name)} onSelect={handleOnSelect} team_budgets={team_budgets}
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

              <TextField
                label="Nombre de jugador"
                variant="outlined"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                inputProps={{
                  sx: {
                    height: 2, // your custom height in pixels
                    alignItems: 'center', // Ensures input content is centered
                  },
                  pattern: '[A-Za-z]*'
                }}
                InputLabelProps={{
                  sx: {
                    color: 'gray',
                  },
                  shrink: true, // Prevent label from floating
                }}
                sx={{width: "15%", marginLeft: 2 }}
              />

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
          {dbleague.type === "pro" ?
            <CollapsableCard team_budgets={team_budgets} dbleague={dbleague} participants={participantData} gamekey={dbleague.game} handleRemovePlayer={handleRemovePlayer} /> :
            <CollapsableCard dbleague={dbleague} participants={participantData} gamekey={dbleague.game} handleRemovePlayer={handleRemovePlayer} />
          }
        </DragDropContext>
        <>
        {Modal}
        </>
      </ Box>
    )
  }
  
  export default PlayerSelectionPage