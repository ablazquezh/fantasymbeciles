import { MatchDetails } from "./MatchDetails";

export interface MatchInfo {
    local: MatchDetails;
    visitor: MatchDetails;
    played: boolean;
    match_id: string | null;
}
