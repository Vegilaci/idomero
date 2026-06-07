import { useEffect, useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import { getTeams, createTeam } from "../api/teams";
import type { TeamDetail } from "../types/teams";
import { secondsToHHMMSS } from "../Clock/idovalto";

import "../assets/teams.css";

export default function Csapatok() {
  const [teamName, setTeamName] = useState("");
  const [search, setSearch] = useState("");
  const [csapatok, setCsapatok] = useState<TeamDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<number[]>([]);

  const reloadTeams = async () => {
    setLoading(true);

    try {
      const data = await getTeams();
      setCsapatok(data);
    } catch (error) {
      console.error("Csapatok betöltése sikertelen", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("hu-HU");

    if (!normalizedSearch) {
      return csapatok;
    }

    return csapatok.filter((team) => {
      const teamMatch = team.name
        .toLocaleLowerCase("hu-HU")
        .includes(normalizedSearch);

      const memberMatch = team.members.some((member) =>
        member.name
          .toLocaleLowerCase("hu-HU")
          .includes(normalizedSearch),
      );

      return teamMatch || memberMatch;
    });
  }, [csapatok, search]);

  const handleSaveTeam = async () => {
    const normalizedName = teamName.trim();

    if (!normalizedName) return;

    try {
      await createTeam(normalizedName);
      setTeamName("");
      await reloadTeams();
    } catch (error) {
      console.error("Csapat mentése sikertelen", error);
    }
  };

  const toggleTeam = (teamId: number) => {
    setExpandedTeams((current) =>
      current.includes(teamId)
        ? current.filter((id) => id !== teamId)
        : [...current, teamId],
    );
  };

  const getTotalTeamLaps = (team: TeamDetail) =>
    team.members.reduce(
      (total, member) => total + member.laps.length,
      0,
    );

  const getMemberTotalTime = (teamMember: TeamDetail["members"][number]) =>
    teamMember.laps.reduce(
      (total, lap) => total + lap.time_ms,
      0,
    );

  return (
    <section className="teams-page">
      <header className="teams-page-header">
        <div>
          <span className="teams-page-eyebrow">
            Nevezési lista
          </span>

          <h1>Csapatok és résztvevők</h1>

          <p>
            A benevezett csapatok, versenyzők és mért körök áttekintése.
          </p>
        </div>

        <div className="teams-page-total">
          <i className="pi pi-users" />

          <div>
            <span>Összes csapat</span>
            <strong>{csapatok.length}</strong>
          </div>
        </div>
      </header>

      <div className="teams-toolbar">
        <div className="teams-search">
          <i className="pi pi-search" />

          <InputText
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Keresés csapatra vagy versenyzőre"
          />
        </div>

        <div className="teams-create">
          <InputText
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSaveTeam();
              }
            }}
            placeholder="Új csapat neve"
          />

          <Button
            label="Hozzáadás"
            icon="pi pi-plus"
            onClick={handleSaveTeam}
            disabled={!teamName.trim()}
          />
        </div>
      </div>

      <div className="teams-list">
        {loading ? (
          <div className="teams-empty-state">
            <span className="loader" />
            <p>Csapatok betöltése...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="teams-empty-state">
            <i className="pi pi-search" />
            <strong>Nincs találat</strong>
            <p>A megadott keresésre nem található csapat vagy versenyző.</p>
          </div>
        ) : (
          filteredTeams.map((team, teamIndex) => {
            const isExpanded = expandedTeams.includes(team.id);

            return (
              <article
                className={`team-list-card ${
                  isExpanded ? "team-list-card-expanded" : ""
                }`}
                key={team.id}
              >
                <button
                  type="button"
                  className="team-list-header"
                  onClick={() => toggleTeam(team.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="team-list-main">
                    <div className="team-list-number">
                      {teamIndex + 1}
                    </div>

                    <div className="team-list-title">
                      <strong>{team.name}</strong>

                      <span>
                        {team.members.length} versenyző
                        {" · "}
                        {getTotalTeamLaps(team)} mért kör
                      </span>
                    </div>
                  </div>

                  <div className="team-list-meta">
                    <span className="team-member-count">
                      <i className="pi pi-users" />
                      {team.members.length} fő
                    </span>

                    <i
                      className={`pi ${
                        isExpanded
                          ? "pi-chevron-up"
                          : "pi-chevron-down"
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="team-members-panel">
                    {team.members.length === 0 ? (
                      <div className="team-no-members">
                        <i className="pi pi-user-plus" />
                        <span>
                          Ehhez a csapathoz még nincs versenyző hozzáadva.
                        </span>
                      </div>
                    ) : (
                      <div className="team-members-table">
                        <div className="team-members-table-header">
                          <span>Rajtszám</span>
                          <span>Versenyző</span>
                          <span>Körök</span>
                          <span>Összidő</span>
                        </div>

                        {team.members.map((member) => (
                          <div
                            className="team-member-row"
                            key={member.id}
                          >
                            <span
                              className="team-member-start-number"
                              data-label="Rajtszám"
                            >
                              #{member.rajt_szam}
                            </span>

                            <strong data-label="Versenyző">
                              {member.name}
                            </strong>

                            <span data-label="Körök">
                              {member.laps.length}
                            </span>

                            <span
                              className="team-member-time"
                              data-label="Összidő"
                            >
                              {secondsToHHMMSS(
                                getMemberTotalTime(member),
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}