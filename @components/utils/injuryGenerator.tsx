import { InjuryRecords } from "../types/InjuryRecords";
import { MatchInfo } from "../types/MatchInfo";
import { Schedule } from "../types/Schedule";

export default function injuryRecordGenerator(schedule: Schedule, leagueTable: any[], leagueTeams: any[]) {

    const injuryRecords: InjuryRecords[] = [];
    
    schedule!.ida.forEach(day => {
    day.matches.forEach((match: MatchInfo) => {
        match.local.injuries.forEach((injury: any) => {
            injuryRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === injury)?.player_id,
            match_id_fk: match.match_id
        });
        });
        match.visitor.injuries.forEach((injury: any) => {
            injuryRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === injury)?.player_id,
            match_id_fk: match.match_id
        });
        });
    });
    });

    schedule!.vuelta.forEach(day => {
    day.matches.forEach((match: MatchInfo) => {
        match.local.injuries.forEach((injury: any) => {
            injuryRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === injury)?.player_id,
            match_id_fk: match.match_id
        });
        });
        match.visitor.injuries.forEach((injury: any) => {
            injuryRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === injury)?.player_id,
            match_id_fk: match.match_id
        });
        });
    });
    });

    return injuryRecords
};