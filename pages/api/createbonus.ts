import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { BonusRecords } from "@/@components/types/BonusRecords";

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
        toUpsert.map((record : BonusRecords) =>
          prisma.bonus.upsert({
            where: {
              match_id_fk_team_id_fk: {  // Use the unique constraint field
                match_id_fk: record.match_id_fk!,
                team_id_fk: record.team_id_fk!,
              },
            },
            update: {
              quantity: record.quantity,  // Update the quantity if the record with the same match_id_fk and player_id_fk exists
            },
            create: {
              match_id_fk: record.match_id_fk,
              team_id_fk: record.team_id_fk,
              quantity: record.quantity,  // Create a new record if no match_id_fk and player_id_fk combination exists
            },
          })
        )
      );
      res.status(200).json({ message: 'Bonus upserted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to upsert goals' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
