import { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const leagueId = req.body.leagueId as number;

    try {
      // SAFE: Uses parameterized query with ${}${Prisma.join(ids)}
      const deletedLeague = await prisma.leagues.delete({
        where: {
          ID: leagueId,  // List of IDs you want to delete
        },
      });
      res.status(200).json({ deletedLeague });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
