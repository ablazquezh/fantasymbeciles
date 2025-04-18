
export interface BudgetRecord {
    team_id: number;
    team_name: string;
    team_avg_std: number;
    budget: number;
    game: string;
    league_id_fk: number;
}
