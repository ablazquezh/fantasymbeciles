import { cards, goals, injuries } from "@prisma/client";
import { MatchRecords } from "../types/MatchRecords";
import { Schedule } from "../types/Schedule";
import { ParticipantsFull } from "../types/ParticipantsFull";

const findPlayerNameByPlayerID = (participants: ParticipantsFull[], playerId: number): string | undefined => {
// Iterate over all participants
  for (const participant of participants) {
      // Check if any player in the current participant's players array matches the given player name
      const player = participant.players.find(p => p.ID === playerId)?.nickname;

      if (player) {
      // If a match is found, return the team_name of the participant
        return player;
      }
  }

  return undefined;
};

const getScheduleInfo = (match: MatchRecords, dbgoals: goals[], dbcards: cards[], dbinjuries: injuries[], participants: ParticipantsFull[], team_fk: number) =>{
  // Group matches by matchday
  //const matchday = match.matchday!;
  //const stage = matchday! <= 3 ? "ida" : "vuelta"; // Determine stage (ida or vuelta)
  
  console.log("=============================================")
  console.log(dbgoals)

  const scoredGoals = dbgoals.filter(item => item.match_id_fk === match.ID && item.team_id_fk == team_fk)
  console.log("????????????????????????????????????????????")
  console.log(scoredGoals)
  const goalList = scoredGoals.map(item => ({
    
    player: findPlayerNameByPlayerID(participants, item.player_id_fk!),
    n: item.quantity,
  }));
  console.log(goalList)
  const shownYCards = dbcards.filter(item => item.match_id_fk === match.ID && item.team_id_fk == team_fk && item.type === "yellow")
  const yCardList = shownYCards.map(item => (findPlayerNameByPlayerID(participants, item.player_id_fk!)) );

  const shownRCards = dbcards.filter(item => item.match_id_fk === match.ID && item.team_id_fk == team_fk && item.type === "red")
  const rCardList = shownRCards.map(item => (findPlayerNameByPlayerID(participants, item.player_id_fk!)) );

  const injuries = dbinjuries.filter(item => item.match_id_fk === match.ID && item.team_id_fk == team_fk)
  const injuryList = injuries.map(item => (findPlayerNameByPlayerID(participants, item.player_id_fk!)) );

  return {goalList, yCardList, rCardList, injuryList}
}

export default function generateScheduleFromDB(matches: MatchRecords[], dbcards: cards[], dbgoals: goals[], dbinjuries: injuries[], leagueTable: any[], participants: ParticipantsFull[]) {
    const schedule: Schedule = {
      ida: [],
      vuelta: []
    };
  

    console.log(":::_____-----")
    console.log(leagueTable)
    console.log(matches)
    // Group matches by matchday
    matches.forEach((match) => {

      console.log("Check this match", match)
      console.log("Check this match",getScheduleInfo(match, dbgoals, dbcards, dbinjuries, participants, match.visitor_team_id_fk!))
      const matchday = match.matchday!;
      const stage = matchday! <= 3 ? "ida" : "vuelta"; // Determine stage (ida or vuelta)

      const {goalList: lGoalList, yCardList: lYCardList, rCardList: lRCardList, injuryList: lInjuryList} = getScheduleInfo(match, dbgoals, dbcards, dbinjuries, participants, match.local_team_id_fk!)
      const {goalList: vGoalList, yCardList: vYCardList, rCardList: vRCardList, injuryList: vInjuryList} = getScheduleInfo(match, dbgoals, dbcards, dbinjuries, participants, match.visitor_team_id_fk!)

      const matchObject = {
        local: {
          team: leagueTable.find(item => item.team_id === match.local_team_id_fk)?.team_name,
          goals: lGoalList,
          ycards: lYCardList,
          rcards: lRCardList,
          injuries: lInjuryList,
        },
        visitor: {
          team: leagueTable.find(item => item.team_id === match.visitor_team_id_fk)?.team_name,
          goals: vGoalList,
          ycards: vYCardList,
          rcards: vRCardList,
          injuries: vInjuryList,
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

    schedule.ida.sort((a, b) => a.matchday - b.matchday);
    schedule.vuelta.sort((a, b) => a.matchday - b.matchday);
  
    return schedule;
  }