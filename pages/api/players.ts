// pages/api/getData.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Método no permitido" });
    }

    const { page = 1, pageSize = 15, game, positions, minValue=0, maxValue=99, playerName="" } = req.query;

    const posList: string[] = Array.isArray(positions)
    ? positions
    : typeof positions === 'string'
      ? positions.split(',')
      : [];

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    const minV = Number(minValue);
    const maxV = Number(maxValue);

    const gameQuery = Array.isArray(game) ? game[0] : game;
    
    if(posList[0] !== ''){
      try {
        // Fetch paginated records
        const data = await prisma.players.findMany({
            skip: (pageNumber - 1) * pageSizeNumber,
            take: pageSizeNumber,
            where: {game: gameQuery,
              nickname: {
                contains: "%"+playerName+"%",    // Case-insensitive search
              },
              positions_join: {
                some: {
                  positions: {
                    position: {
                      in: posList,
                    },
                  },
                },
              },
              average: {
                gte: minV,  // greater than or equal to 20
                lte: maxV,  // less than or equal to 30
              },
            },
            include: {
              teams: true,
              positions_join: {
                include: {
                  positions: true,
                }
              }
            }
        });

        // Get total count
        const total = await prisma.players.count({
          where: {game: gameQuery}
      });

        res.status(200).json({ data, total });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
  }else{
      try {
        // Fetch paginated records
        const data = await prisma.players.findMany({
            skip: (pageNumber - 1) * pageSizeNumber,
            take: pageSizeNumber,
            where: {game: gameQuery,
              average: {
                gte: minV,  // greater than or equal to 20
                lte: maxV,  // less than or equal to 30
              },
              nickname: {
                contains: "%"+playerName+"%",    // Case-insensitive search
              },
            },
            include: {
              teams: true,
            }
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
}