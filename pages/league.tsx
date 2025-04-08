import React, { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List,  ListItem,  ListItemText,  Box, Typography, Chip, TablePagination, Paper, Button } from "@mui/material";
import { GetServerSidePropsContext, NextPage } from 'next';
import TopScorerTable from '@/@components/primitive/leagueView/TopScorerTable';
import { PrismaClient, Prisma, users, leagues } from "@prisma/client";
import LeagueTable from '@/@components/primitive/leagueView/Classification';


const prisma = new PrismaClient();

export async function getServerSideProps(context: GetServerSidePropsContext) {

  const {leagueId} = context.query as {leagueId?: string};

  const dbleague: leagues | null = await prisma.leagues.findUnique({
    where: {ID: Number(leagueId)}
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
    leagueTable: leagueTable
  } };
}

interface LeagueProps {
  dbleague: leagues;
  topScorers: any[];
  leagueTable: any[];
}

const LeaguePage: NextPage<LeagueProps> = ({dbleague, topScorers, leagueTable}) => {

  const router = useRouter();
  const { leagueId } = router.query;

  return (
    <Box sx={{
      margin: "auto",
      width: "85%",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      backgroundColor: "Gray"
    }}>
        <Button variant="contained" color="primary" disabled={false}
          sx={{ width: 150, ml: "calc(100% - 150px)", position: 'absolute', top: '20px', right: 'calc(50% + 30px)', }}
        >            
          ver equipos
        </Button>
        <Button variant="contained" color="primary" disabled={false}
          sx={{ width: 150, ml: "calc(100% - 150px)", position: 'absolute', top: '20px', right: 'calc(50% - 180px)', }}
        >            
          mercado
        </Button>

      <Paper sx={{ padding: 4, marginTop: 10, display: "flex"}}>

        <TopScorerTable data={topScorers} game={dbleague.game!}></TopScorerTable>
        <LeagueTable data={leagueTable} game={dbleague.game!}></LeagueTable>

      </ Paper>
      
    </ Box>
  )
}
  
  export default LeaguePage