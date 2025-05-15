import { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    
    const nameList = req.body.nameList as number[];
    const leagueId = req.body.leagueId as number;
    console.log(nameList)
    console.log(leagueId)
    try {
      // SAFE: Uses parameterized query with ${}${Prisma.join(ids)}
      const deletedDiagrams = await prisma.diagram_positions.deleteMany({
        where: {
          player_id_fk: {
            in: nameList,  // List of IDs you want to delete
          },
          league_id_fk: leagueId
        },
      });
      res.status(200).json({ deletedDiagrams });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
