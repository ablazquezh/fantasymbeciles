import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {game, leagueId} = req.query
    
    try {
      // SAFE: Uses parameterized query with ${}
      const participants = await prisma.$queryRaw`
          SELECT user_name, team_name FROM league_participants_view WHERE game = ${game} AND league_ID_fk = ${leagueId}
      `;

      res.status(200).json({ participants });
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}
