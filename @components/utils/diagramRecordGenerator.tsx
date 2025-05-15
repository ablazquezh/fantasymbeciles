import { leagues } from "@prisma/client";
import { DiagramRecords } from "../types/DiagramRecords";
import { PlayerTuple } from "../types/PlayerTuple";

export default function diagramRecordGenerator(diagramPlayers: { [key: string]: PlayerTuple }, dbleague: leagues) {

    const diagramRecords: DiagramRecords[] = [];
    
    for (const key of Object.keys(diagramPlayers)) {

        const [x, y, position, teamId, playerId] = diagramPlayers[key];

        diagramRecords.push({
            player_id_fk: playerId,
            team_id_fk: teamId,
            league_id_fk: dbleague.ID,
            coord_x: x,
            coord_y: y
        });
    }

    return diagramRecords
};