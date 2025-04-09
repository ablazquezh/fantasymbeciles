import { RowData } from "./RowData";

export type TeamWithPlayers = {
  team_id: number;
  team_name: string;
  players: RowData[];
};