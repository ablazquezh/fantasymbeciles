export default function generateRoundRobinSchedule(teamsInput: (string | null)[]): { ida: any[], vuelta: any[] } {
    const teams = [...teamsInput];
    const isOdd = teams.length % 2 !== 0;
  
    if (isOdd) {
      teams.push(null); // 'null' represents a bye week
    }
  
    const numTeams = teams.length;
    const totalMatchdays = numTeams - 1;
    const matchesPerDay = numTeams / 2;
  
    const ida = [];
    const vuelta = [];
  
    let rotating = teams.slice(1); // Keep first team fixed
  
    for (let round = 0; round < totalMatchdays; round++) {
      const idaMatches = [];
      const vueltaMatches = [];
  
      const current = [teams[0], ...rotating];
  
      for (let i = 0; i < matchesPerDay; i++) {
        const home = current[i];
        const away = current[numTeams - 1 - i];
  
        if (home !== null && away !== null) {
          // Randomize home/away for ida
          const idaMatch = Math.random() < 0.5
            ? { 
                local: { team: home, goals: [], ycards: [], rcards: [] }, 
                visitor: { team: away, goals: [], ycards: [], rcards: [] },
                played: false
              }
            : { 
                local: { team: away, goals: [], ycards: [], rcards: [] }, 
                visitor: { team: home, goals: [], ycards: [], rcards: [] },
                played: false
              };
  
          // Vuelta is the reverse fixture
          const vueltaMatch = {
            local: { team: idaMatch.visitor.team, goals: [], ycards: [], rcards: [] },
            visitor: { team: idaMatch.local.team, goals: [], ycards: [], rcards: [] },
            played: false
          };
  
          idaMatches.push(idaMatch);
          vueltaMatches.push(vueltaMatch);
        }
      }
  
      ida.push({
        matchday: round + 1,
        matches: idaMatches
      });
  
      vuelta.push({
        matchday: round + 1 + totalMatchdays, // Matchdays continue from ida
        matches: vueltaMatches
      });
  
      // Rotate teams (except first one)
      const last = rotating.pop();
      if (last) {
        rotating = [last, ...rotating];
      }
    }
  
    return { ida, vuelta };
  }
  