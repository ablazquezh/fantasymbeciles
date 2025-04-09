
export type RowData = {
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