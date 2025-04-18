import React, { useEffect, useState, useRef} from 'react'
import { useRouter } from "next/router";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, Divider, Paper, Button } from "@mui/material";
import { GetServerSidePropsContext, NextPage } from 'next';
import { PrismaClient, Prisma, users, leagues, matches, players, goals, cards, injuries, team_budget } from "@prisma/client";
import generateRoundRobinSchedule from '@/@components/utils/scheduleGenerator';
import LeagueDashboard from '@/@components/leagueView/leagueDashboard';
import mergeData from '@/@components/utils/mergeData';
import reshapeData from '@/@components/utils/reshapeData';
import TeamsView from '@/@components/leagueView/teamsView';
import { MatchInfo } from '@/@components/types/MatchInfo';
import { RowData } from '@/@components/types/RowData';
import { TeamWithPlayers } from '@/@components/types/TeamWithPlayers';
import MatchInfoDashboard from '@/@components/leagueView/matchInfo';
import groupPlayerData from '@/@components/utils/groupPlayerData';
import { ParticipantsFull } from '@/@components/types/ParticipantsFull';
import { Schedule } from '@/@components/types/Schedule';
import { MatchRecords } from '@/@components/types/MatchRecords';
import generateScheduleFromDB from '@/@components/utils/scheduleGeneratorDB';
import { GoalRecords } from '@/@components/types/GoalRecords';
import matchRecordGenerator from '@/@components/utils/matchRecordGenerator';
import goalRecordGenerator from '@/@components/utils/goalRecordGenerator';
import { CardRecords } from '@/@components/types/CardRecords';
import cardRecordGenerator from '@/@components/utils/cardRecordGenerator';
import injuryRecordGenerator from '@/@components/utils/injuryGenerator';
import { InjuryRecords } from '@/@components/types/InjuryRecords';
import MarketView from '@/@components/leagueView/marketView';
import reshapeLeagueTeams from '@/@components/utils/reshapeLeagueTeams';

const prisma = new PrismaClient();

export async function getServerSideProps(context: GetServerSidePropsContext) {

  const {leagueId} = context.query as {leagueId?: string};

  const dbleague: leagues | null = await prisma.leagues.findUnique({
    where: {ID: Number(leagueId)}
  }
  );

  const dbmatches: matches[] | null = await prisma.matches.findMany({
    where: {league_id_fk: Number(leagueId)}
  }
  );

  const dbgoals: goals[] | null = await prisma.goals.findMany({
    where: {matches: {league_id_fk: Number(leagueId)}} ,
    include: {
      matches: true
    }
  }
  );

  const dbinjuries: injuries[] | null = await prisma.injuries.findMany({
    where: {matches: {league_id_fk: Number(leagueId)}} ,
    include: {
      matches: true
    }
  }
  );

  const dbcards: cards[] | null = await prisma.cards.findMany({
    where: {matches: {league_id_fk: Number(leagueId)}} ,
    include: {
      matches: true
    }
  }
  );

  const leagueTable: LeagueTable[] = await prisma.$queryRaw`
    SELECT * FROM league_table WHERE league_id = ${dbleague?.ID}
  `;

  const topScorers = await prisma.$queryRaw`
    SELECT player_name, team_name, goals FROM top_scorers_by_league WHERE league_id = ${dbleague?.ID} AND goals > 0
  `;

  const leagueTeams = await prisma.$queryRaw`
    SELECT * FROM raw_league_teams WHERE league_id = ${dbleague?.ID} AND team_id in (${Prisma.join(leagueTable.map((item: LeagueTable) => item.team_id))})
  `;

  const participants = await prisma.$queryRaw`
      SELECT participant_id, user_name, team_name, team_id FROM league_participants_view WHERE game = ${dbleague?.game} AND league_ID_fk = ${dbleague?.ID}
  `;

  return { props: {
    dbleague: {
      ...dbleague,
      created_at: dbleague?.created_at ? dbleague.created_at.toISOString() : null,
    },
    topScorers: topScorers,
    leagueTable: leagueTable,
    dbmatches: dbmatches,
    leagueTeams: leagueTeams,
    dbcards: dbcards,
    dbgoals: dbgoals,
    dbinjuries: dbinjuries,
    participants: participants
  } };
}

interface TopScorers {
  league_id: number ;
  league_name: string ;
  player_id: number ;
  player_name: string;
  team_name: string ;
  goals: number;
}

