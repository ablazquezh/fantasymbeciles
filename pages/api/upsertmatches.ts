import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { MatchRecords } from "@/@components/types/MatchRecords";

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
        toUpsert.map((record : MatchRecords) =>
          prisma.matches.upsert({
            where: { ID: record.ID },
            update: {
              played: record.played,  // Update the quantity if the record with the same match_id_fk and player_id_fk exists
            },
            create: {
              ID: record.ID,
              local_team_id_fk: record.local_team_id_fk,
              visitor_team_id_fk: record.visitor_team_id_fk,
              league_id_fk: record.league_id_fk,  // Create a new record if no match_id_fk and player_id_fk combination exists
              matchday: record.matchday,
              played: record.played,
            },
          })
        )
      );
      res.status(200).json({ message: 'Matches upserted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to upsert goals' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
