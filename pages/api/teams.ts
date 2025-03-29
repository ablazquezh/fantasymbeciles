import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const game = req.query.game as string;

    const teams = await prisma.teams.findMany({
        where: game ? { game } : {},
    });

    res.status(200).json({ teams });
}
