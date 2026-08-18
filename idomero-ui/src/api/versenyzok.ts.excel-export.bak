import { api } from "./axios";
import type { Member } from "../types/members";

// export async function createTeam(name: string): Promise<TeamDetail> {
//   const res = await api.post<TeamDetail>("/teams/", {
//     name,
//   });
//   return res.data;
// }

export async function GetVersenyzo(): Promise<Member[]> {
  const res = await api.get<Member[]>("/members/");
  return res.data;
}

export async function Add_versenyzo(
  name: string,
  rajt_szam: number,
  team_id: number,
) {
  const res = await api.post<Member>("/members/", {
    name,
    rajt_szam,
    team_id,
  });
  return res.data;
}
