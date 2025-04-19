import { leagues } from "@prisma/client";
import { BonusRecords } from "../types/BonusRecords";
import { MatchInfo } from "../types/MatchInfo";
import { Schedule } from "../types/Schedule";

export default function bonusRecordGenerator(schedule: Schedule, leagueTable: any[], dbleague: leagues) {

    const bonusRecords: BonusRecords[] = [];
    
    schedule!.ida.forEach(day => {
    day.matches.forEach((match: MatchInfo) => {
        
        let localctr = 0;
        let visitorctr = 0;

        match.local.goals.forEach((goal: any) => {
            localctr = localctr + goal.n
        
        });

        match.visitor.goals.forEach((goal: any) => {
            visitorctr = visitorctr + goal.n

        });

        if(localctr > visitorctr){
            bonusRecords.push({
                team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
                match_id_fk: match.match_id,
                quantity: dbleague.win_bonus
            });
        }else if(localctr < visitorctr){
            bonusRecords.push({
                team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
                match_id_fk: match.match_id,
                quantity: dbleague.win_bonus
            });
        }else{
            bonusRecords.push({
                team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
                match_id_fk: match.match_id,
                quantity: dbleague.draw_bonus
            });
            bonusRecords.push({
                team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
                match_id_fk: match.match_id,
                quantity: dbleague.draw_bonus
            });
        }

    });
    });

    schedule!.vuelta.forEach(day => {
    day.matches.forEach((match: MatchInfo) => {
        
            let localctr = 0;
            let visitorctr = 0;
    
            match.local.goals.forEach((goal: any) => {
                localctr = localctr + goal.n
            
            });
    
            match.visitor.goals.forEach((goal: any) => {
                visitorctr = visitorctr + goal.n
    
            });

            if(localctr > visitorctr){
                bonusRecords.push({
                    team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
                    match_id_fk: match.match_id,
                    quantity: dbleague.win_bonus
                });
            }else if(localctr < visitorctr){
                bonusRecords.push({
                    team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
                    match_id_fk: match.match_id,
                    quantity: dbleague.win_bonus
                });
            }else{
                bonusRecords.push({
                    team_id_fk: leagueTable.find(item => item.team_name === match.local.team)?.team_id,
                    match_id_fk: match.match_id,
                    quantity: dbleague.draw_bonus
                });
                bonusRecords.push({
                    team_id_fk: leagueTable.find(item => item.team_name === match.visitor.team)?.team_id,
                    match_id_fk: match.match_id,
                    quantity: dbleague.draw_bonus
                });
            }

    });
    });

    return bonusRecords
};