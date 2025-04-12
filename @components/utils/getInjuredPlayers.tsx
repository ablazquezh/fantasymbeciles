import { Schedule } from "../types/Schedule";

export default function getInjuredPlayers(schedule: Schedule, matchday:number) {
    let injuredPlayers: string[] = [];  // Explicitly type the array

    // Determine if the matchday is in ida or vuelta
    const stage = matchday <= 3 ? 'ida' : 'vuelta';
    const previousMatchday = matchday - 1;
    
    // Find the correct matchday object
    let previousMatchdayData = schedule[stage].find((data) => data.matchday === previousMatchday);
    if(previousMatchdayData === undefined){
        previousMatchdayData = schedule[stage === "vuelta" ? "ida" : "vuelta"].find((data) => data.matchday === previousMatchday);
    }

  console.log(previousMatchdayData)
    if (previousMatchdayData) {
      // Iterate over all the matches in the previous matchday
      previousMatchdayData.matches.forEach((match) => {
        if (match.local.injuries.length > 0) {
          match.local.injuries.forEach((player) => {
            injuredPlayers.push(player);
          });
        }
        if (match.visitor.injuries.length > 0) {
          match.visitor.injuries.forEach((player) => {
            injuredPlayers.push(player );
          });
        }
      });
    }
  
    return injuredPlayers;
  };
