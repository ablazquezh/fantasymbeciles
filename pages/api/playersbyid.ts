// pages/api/getData.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Método no permitido" });
    }

    const { idList, game } = req.query;

    const gameQuery = Array.isArray(game) ? game[0] : game;

    const ids: string[] = Array.isArray(idList)
    ? idList
    : typeof idList === 'string'
      ? idList.split(',')
      : [];

    const numberList = ids.map(str => parseInt(str, 10));
      try {
        // Fetch paginated records
        const data = await prisma.players.findMany({
            where: {game: gameQuery,
              ID: {
                in: numberList
              },
            },
        });

        // Get total count
        const total = await prisma.players.count({
          where: {game: gameQuery}
      });

        res.status(200).json({ data, total });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
 
}