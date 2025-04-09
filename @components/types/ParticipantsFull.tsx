import { RowData } from "./RowData";

export interface ParticipantsFull {
    groupedPlayers: {
        [key: string]: RowData[];
    };
    team_id: number;
    team_name: string;
    players: RowData[];
}
