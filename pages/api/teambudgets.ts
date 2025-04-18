import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, team_budget } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const game = req.query.game as string;
    const idList = req.query.idList as string;
    const leagueId = req.query.leagueId as string;
    let queryIds;
    let queryLeagueId;

    if(idList){
      queryIds = idList.split(",")
    }

    if(leagueId){
      queryLeagueId = Number(leagueId);
    }else{
      queryLeagueId = null;
    }
    try {
      if(queryIds){
      // SAFE: Uses parameterized query with ${}
        const teams: team_budget[] | null = await prisma.team_budget.findMany({
          where: {game: game, team_id: {
            in: queryIds.map(item => Number(item))
          },
          league_id_fk: queryLeagueId
        }
        }
        );

      res.status(200).json({ teams });
    }else{
      const teams: team_budget[] | null = await prisma.team_budget.findMany({
        where: {game: game,
          league_id_fk: queryLeagueId }
      }
      );
      res.status(200).json({ teams });

    }
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}
