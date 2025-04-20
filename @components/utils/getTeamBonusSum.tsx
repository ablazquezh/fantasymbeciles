import { bonus } from "@prisma/client";

export default function getTeamBonusSum (entries: bonus[], teamId: number): number {
  return entries.reduce((sum, entry) => {
    if (entry.team_id_fk === teamId && entry.quantity !== null) {
      return sum + entry.quantity * 1000000;
    }
    return sum;
  }, 0);
};
