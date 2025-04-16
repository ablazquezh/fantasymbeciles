import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const game = req.query.game as string;
    
    try {
      // SAFE: Uses parameterized query with ${}
      const teams = await prisma.$queryRaw`
          SELECT team_id_fk, team_name, CAST(FLOOR(team_avg_std) as char) as team_avg_std, CAST(FLOOR(fwd_avg_std) as char) as FWD_avg_std, CAST(FLOOR(mid_avg_std) as char) as MID_avg_std, CAST(FLOOR(def_avg_std) as char) as DEF_avg_std, CAST(FLOOR(gk_avg_std) as char) as GK_avg_std, team_league, team_country FROM team_stats WHERE game = ${game} AND league_id_fk is null order by team_avg_std desc
      `;

      res.status(200).json({ teams });
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}
