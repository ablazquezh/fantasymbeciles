import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, leagues_type } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { leagueName, leagueType, winterMarket, yellowCards, playerAvgLimit, budgetCalc, game } = req.body; // Extract parameters from request    

    // Insert into database using Prisma
    const newRecord = await prisma.leagues.create({
      data: {
        league_name: leagueName,
        type: leagueType,
        winter_market_enabled: winterMarket,
        yellow_cards_suspension: yellowCards,
        player_avg_limit: playerAvgLimit,
        budget_calculation_type: budgetCalc,
        game: game
      },
    });
    
    return res.status(201).json(newRecord);
  } catch (error) {
    console.error("Database insert error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
