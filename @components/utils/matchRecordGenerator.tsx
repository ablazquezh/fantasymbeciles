import { MatchInfo } from "../types/MatchInfo";
import { MatchRecords } from "../types/MatchRecords";
import { Schedule } from "../types/Schedule";

export default function matchRecordGenerator(schedule: Schedule, leagueTable: any[], leagueId: string) {

    const matchRecords: MatchRecords[] = [];
    
    schedule!.ida.forEach(day => {
        day.matches.forEach((match: MatchInfo) => {
            matchRecords.push({
            local_team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
            visitor_team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
            league_id_fk: Number(leagueId as string),
            matchday: day.matchday,
            ID: match.match_id!,
            played: match.played
            });
        });
    });

    schedule!.vuelta.forEach(day => {
        day.matches.forEach((match: MatchInfo) => {
            matchRecords.push({
            local_team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
            visitor_team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
            league_id_fk: Number(leagueId as string),
            matchday: day.matchday,
            ID: match.match_id!,
            played: match.played
            });
        });
    });

    return matchRecords
};