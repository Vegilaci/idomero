import type { Lap } from "./lap";

export interface Member {
  id: number;
  name: string;
  rajt_szam: number;
  team_id: number;
  laps: Lap[];
}
