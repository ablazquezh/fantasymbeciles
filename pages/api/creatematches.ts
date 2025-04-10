import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  try {
    const { records } = req.body; // Expecting an array of records

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "Invalid or empty data array" });
    }

    // Bulk insert using createMany()
    const result = await prisma.matches.createMany({
      data: records, // Must be an array of objects matching table columns
      skipDuplicates: true, // Optional: Avoid inserting duplicates
    });

    return res.status(201).json({ success: true, count: result.count });
  } catch (error) {
      console.error("Database insert error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
