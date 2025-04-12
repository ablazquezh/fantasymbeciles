import { Schedule } from "../types/Schedule";

export default function getPlayersWithXYellowCardsWithReset(
    schedule: Schedule,
    currentMatchday: number,
    yellowCardThreshold: number,
    resetConsecutive: number
  ): string[] {
    const yellowCardMap = new Map<
      string,
      { count: number; team: string; history: number[] }
    >();
  
    const allMatchdays = [...schedule.ida, ...schedule.vuelta]
      .filter(md => md.matchday < currentMatchday)
      .sort((a, b) => a.matchday - b.matchday); // chronological order
  
    for (const matchdayGroup of allMatchdays) {
      const playersThisMatchday = new Map<string, string>(); // player -> team
      const playersWithRedCard = new Set<string>();
      const playersWithInjury = new Set<string>();
  
      for (const match of matchdayGroup.matches) {
        const teams = [match.local, match.visitor];
  
        for (const team of teams) {
          // Handle yellow cards
          for (const player of team.ycards) {
            playersThisMatchday.set(player, team.team);
  
            if (!yellowCardMap.has(player)) {
              yellowCardMap.set(player, {
                count: 1,
                team: team.team,
                history: [1],
              });
            } else {
              const entry = yellowCardMap.get(player)!;
              entry.count += 1;
              entry.history.push(1);
            }
          }
  
          // Handle red card reset
          for (const player of team.rcards) {
            playersWithRedCard.add(player);
          }
          for (const player of team.rcards) {
            playersWithInjury.add(player);
          }
        }
      }
  
      // Handle yellow reset conditions
      yellowCardMap.forEach((entry, player) => {
        const gotYellow = playersThisMatchday.has(player);
        const gotRed = playersWithRedCard.has(player);
        const gotInjury = playersWithInjury.has(player);
  
        if (gotRed || gotInjury) {
          // Reset immediately on red
          entry.count = 0;
          entry.history = [];
        } else if (!gotYellow) {
          // Append 0 if no yellow this matchday
          entry.history.push(0);
  
          // Check last N values for 0s
          const recent = entry.history;
          let consecutiveZero = 0;
          for (let i = recent.length - 1; i >= 0; i--) {
            if (recent[i] === 0) {
              consecutiveZero++;
              if (consecutiveZero >= resetConsecutive) {
                entry.count = 0;
                entry.history = [];
                break;
              }
            } else {
              break;
            }
          }
        }
      });
    }
  
    const result: string[] = [];
  
    yellowCardMap.forEach((value, player) => {
      if (value.count === yellowCardThreshold) {
        result.push(player);
      }
    });
  
    return result;
  }