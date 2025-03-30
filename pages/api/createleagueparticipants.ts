import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Example Prisma query: Fetch a user by email (modify as needed)
    const user = await prisma.user.findFirst({
      where: { email: "test@example.com" },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ userId: user.id }); // Send user ID back
  } catch (error) {
    console.error("Prisma error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
