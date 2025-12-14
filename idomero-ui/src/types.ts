// src/types.ts

export interface LapEvent {
    event: "new_lap";
    team_id: number;
    lap_number: number;
    time_ms: number;
}
