import type { Member, MemberSummary } from "./members";

export interface TeamSummary {
  id: number;
  name: string;
}

export interface TeamDetail {
  name: string;
  id: number;
  members: Member[];
}

export interface Team_with_members {
  id: number;
  name: string;
  members: MemberSummary[];
}
