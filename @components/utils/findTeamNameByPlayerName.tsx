import { ParticipantsFull } from "../types/ParticipantsFull";

export default function findTeamNameByPlayerName(participants: ParticipantsFull[], playerName: string, prop="name"): string | number | undefined {
// Iterate over all participants
for (const participant of participants) {
    // Check if any player in the current participant's players array matches the given player name
    const player = participant.players.find(p => p.nickname === playerName);

    if (player) {
    // If a match is found, return the team_name of the participant
    if(prop === "name"){
        return participant.team_name;
    }else{
        return participant.team_id;
    }
    }
}

return undefined;
};