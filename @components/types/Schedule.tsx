import { MatchInfo } from "./MatchInfo";

export interface MatchDay {
    matchday: number;
    matches: MatchInfo[];
}

export interface Schedule {
    ida: MatchDay[];  // "ida" is an array of matchdays for the first leg
    vuelta: MatchDay[];  // "vuelta" is an array of matchdays for the second leg
}