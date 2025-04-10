import React, { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, Divider, Paper, Button } from "@mui/material";
import { GetServerSidePropsContext, NextPage } from 'next';
import { PrismaClient, Prisma, users, leagues, matches, players } from "@prisma/client";
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

  const leagueTable = await prisma.$queryRaw`
    SELECT * FROM league_table WHERE league_id = ${dbleague?.ID}
  `;
  
  const topScorers = await prisma.$queryRaw`
    SELECT player_name, team_name, goals FROM top_scorers_by_league WHERE league_id = ${dbleague?.ID}
  `;

  const leagueTeams = await prisma.$queryRaw`
    SELECT * FROM raw_league_teams WHERE league_id = ${dbleague?.ID}
  `;

  return { props: {
    dbleague: {
      ...dbleague,
      created_at: dbleague?.created_at ? dbleague.created_at.toISOString() : null,
    },
    topScorers: topScorers,
    leagueTable: leagueTable,
    dbmatches: dbmatches,
    leagueTeams: leagueTeams
  } };
}

interface LeagueProps {
  dbleague: leagues;
  topScorers: any[];
  leagueTable: any[];
  dbmatches: matches[];
  leagueTeams: any[];
}


interface leagueTeams {
  player_id: number;
  team_id: number;
  player_name: string;
  team_name: string;
}


const reshapeLeagueTeams = (leagueTeams: leagueTeams[], players: RowData[]) => {
  
  const groupedByTeam: TeamWithPlayers[] = Object.values(
    leagueTeams.reduce((acc: Record<number, TeamWithPlayers>, player) => {
      const { team_id, team_name, player_id, player_name } = player;
  
      if (!acc[team_id]) {
        acc[team_id] = {
          team_id,
          team_name,
          players: []
        };
      }
      const foundItem = players.find(item => item.ID === player_id);
      acc[team_id].players.push(foundItem!);
  
      return acc;
    }, {})
  );

  return groupedByTeam;
};

const LeaguePage: NextPage<LeagueProps> = ({dbleague, topScorers, leagueTable, dbmatches, leagueTeams}) => {

  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [view, setView] = useState<string>("home")

  const [matchInfo, setMatchInfo] = useState<MatchInfo|null>(null)
  const [matchIndex, setMatchIndex] = useState<number|null>(null)
  const [matchRound, setMatchRound] = useState<boolean|null>(null)
  const [matchDay, setMatchDay] = useState<number|null>(null)

  const [players, setPlayers] = useState<RowData[]>([]);

  const [completeLeagueTeams, setCompleteLeagueTeams] = useState<ParticipantsFull[]>([]);

  useEffect(() => {

    const playerIds = leagueTeams.map(item => item.player_id);

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
    const participants = reshapeLeagueTeams(leagueTeams, players)

    const transformed = participants.map((participant) => ({
    ...participant,
    groupedPlayers: groupPlayerData(participant.players),
    }));
    setCompleteLeagueTeams(transformed)
  }, [players]);


  useEffect(() => {
    if(dbmatches.length === 0){
      const generatedSchedule = generateRoundRobinSchedule(leagueTable.map(team => team.team_name))
      setSchedule( generatedSchedule )

      // PUSH MATCHES
      const matchRecords: MatchRecords[] = [];

      generatedSchedule.ida.forEach(day => {
        day.matches.forEach((match: MatchInfo) => {
          matchRecords.push({
            local_team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
            visitor_team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
            league_id_fk: Number(leagueId as string),
            matchday: day.matchday,
            ID: match.match_id!
          });
        });
      });

      generatedSchedule.vuelta.forEach(day => {
        day.matches.forEach((match: MatchInfo) => {
          matchRecords.push({
            local_team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
            visitor_team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
            league_id_fk: Number(leagueId as string),
            matchday: day.matchday,
            ID: match.match_id!
          });
        });
      });

      const postMatches = async () => {
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
    console.log(matchRecords)
    postMatches()

    }else{
      console.log("Loaded matches")
      const generatedSchedule = generateScheduleFromDB(dbmatches, leagueTable)
      console.log(generateScheduleFromDB(dbmatches, leagueTable))
      setSchedule( generatedSchedule )
      // ToDo: Means that there were results stored in the DB and here we must reshape them
    }
  }, [dbmatches]);

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

      // POST CARDS

      // RELOAD LEAGUE TABLE 

      // RELOAD TOP SCORER TABLE
    }
    setView("home"); // may possibly need to update the matchinfo
  };

  const handleTeamsClick = () => {
    setView("teams"); // may possibly need to update the matchinfo
  };

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
      >            
        mercado
      </Button>

      {schedule && view === "home" ? (
        <LeagueDashboard dbleague={dbleague} topScorers={topScorers} leagueTable={leagueTable} dbmatches={dbmatches} 
          leagueTeams={leagueTeams} handleMatchClick={handleMatchClick} schedule={schedule} />
      ) : view === "match" ? (
        <MatchInfoDashboard matchInfo={matchInfo!} matchIndex={matchIndex!} matchRound={matchRound!} matchDay={matchDay!} 
          completeLeagueTeams={completeLeagueTeams} game={dbleague.game!} setSchedule={setSchedule} />
      ) : view === "teams" ? (
        <TeamsView participantData={completeLeagueTeams} game={dbleague.game}/>
      ) : view === "market" ? (
        <>test</>
      ) : (
        <></>
      )}
      
    </ Box>
  )
}
  
  export default LeaguePage