
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const leagueId = req.query.leagueId as string;
    
    try {
      // SAFE: Uses parameterized query with ${}
      const leagueTable = await prisma.$queryRaw`
        SELECT * FROM league_table WHERE league_id = ${leagueId}
      `;
      res.status(200).json( leagueTable );
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}
