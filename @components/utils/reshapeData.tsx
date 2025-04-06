import mergeData from "./mergeData";
  

type RowData = {
    ID: number;
    nickname: string | null;
    positions: string[] | null;
    country_code: string | null;
    value: number | null;
    wage: number | null;
    average: number | null;
    global_position: string | null;
    team_name: string | null;
    detail: {
      age: number | null;
      height: number | null;
      best_foot: string | null;
      weak_foot_5stars: number | null;
      heading: number | null;
      jump: number | null;
      long_pass: number | null;
      short_pass: number | null;
      dribbling: number | null;
      acceleration: number | null;
      speed: number | null;
      shot_power: number | null;
      long_shot: number | null;
      stamina: number | null;
      defense: number | null;
      interception: number | null;
    };
  };

  export default function reshapeData(data: ReturnType<typeof mergeData>) {
    
    return data.reduce((acc, item) => {
      const existingItem = acc.find((x) => x.ID === item.ID && x.nickname === item.nickname && x.average === item.average && x.positions === item.positions && 
      x.country_code === item.country_code && x.value === item.value && x.wage === item.wage && x.global_position === item.global_position && x.team_name === item.teams.team_name );
      
      const newXEntry = {
        age: item.age,
        height: item.height,
        best_foot: item.best_foot,
        weak_foot_5stars: item.weak_foot_5stars,
        heading: item.heading,
        jump: item.jump,
        long_pass: item.long_pass,
        short_pass: item.short_pass,
        dribbling: item.dribbling,
        acceleration: item.acceleration,
        speed: item.speed,
        shot_power: item.shot_power,
        long_shot: item.long_shot,
        stamina: item.stamina,
        defense: item.defense,
        interception: item.interception
      };
  
      if (existingItem) {
        existingItem.detail = newXEntry;
      } else {
        acc.push({
          ID: item.ID,
          nickname: item.nickname,
          average: item.average,
          positions: item.positions,
          global_position: item.global_position,
          wage: item.wage,
          value: item.value,
          country_code: item.country_code,
          team_name: item.teams?.team_name ?? "freeagent",
          detail: newXEntry
        });
      }
  
      return acc;
    }, [] as RowData[]);
  }
  