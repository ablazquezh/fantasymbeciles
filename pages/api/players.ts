// pages/api/getData.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { page = 1, pageSize = 15, game } = req.query;

  const pageNumber = Number(page);
  const pageSizeNumber = Number(pageSize);

  const gameQuery = Array.isArray(game) ? game[0] : game;
  
  try {
    // Fetch paginated records
    const data = await prisma.players.findMany({
        skip: (pageNumber - 1) * pageSizeNumber,
        take: pageSizeNumber,
        where: {game: gameQuery}
    });

    // Get total count
    const total = await prisma.players.count();

    res.status(200).json({ data, total });
} catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
}
}