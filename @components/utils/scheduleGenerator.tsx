import { v4 as uuidv4 } from 'uuid';

export default function generateRoundRobinSchedule(teamsInput: (string | null)[]): { ida: any[], vuelta: any[] } {

  const teams = [...teamsInput];
  const isOdd = teams.length % 2 !== 0;

  if (isOdd) {
    teams.push(null); // Add a bye if number of teams is odd
  }

  const numTeams = teams.length;
  const totalRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  const ida = [];
  const vuelta = [];

  // Generate all rounds
  for (let round = 0; round < totalRounds; round++) {
    const roundMatchesIda = [];
    const roundMatchesVuelta = [];

    for (let i = 0; i < matchesPerRound; i++) {
      const homeIdx = (round + i) % (numTeams - 1);
      let awayIdx = (numTeams - 1 - i + round) % (numTeams - 1);

      if (i === 0) {
        awayIdx = numTeams - 1;
      }

      const home = teams[homeIdx];
      const away = teams[awayIdx];

      if (home !== null && away !== null) {
        const idaMatch = Math.random() < 0.5
          ? {
              local: { team: home, goals: [], ycards: [], rcards: [], injuries: [] },
              visitor: { team: away, goals: [], ycards: [], rcards: [], injuries: [] },
              played: false,
              match_id: uuidv4()
            }
          : {
              local: { team: away, goals: [], ycards: [], rcards: [], injuries: [] },
              visitor: { team: home, goals: [], ycards: [], rcards: [], injuries: [] },
              played: false,
              match_id: uuidv4()
            };

        const vueltaMatch = {
          local: { team: idaMatch.visitor.team, goals: [], ycards: [], rcards: [], injuries: [] },
          visitor: { team: idaMatch.local.team, goals: [], ycards: [], rcards: [], injuries: [] },
          played: false,
          match_id: uuidv4()
        };

        roundMatchesIda.push(idaMatch);
        roundMatchesVuelta.push(vueltaMatch);
      }
    }

    ida.push({ matchday: round + 1, matches: roundMatchesIda });
    vuelta.push({ matchday: round + 1 + totalRounds, matches: roundMatchesVuelta });
  }

  return { ida, vuelta };
}

/*
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
                local: { team: home, goals: [], ycards: [], rcards: [], injuries: [] }, 
                visitor: { team: away, goals: [], ycards: [], rcards: [], injuries: [] },
                played: false,
                match_id: uuidv4()
              }
            : { 
                local: { team: away, goals: [], ycards: [], rcards: [], injuries: [] }, 
                visitor: { team: home, goals: [], ycards: [], rcards: [], injuries: [] },
                played: false,
                match_id: uuidv4()
              };
  
          // Vuelta is the reverse fixture
          const vueltaMatch = {
            local: { team: idaMatch.visitor.team, goals: [], ycards: [], rcards: [], injuries: [] },
            visitor: { team: idaMatch.local.team, goals: [], ycards: [], rcards: [], injuries: [] },
            played: false,
            match_id: uuidv4()
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
  
*/