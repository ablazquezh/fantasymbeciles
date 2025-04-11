import { cards, goals } from "@prisma/client";
import { MatchRecords } from "../types/MatchRecords";
import { Schedule } from "../types/Schedule";

export default function generateScheduleFromDB(matches: MatchRecords[], dbcards: cards[], dbgoals: goals[], leagueTable: any[]) {
    const schedule: Schedule = {
      ida: [],
      vuelta: []
    };
  
    // Group matches by matchday
    matches.forEach((match) => {
      const matchday = match.matchday!;
      const stage = matchday! <= 3 ? "ida" : "vuelta"; // Determine stage (ida or vuelta)
      const matchObject = {
        local: {
          team: leagueTable.find(item => item.team_id === match.local_team_id_fk)?.team_name,
          goals: dbgoals.filter(item => item.match_id_fk === match.ID),
          ycards: [],
          rcards: [],
        },
        visitor: {
          team: leagueTable.find(item => item.team_id === match.visitor_team_id_fk)?.team_name,
          goals: [],
          ycards: [],
          rcards: [],
        },
        played: match.played!,
        match_id: match.ID
      };
  
      // Check if matchday already exists in the stage
      const existingMatchday = schedule[stage].find((day) => day.matchday === matchday);
      if (existingMatchday) {
        existingMatchday.matches.push(matchObject);
      } else {
        schedule[stage].push({
          matchday,
          matches: [matchObject]
        });
      }
    });
  
    return schedule;
  }