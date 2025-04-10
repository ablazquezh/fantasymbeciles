import React, { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, Divider, Paper, Button } from "@mui/material";
import { GetServerSidePropsContext, NextPage } from 'next';
import TopScorerTable from '@/@components/primitive/leagueView/TopScorerTable';
import { PrismaClient, Prisma, users, leagues, matches } from "@prisma/client";
import LeagueTable from '@/@components/primitive/leagueView/Classification';
import generateRoundRobinSchedule from '@/@components/utils/scheduleGenerator';
import MatchCard from '@/@components/primitive/leagueView/MatchCard';
import { MatchDetails } from '../types/MatchDetails';


interface matchInfo {
  local: MatchDetails;
  visitor: MatchDetails;
  played: boolean;
}

interface LeagueTableProps {
    team_name: string;
    n_played_matches: number;
    victories: number;
    draws: number;
    loses: number;
    points: number;
    goals_favor: number;
    goals_against: number;
    goal_diff: number;
    yellow_cards: number;
    red_cards: number;
}

interface TopScorer {
    team_name: string;
    player_name: string;
    goals: number;
}

interface LeagueDashboardProps {
    dbleague: leagues;
    topScorers: TopScorer[];
    leagueTable: LeagueTableProps[];
    dbmatches: matches[];
    handleMatchClick: (
        matchInfo: matchInfo,
        matchIndex: number,
        matchRound: boolean,
        matchDay: number
      ) => void;
    leagueTeams: any[];
    schedule: { ida: any[]; vuelta: any[]; };
  }


const LeagueDashboard: React.FC<LeagueDashboardProps> = ({dbleague, topScorers, leagueTable, dbmatches, handleMatchClick, leagueTeams, schedule}) => {

  //const [schedule, setSchedule] = useState<{ ida: any[]; vuelta: any[]; } | null>(null)
  const [matchView, setMatchView] = useState<boolean>(false)
  const [matchInfo, setMatchInfo] = useState<matchInfo|null>(null)

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
  console.log(schedule)
  return (
    <Paper className="parent" sx={{ padding: 4, marginTop: 10, display: "flex", flexDirection: "row", flexWrap: "wrap", mb: 10 }}>

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
                        <MatchCard key={matchIdx} matchInfo={match} game={dbleague.game!} handleMatchClick={handleMatchClick} 
                          handleMatchInfoClick={undefined} matchIndex={matchIdx} matchRound={true} matchDay={matchday.matchday} />
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
                        <MatchCard key={matchIdx} matchInfo={match} game={dbleague.game!} handleMatchClick={handleMatchClick} 
                          handleMatchInfoClick={undefined} matchIndex={matchIdx} matchRound={false} matchDay={matchday.matchday} />
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
  )
}
  
export default LeagueDashboard