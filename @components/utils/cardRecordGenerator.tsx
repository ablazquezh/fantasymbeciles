import { CardRecords } from "../types/CardRecords";
import { MatchInfo } from "../types/MatchInfo";
import { Schedule } from "../types/Schedule";

export default function cardRecordGenerator(schedule: Schedule, leagueTable: any[], leagueTeams: any[]) {

    const cardRecords: CardRecords[] = [];
    
    schedule!.ida.forEach(day => {
    day.matches.forEach((match: MatchInfo) => {
        match.local.ycards.forEach((card: any) => {
            cardRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === card)?.player_id,
            match_id_fk: match.match_id,
            type: "yellow"
        });
        });
        match.visitor.ycards.forEach((card: any) => {
            cardRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === card)?.player_id,
            match_id_fk: match.match_id,
            type: "yellow"
        });
        });
    });
    });

    schedule!.vuelta.forEach(day => {
    day.matches.forEach((match: MatchInfo) => {
        match.local.ycards.forEach((card: any) => {
            cardRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === card)?.player_id,
            match_id_fk: match.match_id,
            type: "yellow"
        });
        });
        match.visitor.ycards.forEach((card: any) => {
            cardRecords.push({
            team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
            player_id_fk: leagueTeams.find(item => item.player_name === card)?.player_id,
            match_id_fk: match.match_id,
            type: "yellow"
        });
        });
    });
    });



    schedule!.ida.forEach(day => {
        day.matches.forEach((match: MatchInfo) => {
            match.local.rcards.forEach((card: any) => {
                cardRecords.push({
                team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
                player_id_fk: leagueTeams.find(item => item.player_name === card)?.player_id,
                match_id_fk: match.match_id,
                type: "red"
            });
            });
            match.visitor.rcards.forEach((card: any) => {
                cardRecords.push({
                team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
                player_id_fk: leagueTeams.find(item => item.player_name === card)?.player_id,
                match_id_fk: match.match_id,
                type: "red"
            });
            });
        });
        });
    
        schedule!.vuelta.forEach(day => {
        day.matches.forEach((match: MatchInfo) => {
            match.local.rcards.forEach((card: any) => {
                cardRecords.push({
                team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
                player_id_fk: leagueTeams.find(item => item.player_name === card)?.player_id,
                match_id_fk: match.match_id,
                type: "red"
            });
            });
            match.visitor.rcards.forEach((card: any) => {
                cardRecords.push({
                team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
                player_id_fk: leagueTeams.find(item => item.player_name === card)?.player_id,
                match_id_fk: match.match_id,
                type: "red"
            });
            });
        });
        });

    return cardRecords
};