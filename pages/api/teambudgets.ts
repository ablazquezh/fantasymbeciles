import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, team_budget } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const game = req.query.game as string;
    
    try {
      // SAFE: Uses parameterized query with ${}
        const teams: team_budget[] | null = await prisma.team_budget.findMany({
          where: {game: game}
        }
        );

      res.status(200).json({ teams });
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}
