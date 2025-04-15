import { RowData } from "../types/RowData";
import { TeamWithPlayers } from "../types/TeamWithPlayers";
interface leagueTeams {
    player_id: number;
    team_id: number;
    player_name: string;
    team_name: string;
  }
export default function reshapeLeagueTeams (leagueTeams: leagueTeams[], players: RowData[]) {
  
  const groupedByTeam: TeamWithPlayers[] = Object.values(
    leagueTeams.reduce((acc: Record<number, TeamWithPlayers>, player) => {
      const { team_id, team_name, player_id, player_name } = player;
  
      if (!acc[team_id]) {
        acc[team_id] = {
          team_id,
          team_name,
          players: []
        };
      }
      const foundItem = players.find(item => item.ID === player_id);
      acc[team_id].players.push(foundItem!);
  
      return acc;
    }, {})
  );

  return groupedByTeam;
};
