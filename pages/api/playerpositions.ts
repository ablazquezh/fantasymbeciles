import { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const game = req.query.game as string;
    const idList = req.query.idList as string;

    const queryIds = idList.split(",")
    
    const placeholders = queryIds.map(() => `?`).join(",");

    const query = `
    SELECT player_id, player_name, position_name 
    FROM player_positions 
    WHERE game = ? AND player_id IN (${placeholders});
    `;

    try {
      // SAFE: Uses parameterized query with ${}${Prisma.join(ids)}
      const positions = await prisma.$queryRawUnsafe(query, game, ...queryIds);
        console.log(positions)
      res.status(200).json({ positions });
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}
