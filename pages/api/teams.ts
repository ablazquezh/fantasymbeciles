import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const game = req.query.game as string;
    
    try {
      // SAFE: Uses parameterized query with ${}
      const teams = await prisma.$queryRaw`
          SELECT team_id_fk, team_name, ROUND(team_avg_std) as team_avg_std, ROUND(fwd_avg_std) as FWD_avg_std, ROUND(mid_avg_std) as MID_avg_std, ROUND(def_avg_std) as DEF_avg_std, ROUND(gk_avg_std) as GK_avg_std, team_league, team_country FROM team_stats WHERE game = ${game} AND league_id_fk is null order by team_avg_std desc
      `;

      res.status(200).json({ teams });
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}
