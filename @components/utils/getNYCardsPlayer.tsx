import { Schedule } from "../types/Schedule";

export default function getNYCardsPlayer(
    nickname: string,
    schedule: Schedule,
    currentMatchday: number,
    resetConsecutive: number,
    injuryReset: boolean,
    redReset: boolean
  ): number {

    let count = 0;
    let resetRed = false;
    let resetInjury = false;
    let history: number[] = [];

    const allMatchdays = [...schedule.ida, ...schedule.vuelta]
      .filter(md => md.matchday < currentMatchday)
      .sort((a, b) => a.matchday - b.matchday); // chronological order
  
    for (const matchdayGroup of allMatchdays) {
        let gotYellow = false;
        for (const match of matchdayGroup.matches) {
            const teams = [match.local, match.visitor];
    
            for (const team of teams) {
            // Handle yellow cards
            for (const player of team.ycards) {
    
                if (player === nickname) {
                    count = count +1;
                    history.push(1);
                    gotYellow = true;
                }
            }
    
            // Handle red card reset
            for (const player of team.rcards) {
                if (player === nickname) {
                    resetRed = true;
                } 
            }
            for (const player of team.injuries) {
                if (player === nickname) {
                    resetInjury = true;
                } 
            }
            }
        }
  
        // Handle yellow reset conditions
        if ((resetRed && redReset) || (resetInjury && injuryReset)) {
        // Reset immediately on red
        count = 0;
        history = [];
        } else if (!gotYellow) {
            // Append 0 if no yellow this matchday
            history.push(0);

            // Check last N values for 0s
            const recent = history;
            let consecutiveZero = 0;
            for (let i = recent.length - 1; i >= 0; i--) {
                if (recent[i] === 0) {
                consecutiveZero++;
                if (consecutiveZero >= resetConsecutive) {
                    count = 0;
                    history = [];
                    break;
                }
                } else {
                break;
                }
            }
        }

    }
  
  
    return count;
  }