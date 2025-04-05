import { players } from "@prisma/client";

type playersFull = players & {
  teams: {
    ID: string | null;
    game: string | null;
    team_country: string | null;
    team_league: string | null;
    team_name: string | null;
  }; // Adding a new property
};

export default function mergeData(A: playersFull[], B: any[]) {
    // Create a lookup map from B, grouping all `y` values by `x`
    const bMap = B.reduce((acc, item) => {
      if (!acc[item.player_name]) {
        acc[item.player_name] = [];
      }
      acc[item.player_name].push(item.position_name);
      return acc;
    }, {} as Record<string, string[]>);
  
    // Map over A and add the new `y` array property
    return A.map((item) => ({
      ...item,
      positions: bMap[item.name!] || [] // If there are no matches, use an empty array
    }));
  }
  