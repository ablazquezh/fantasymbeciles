
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const leagueType = req.query.leagueType as string;
    console.log(leagueType)
    try {
      // SAFE: Uses parameterized query with ${}
      const userHistory = await prisma.$queryRaw`
        SELECT * FROM user_history WHERE league_type = ${leagueType}
      `;
      res.status(200).json( userHistory );
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}
