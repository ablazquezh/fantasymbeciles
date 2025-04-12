import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { InjuryRecords } from "@/@components/types/InjuryRecords";

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
        toUpsert.map((record : InjuryRecords) =>
          prisma.injuries.upsert({
            where: {
              match_id_fk_player_id_fk: {  // Use the unique constraint field
                match_id_fk: record.match_id_fk!,
                player_id_fk: record.player_id_fk!,
              },
            },
            update: {
            },
            create: {
              match_id_fk: record.match_id_fk,
              player_id_fk: record.player_id_fk,
              team_id_fk: record.team_id_fk,
            },
          })
        )
      );
      res.status(200).json({ message: 'Injuries upserted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to upsert cards' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
