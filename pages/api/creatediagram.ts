import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { DiagramRecords } from "@/@components/types/DiagramRecords";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const records = req.body;  // Assume records are sent as an array in the body
    const toUpsert = records.records;
    // Debugging: Log the records to check if it's an array

    if (!Array.isArray(records.records)) {
      return res.status(400).json({ error: 'Invalid input format. Expected an array of records.' });
    }

    try {
      // Bulk upsert logic using a transaction to ensure atomicity
      await prisma.$transaction(
        toUpsert.map((record : DiagramRecords) =>
          prisma.diagram_positions.upsert({
            where: {
              player_id_fk_league_id_fk: {  // Use the unique constraint field
                player_id_fk: record.player_id_fk!,
                league_id_fk: record.league_id_fk!,
              },
            },
            update: {
              team_id_fk: record.team_id_fk,
              coord_x: record.coord_x,
              coord_y: record.coord_y
            },
            create: {
              player_id_fk: record.player_id_fk,
              league_id_fk: record.league_id_fk,
              team_id_fk: record.team_id_fk,
              coord_x: record.coord_x,
              coord_y: record.coord_y
            },
          })
        )
      );
      res.status(200).json({ message: 'Diagram positions upserted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to upsert Diagram positions' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
