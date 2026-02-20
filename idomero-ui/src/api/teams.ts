import { api } from "./axios";
import type { TeamSummary, TeamDetail } from "../types/teams";

export async function getTeamSummary(): Promise<TeamSummary[]> {
  const res = await api.get<TeamSummary[]>("/teams/summary");
  return res.data;
}

export async function getTeamById(id: number) {
  const res = await api.get(`/teams/${id}`);
  return res.data;
}

export async function getTeams(): Promise<TeamDetail[]> {
  const res = await api.get<TeamDetail[]>("/teams/");
  return res.data;
}

export async function createTeam(name: string): Promise<TeamDetail> {
  const res = await api.post<TeamDetail>("/teams/", {
    name,
  });
  return res.data;
}

export async function Get_team_and_members(id: number) {
  const res = await api.get(`/teams/${id}`);
  return res.data;
}