interface LeagueTable {
  league_id: number ;
  league_name: string ;
  team_id: number ;
  team_name: string ;
  n_played_matches: number;
  victories: number ;
  draws: number ;
  loses: number;
  points: number;
  goals_favor: number ;
  goals_against: number ;
  goal_diff: number;
  yellow_cards: number;
  red_cards: number;
}

interface LeagueProps {
  dbleague: leagues;
  topScorers: TopScorers[];
  leagueTable: any[];
  dbmatches: matches[];
  leagueTeams: any[];
  dbcards: cards[];
  dbgoals: goals[];
  dbinjuries: injuries[];
  participants: any[];
}

interface leagueTeams {
  player_id: number;
  team_id: number;
  player_name: string;
  team_name: string;
}

const LeaguePage: NextPage<LeagueProps> = ({dbleague, topScorers, leagueTable, dbmatches, leagueTeams, dbcards, dbgoals, dbinjuries, participants}) => {

  const [topScorersInfo, setTopScorers] = useState<TopScorers[]>(topScorers)
  const [leagueTableInfo, setLeagueTable] = useState<LeagueTable[]>(leagueTable)
  const [leagueTeamsInfo, setLeagueTeams] = useState<leagueTeams[]>(leagueTeams)

  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [view, setView] = useState<string>("home")

  const [matchInfo, setMatchInfo] = useState<MatchInfo|null>(null)
  const [matchIndex, setMatchIndex] = useState<number|null>(null)
  const [matchRound, setMatchRound] = useState<boolean|null>(null)
  const [matchDay, setMatchDay] = useState<number|null>(null)

  const [players, setPlayers] = useState<RowData[]>([]);

  const [completeLeagueTeams, setCompleteLeagueTeams] = useState<ParticipantsFull[]>([]);
  
  const [updatedGoals, setUpdatedGoals] = useState<boolean>(false);
  const [updatedMatches, setUpdatedMatches] = useState<boolean>(false);

  const [transferRecords, setTransferRecords] = useState<any[]>([])
  const [budgetRecords, setBudgetRecords] = useState<any[]>([])

  useEffect(() => {

    const playerIds = leagueTeamsInfo.map(item => item.player_id);

    const fetchPlayers= async () => {
      const res = await fetch(`/api/playersbyid?idList=${playerIds}`);
      const data = await res.json();

      const res2 = await fetch(`/api/playerpositions?game=${dbleague.game}&idList=${playerIds}`);
      const data2 = await res2.json();
        
      const completePlayerInfo = mergeData(data.data, data2.positions)
      const shapedData = reshapeData(completePlayerInfo)
      setPlayers(shapedData);
  };

  fetchPlayers();

  }, [leagueTeams]);

  useEffect(() => {
    if (!Array.isArray(players) || players.length === 0) return;
    const participants = reshapeLeagueTeams(leagueTeamsInfo, players)

    const transformed = participants.map((participant) => ({
    ...participant,
    groupedPlayers: groupPlayerData(participant.players),
    }));
    setCompleteLeagueTeams(transformed)
  }, [players]);

  const hasRun = useRef(false);
  useEffect(() => {
    
    if (hasRun.current) return;
    hasRun.current = true;
    if(dbmatches.length === 0){
      if(schedule === null){
      const generatedSchedule = generateRoundRobinSchedule(leagueTableInfo.map(team => team.team_name))
      console.log(generatedSchedule)
      setSchedule( generatedSchedule )

      // PUSH MATCHES
      const matchRecords: MatchRecords[] = matchRecordGenerator(generatedSchedule, leagueTableInfo, leagueId as string);
      
      const postMatches = async () => {
        console.log("insert")
        try {
          const response = await fetch("/api/creatematches", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ records: matchRecords }),
            });
      
          const data = await response.json();
      
          if (response.ok) {
            console.log("Success:", data);
          } else {
            console.error("Error:", data.error);
          }
        } catch (error) {
          console.error("Request failed:", error);
        }
      }
      postMatches()

    }
      /*if(schedule !== null){
        postMatches()
      }*/
      
    }else{
      console.log("Loaded matches")
      const generatedSchedule = generateScheduleFromDB(dbmatches, dbcards, dbgoals, dbinjuries, leagueTableInfo, completeLeagueTeams)
      console.log(generatedSchedule)
      setSchedule( generatedSchedule )
      // Means that there were results stored in the DB and here we must reshape them
    }
  }, [dbmatches, completeLeagueTeams]);


  useEffect(() => {
    // Select the parent and child elements
    const parent = document.querySelector('.parent') as HTMLElement | null;
    const child = document.querySelector('.child') as HTMLElement | null;
    const content = document.querySelector('.content') as HTMLElement | null;

    // Make sure the elements exist before accessing their properties
    if (parent && child && content) {
      // Get the height of content and child
      const contentHeight = content.offsetHeight;
      const childHeight = child.offsetHeight;

      // Update the parent height based on the content and child heights
      parent.style.height = `${contentHeight + childHeight + 70}px`;
    }
      
  }, [schedule]);

  const router = useRouter();
  const { leagueId } = router.query;

  const handleMatchClick = (matchInfo: MatchInfo, matchIndex: number, matchRound: boolean, matchDay: number) => {
    setMatchInfo(matchInfo);
    setMatchIndex(matchIndex);
    setMatchRound(matchRound);
    setMatchDay(matchDay)
    setView("match");
  };

  const handleBackClick = (view: string) => {

    //setMatchInfo(null);
    if(view === "match"){
      // POST GOALS
      const goalRecords: GoalRecords[] = goalRecordGenerator(schedule!, leagueTableInfo, leagueTeamsInfo);
      
      const postGoals = async () => {
        try {
          const response = await fetch("/api/creategoals", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ records: goalRecords }),
            });
      
          const data = await response.json();
      
          if (response.ok) {
            console.log("Success:", data);
            setUpdatedGoals(true)
          } else {
            console.error("Error:", data.error);
          }
        } catch (error) {
          console.error("Request failed:", error);
        }
      }
      postGoals()

      // POST CARDS
      const cardRecords: CardRecords[] = cardRecordGenerator(schedule!, leagueTableInfo, leagueTeamsInfo);

      const removeRecords = dbcards.filter(aObj => 
        !cardRecords.some(bObj => bObj.match_id_fk === aObj.match_id_fk && bObj.player_id_fk === aObj.player_id_fk)
      ).map(item => item.ID);

      const removeCards = async () => {
        try {
          const response = await fetch("/api/removecards", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idList: removeRecords }),
            });
      
          const data = await response.json();
      
          if (response.ok) {
            console.log("Success:", data);
          } else {
            console.error("Error:", data.error);
          }
        } catch (error) {
          console.error("Request failed:", error);
        }
      }

      const postCards = async () => {
        try {
          const response = await fetch("/api/createcards", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ records: cardRecords }),
            });
      
          const data = await response.json();
      
          if (response.ok) {
            console.log("Success:", data);
          } else {
            console.error("Error:", data.error);
          }
        } catch (error) {
          console.error("Request failed:", error);
        }
      }
      postCards()
      removeCards()


      // POST CARDS
      const injuryRecords: InjuryRecords[] = injuryRecordGenerator(schedule!, leagueTableInfo, leagueTeamsInfo);
      
      const removeInjuryRecords = dbinjuries.filter(aObj => 
        !injuryRecords.some(bObj => bObj.match_id_fk === aObj.match_id_fk && bObj.player_id_fk === aObj.player_id_fk)
      ).map(item => item.ID);

      const removeInjuries = async () => {
        try {
          const response = await fetch("/api/removeinjuries", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idList: removeInjuryRecords }),
            });
      
          const data = await response.json();
      
          if (response.ok) {
            console.log("Success:", data);
          } else {
            console.error("Error:", data.error);
          }
        } catch (error) {
          console.error("Request failed:", error);
        }
      }

      const postInjuries = async () => {
        try {
          const response = await fetch("/api/createinjuries", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ records: injuryRecords }),
            });
      
          const data = await response.json();
      
          if (response.ok) {
            console.log("Success:", data);
          } else {
            console.error("Error:", data.error);
          }
        } catch (error) {
          console.error("Request failed:", error);
        }
      }
      postInjuries()
      removeInjuries()

    }else if(view === "market"){

      // Insert transfer records in DB and re-set league teams
      const postTransfers = async () => {

        const response = await fetch("/api/createtransfers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: transferRecords }),
        });

        const response3 = await fetch("/api/createteambudgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: budgetRecords }),
        });
    
        const data3 = await response3.json();

        if (response.ok && response3.ok) {
          const error = await response.text();
          console.error("Transfer creation failed:", error);
          return;
        }
    
        const transferData = await response.json();
  
  
        if (!transferData?.count) {
          console.error("Transfer creation response missing count:", transferData);
          return;
        }
        
        const response2 = await fetch(`/api/leagueteams?leagueId=${leagueId}&teamIds=${leagueTable.map((item: LeagueTable) => item.team_id).join(",")}`);
                  
        if (!response2.ok) {
          const error = await response2.text();
          console.error("League teams GET failed:", error);
          return;
        }
        const leagueteamsUpdated = await response2.json();
        if (!leagueteamsUpdated) {
          console.error("League teams GET failed.");
          return;
        }
        console.log("________")
        console.log(leagueteamsUpdated)
        setLeagueTeams(leagueteamsUpdated);


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
            console.log("Success:", data);
          } else {
            console.error("Error:", data.error);
          }
        } catch (error) {
          console.error("Request failed:", error);
        }
      }
      postTransfers()
      setTransferRecords([]);
    }
    setView("home"); // may possibly need to update the matchinfo
  };

  const handleTeamsClick = () => {
    setView("teams"); // may possibly need to update the matchinfo
  };
  const handleMarketClick = () => {
    setView("market"); // may possibly need to update the matchinfo
  };

  useEffect(() => {

    if(schedule){
      const matchRecords: MatchRecords[] = matchRecordGenerator(schedule, leagueTableInfo, leagueId as string);
      const postMatches = async () => {
        try {
          const response = await fetch("/api/upsertmatches", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ records: matchRecords }),
            });
      
          const data = await response.json();
      
          if (response.ok) {
            console.log("Success:", data);
            setUpdatedMatches(true)
          } else {
            console.error("Error:", data.error);
          }
        } catch (error) {
          console.error("Request failed:", error);
        }
    }
    postMatches()
  }
  
  setUpdatedGoals(false)

  }, [updatedGoals]);


  useEffect(() => {

    const fetchClassification= async () => {
      try {
        const response = await fetch(`/api/leaguetable?leagueId=${dbleague.ID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch top scorers');
        }
    
        const leagueTable: LeagueTable[] = await response.json();

        setLeagueTable(leagueTable);
      } catch (error) {
        console.error(error);
        // Handle error (e.g., show a message to the user)
      }
    };
    fetchClassification();

    const fetchTopScorers= async () => {
      try {
        const response = await fetch(`/api/topscorers?leagueId=${dbleague.ID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch top scorers');
        }
    
        const topScorers: TopScorers[] = await response.json();

        setTopScorers(topScorers);
      } catch (error) {
        console.error(error);
        // Handle error (e.g., show a message to the user)
      }
    };
    fetchTopScorers();

    
    setUpdatedMatches(false)

  }, [updatedMatches]);


  console.log(schedule)
  return (
    <Box sx={{
      margin: "auto",
      width: "85%",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }}>

      {view !== "home" && 
        <Button 
          variant="contained"
          onClick={() => handleBackClick(view)} 
          sx={{ cursor: 'pointer', color: 'primary', width: 150, position: 'absolute', top: '20px', }}
        >
          Atrás
        </Button>
      }
      <Button variant="contained" color="primary" disabled={false}
        sx={{ width: 150, position: 'absolute', top: '20px', right: 'calc(0% + 180px)', }}
        onClick={handleTeamsClick} 
      >            
        ver equipos
      </Button>
      <Button variant="contained" color="primary" disabled={false}
        sx={{ width: 150, position: 'absolute', top: '20px', right: '0%', }}
        onClick={handleMarketClick} 
      >            
        mercado
      </Button>

      {schedule && view === "home" ? (
        <LeagueDashboard dbleague={dbleague} topScorers={topScorersInfo} leagueTable={leagueTableInfo} dbmatches={dbmatches} 
          leagueTeams={leagueTeamsInfo} handleMatchClick={handleMatchClick} schedule={schedule} />
      ) : view === "match" ? (
        <MatchInfoDashboard matchInfo={matchInfo!} matchIndex={matchIndex!} matchRound={matchRound!} matchDay={matchDay!} 
          completeLeagueTeams={completeLeagueTeams} game={dbleague.game!} setSchedule={setSchedule} schedule={schedule!} leagueInfo={dbleague} />
      ) : view === "teams" ? (
        <TeamsView participantData={completeLeagueTeams} game={dbleague.game}/>
      ) : view === "market" ? (
        <MarketView dbleague={dbleague} participants={participants} completeLeagueTeams={completeLeagueTeams} setCompleteLeagueTeams={setCompleteLeagueTeams}
          setTransferRecords={setTransferRecords} setBudgetRecords={setBudgetRecords}/> 
      ) : (
        <></>
      )}
      
    </ Box>
  )
}
  
  export default LeaguePage;