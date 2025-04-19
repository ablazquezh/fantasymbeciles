import { bonus } from "@prisma/client";

export default function getTeamBonusSum (entries: bonus[], teamId: number): number {
    console.log("******")
    console.log(entries)
    console.log(typeof entries)
  return entries.reduce((sum, entry) => {
    if (entry.team_id_fk === teamId && entry.quantity !== null) {
      return sum + entry.quantity;
    }
    return sum;
  }, 0);
};
