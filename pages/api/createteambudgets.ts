import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { BudgetRecord } from "@/@components/types/BudgetRecords";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const records = req.body;  // Assume records are sent as an array in the body
    const toUpsert = records.records;
    // Debugging: Log the records to check if it's an array
    console.log('Received records:', records.records);

    if (!Array.isArray(records.records)) {
      return res.status(400).json({ error: 'Invalid input format. Expected an array of records.' });
    }

    try {
      // Bulk upsert logic using a transaction to ensure atomicity
      await prisma.$transaction(
        toUpsert.map((record : BudgetRecord) =>
          prisma.team_budget.upsert({
            where: {
              team_name_game_league_id_fk: {  // Use the unique constraint field
                team_name: record.team_name,
                game: record.game,
                league_id_fk: record.league_id_fk
              },
            },
            update: {
              budget: record.budget,  // Update the quantity if the record with the same match_id_fk and player_id_fk exists
            },
            create: {
              team_id: record.team_id,
              team_name: record.team_name,
              budget: record.budget,  // Create a new record if no match_id_fk and player_id_fk combination exists
              game: record.game,
              league_id_fk: record.league_id_fk
            },
          })
        )
      );
      res.status(200).json({ message: 'Budgets upserted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to upsert goals' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
