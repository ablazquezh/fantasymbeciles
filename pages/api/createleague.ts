import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, leagues_type } from "@prisma/client";
import { leagues_market_type } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { leagueName, leagueType, transferMarket, // MAIN SETTING
      transferMarketSlot,

      cardSuspension, // MAIN SETTING
      cardSuspensionAmount,
      cardResetAmount,
      cardResetInjury,
      cardResetRed,

      bigTeamMultiplier,
      mediumTeamMultiplier,
      smallTeamMultiplier,
      winBonus,
      drawBonus,
      game } = req.body; // Extract parameters from request    

    // Insert into database using Prisma
    const newRecord = await prisma.leagues.create({
      data: {
        league_name: leagueName,
        type: leagueType,
        market_enabled: transferMarket,
        market_type: transferMarketSlot === "season" ? leagues_market_type.season : leagues_market_type.winter,  
        card_suspension: cardSuspension,
        card_suspension_amount: cardSuspensionAmount,
        card_reset_amount: cardResetAmount,
        card_reset_injury: cardResetInjury,
        card_reset_red: cardResetRed,
        big_team_multiplier: bigTeamMultiplier,
        medium_team_multiplier: mediumTeamMultiplier,
        small_team_multiplier: smallTeamMultiplier,
        win_bonus: winBonus,
        draw_bonus: drawBonus,
        game: game
      },
    });
    
    return res.status(201).json(newRecord);
  } catch (error) {
    console.error("Database insert error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
