import React, { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, Divider, Paper, Button } from "@mui/material";
import { GetServerSidePropsContext, NextPage } from 'next';
import TopScorerTable from '@/@components/primitive/leagueView/TopScorerTable';
import { PrismaClient, Prisma, users, leagues, matches } from "@prisma/client";
import LeagueTable from '@/@components/primitive/leagueView/Classification';
import generateRoundRobinSchedule from '@/@components/utils/scheduleGenerator';
import MatchCard from '@/@components/primitive/leagueView/MatchCard';

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

  return { props: {
    dbleague: {
      ...dbleague,
      created_at: dbleague?.created_at ? dbleague.created_at.toISOString() : null,
    },
    topScorers: topScorers,
    leagueTable: leagueTable,
    dbmatches: dbmatches
  } };
}

interface LeagueProps {
  dbleague: leagues;
  topScorers: any[];
  leagueTable: any[];
  dbmatches: matches[];
}


interface MatchDetails {
  team: string;
  goals: any[]; // You can replace 'any' with a more specific type if needed, like 'number[]' for goals.
  cards: any[]; // Same as goals, replace 'any' with a more specific type if necessary.
}
interface matchInfo {
  local: MatchDetails;
  visitor: MatchDetails;
  played: boolean;
}


const LeaguePage: NextPage<LeagueProps> = ({dbleague, topScorers, leagueTable, dbmatches}) => {

  const [schedule, setSchedule] = useState<{ ida: any[]; vuelta: any[]; } | null>(null)
    

  useEffect(() => {
    if(dbmatches.length === 0){
      setSchedule( generateRoundRobinSchedule(leagueTable.map(team => team.team_name)) )
    }else{
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

  const handleMatchClick = (matchInfo: matchInfo) => {
    console.log(matchInfo)
  };

  return (
    <Box sx={{
      margin: "auto",
      width: "85%",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }}>
        <Button variant="contained" color="primary" disabled={false}
          sx={{ width: 150, position: 'absolute', top: '20px', right: 'calc(0% + 180px)', }}
        >            
          ver equipos
        </Button>
        <Button variant="contained" color="primary" disabled={false}
          sx={{ width: 150, position: 'absolute', top: '20px', right: '0%', }}
        >            
          mercado
        </Button>

      <Paper className="parent" sx={{ padding: 4, marginTop: 10, display: "flex", flexDirection: "row", flexWrap: "wrap", mb: 10}}>

        <TopScorerTable data={topScorers} game={dbleague.game!}></TopScorerTable>
        
        <Box sx={{ width: "70%",  position: "relative", height: "fit-content"}}>
          <div className="content">
          <LeagueTable data={leagueTable} game={dbleague.game!}></LeagueTable>
          </div>
          <Box className="child"
            sx={{
              position: "absolute",
              top: "100%",
              width: "100%",
              mt: 1,
              ml: 15,
              gap: 5,
              display: "flex",
              alignContent: "center",
              justifyContent: "center"
            }}
          >
            <>
              <Paper sx={{mt:2, pt: 1, pl: 3, pr: 3, pb: 3, width: "50%"}}>
                {schedule !== null && 
                  schedule.ida.map((matchday, idx) => (
                    <>
                    <Typography variant="h6" key={idx} sx={{fontWeight: 'bold', mt: 2}}>JORNADA {matchday.matchday}</ Typography>

                    <Box sx={{ gap: 3, padding: 1, justifyContent: 'center', alignItems: 'center', display: "flex", flexDirection: "column" }}>

                      {matchday.matches.map((match: matchInfo, matchIdx: number) =>
                        <MatchCard key={matchIdx} matchInfo={match} game={dbleague.game!} handleMatchClick={handleMatchClick} ></ MatchCard>
                      )}
                    </Box>
                    <Divider sx={{ margin: '16px 0' }} />
                    </>
                  ))
                }
              </Paper>
            </>

            <>
              <Paper sx={{mt:2, pt: 1, pl: 3, pr: 3, pb: 3, width: "50%"}}>
                {schedule !== null && 
                  schedule.vuelta.map((matchday, idx) => (
                    <>
                    <Typography variant="h6" key={idx} sx={{fontWeight: 'bold', mt: 2}}>JORNADA {matchday.matchday}</ Typography>

                    <Box sx={{ gap: 3, padding: 1, justifyContent: 'center', alignItems: 'center', display: "flex", flexDirection: "column" }}>

                      {matchday.matches.map((match: matchInfo, matchIdx: number) =>
                        <MatchCard key={matchIdx} matchInfo={match} game={dbleague.game!} handleMatchClick={handleMatchClick} ></ MatchCard>
                      )}

                    </Box>
                    <Divider sx={{ margin: '16px 0' }} />
                    </>
                  ))
                }
              </Paper>
            </>

          </Box>
        </Box>
        
      </ Paper>
      
    </ Box>
  )
}
  
  export default LeaguePage