// pages/api/getData.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const data = await prisma.players.findMany({
      take: 5, // Solo 5 registros
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los datos", error });
  }
}