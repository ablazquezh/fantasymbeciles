
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
      // SAFE: Uses parameterized query with ${}
      const leagueTeams = await prisma.$queryRaw`
          SELECT * FROM raw_league_teams WHERE league_id = ${leagueId} AND team_id in (${Prisma.join(ids)})
        `;
      res.status(200).json( leagueTeams );
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}
