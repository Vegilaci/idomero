import type { Member } from "./members";

export interface TeamSummary {
  id: number;
  name: string;
}

export interface TeamDetail {
  name: string;
  id: number;
  members: Member[];
}
