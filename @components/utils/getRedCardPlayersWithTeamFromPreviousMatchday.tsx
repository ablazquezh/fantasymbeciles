import { Schedule } from "../types/Schedule";

export default function getRedCardPlayersWithTeamFromPreviousMatchday(schedule: Schedule, matchday:number) {
    let redCardPlayers: string[] = [];  // Explicitly type the array

    // Determine if the matchday is in ida or vuelta
    const stage = matchday <= 3 ? 'ida' : 'vuelta';
    const previousMatchday = matchday - 1;
  
    // Find the correct matchday object
    let previousMatchdayData = schedule[stage].find((data) => data.matchday === previousMatchday);
    if(previousMatchdayData === undefined){
        previousMatchdayData = schedule[stage === "vuelta" ? "ida" : "vuelta"].find((data) => data.matchday === previousMatchday);
    }

    if (previousMatchdayData) {
      // Iterate over all the matches in the previous matchday
      previousMatchdayData.matches.forEach((match) => {
        // Check local team red cards
        if (match.local.rcards.length > 0) {
          match.local.rcards.forEach((player) => {
            redCardPlayers.push(player);
          });
        }
        // Check visitor team red cards
        if (match.visitor.rcards.length > 0) {
          match.visitor.rcards.forEach((player) => {
            redCardPlayers.push(player );
          });
        }
      });
    }
  
    return redCardPlayers;
  };
