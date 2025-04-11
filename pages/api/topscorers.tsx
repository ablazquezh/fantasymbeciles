
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const leagueId = req.query.leagueId as string;
    
    try {
      // SAFE: Uses parameterized query with ${}
      const teams = await prisma.$queryRaw`
           SELECT player_name, team_name, goals
        FROM top_scorers_by_league
        WHERE league_id = ${leagueId}`;

      res.status(200).json( teams );
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}
