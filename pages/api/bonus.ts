// pages/api/getData.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { leagueId = null } = req.query;
  
  try {
    if(leagueId !== null){
      const bonus = await prisma.bonus.findMany({
        where: {ID: Number(leagueId)}
      });
      res.status(200).json(bonus);
    }

  } catch (error) {
    res.status(500).json({ message: "Error al obtener los datos", error });
  }
}