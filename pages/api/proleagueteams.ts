
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { leagueId, teamIds } = req.query;

  try {
    const ids: string[] = Array.isArray(teamIds)
      ? teamIds
      : typeof teamIds === 'string'
        ? teamIds.split(',')
        : [];
  
    let leagueTeams;
  
    if (leagueId === undefined) {
      leagueTeams = await prisma.$queryRaw`
        SELECT * FROM pro_league_teams 
        WHERE team_id IN (${Prisma.join(ids)})
      `;
    } else {
      leagueTeams = await prisma.$queryRaw`
        SELECT * FROM pro_league_teams 
        WHERE team_id IN (${Prisma.join(ids)})
      `;
    }
      res.status(200).json( leagueTeams );
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}
