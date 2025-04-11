import { GoalRecords } from "../types/GoalRecords";
import { MatchInfo } from "../types/MatchInfo";
import { Schedule } from "../types/Schedule";

export default function goalRecordGenerator(schedule: Schedule, leagueTable: any[], leagueTeams: any[]) {

    const goalRecords: GoalRecords[] = [];
    
    schedule!.ida.forEach(day => {
    day.matches.forEach((match: MatchInfo) => {
        match.local.goals.forEach((goal: any) => {
        goalRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === goal.player)?.player_id,
            match_id_fk: match.match_id,
            quantity: goal.n
        });
        });
        match.visitor.goals.forEach((goal: any) => {
        goalRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === goal.player)?.player_id,
            match_id_fk: match.match_id,
            quantity: goal.n
        });
        });
    });
    });

    schedule!.vuelta.forEach(day => {
    day.matches.forEach((match: MatchInfo) => {
        match.local.goals.forEach((goal: any) => {
        goalRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === goal.player)?.player_id,
            match_id_fk: match.match_id,
            quantity: goal.n
        });
        });
        match.visitor.goals.forEach((goal: any) => {
        goalRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === goal.player)?.player_id,
            match_id_fk: match.match_id,
            quantity: goal.n
        });
        });
    });
    });

    return goalRecords
};