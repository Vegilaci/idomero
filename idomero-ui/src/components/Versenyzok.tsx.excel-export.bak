import { useEffect, useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import type { InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import { GetVersenyzo, Add_versenyzo } from "../api/versenyzok";
import { getTeamSummary } from "../api/teams";

import type { TeamSummary } from "../types/teams";
import type { Member } from "../types/members";

import { secondsToHHMMSS } from "../Clock/idovalto";

import { isAdmin } from "../auth/auth";

import "../assets/racers.css";

export default function Versenyzok() {
  //admin state ell
  const [admin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    function refreshAdminState() {
      setIsAdmin(isAdmin());
    }

    refreshAdminState();

    window.addEventListener("storage", refreshAdminState);
    window.addEventListener("focus", refreshAdminState);
    window.addEventListener("adminChanged", refreshAdminState);

    return () => {
      window.removeEventListener("storage", refreshAdminState);
      window.removeEventListener("focus", refreshAdminState);
      window.removeEventListener("adminChanged", refreshAdminState);
    };
  }, []);

  //admin state ell

  const [name, setName] = useState("");
  const [startNumber, setStartNumber] = useState<number>(0);
  const [selectedTeam, setSelectedTeam] = useState<TeamSummary | null>(null);

  const [search, setSearch] = useState("");
  const [racers, setRacers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRacers, setExpandedRacers] = useState<number[]>([]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [racersData, teamsData] = await Promise.all([
        GetVersenyzo(),
        getTeamSummary(),
      ]);

      setRacers(racersData);
      setTeams(teamsData);
    } catch (error) {
      console.error("Versenyzők betöltése sikertelen", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRacers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("hu-HU");

    if (!normalizedSearch) {
      return racers;
    }

    return racers.filter((racer) => {
      const racerMatch = racer.name
        .toLocaleLowerCase("hu-HU")
        .includes(normalizedSearch);

      const team = teams.find(
        (currentTeam) => currentTeam.id === racer.team_id,
      );

      const teamMatch = team?.name
        .toLocaleLowerCase("hu-HU")
        .includes(normalizedSearch);

      const startNumberMatch = racer.rajt_szam
        .toString()
        .includes(normalizedSearch);

      return racerMatch || teamMatch || startNumberMatch;
    });
  }, [racers, teams, search]);

  const getTeamName = (teamId: number) =>
    teams.find((team) => team.id === teamId)?.name ?? "Nincs csapat";

  const getTotalTime = (racer: Member) =>
    racer.laps.reduce((total, lap) => total + lap.time_ms, 0);

  const get_avg = (racer: Member) =>
    racer.laps.length > 0
      ? racer.laps.reduce((total, lap) => total + lap.time_ms, 0) /
        racer.laps.length
      : 0;

  const getBestLap = (racer: Member) => {
    if (racer.laps.length === 0) {
      return null;
    }

    return racer.laps.reduce((best, current) =>
      current.time_ms < best.time_ms ? current : best,
    );
  };

  const handleSave = async () => {
    const normalizedName = name.trim();

    if (!normalizedName || !selectedTeam || startNumber <= 0) {
      return;
    }

    try {
      await Add_versenyzo(normalizedName, startNumber, selectedTeam.id);

      setName("");
      setStartNumber(0);
      setSelectedTeam(null);

      await loadData();
    } catch (error) {
      console.error("Versenyző mentése sikertelen", error);
    }
  };

  const toggleRacer = (racerId: number) => {
    setExpandedRacers((current) =>
      current.includes(racerId)
        ? current.filter((id) => id !== racerId)
        : [...current, racerId],
    );
  };

  return (
    <section className="racers-page">
      <header className="racers-page-header">
        <div>
          <span className="racers-page-eyebrow">Nevezési lista</span>

          <h1>Versenyzők</h1>

          <p>Versenyzők, rajtszámok, csapatok és mért körök áttekintése.</p>
        </div>

        <div className="racers-page-total">
          <i className="pi pi-user" />

          <div>
            <span>Összes versenyző</span>
            <strong>{racers.length}</strong>
          </div>
        </div>
      </header>

      <div className="racers-toolbar">
        <div className="racers-search">
          <i className="pi pi-search" />

          <InputText
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Keresés névre, csapatra vagy rajtszámra"
          />
        </div>
        {admin ? (
          <>
            <div className="racers-create">
              <InputText
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Versenyző neve"
              />

              <InputNumber
                value={startNumber}
                onValueChange={(event: InputNumberValueChangeEvent) =>
                  setStartNumber(event.value ?? 0)
                }
                useGrouping={false}
                min={1}
                placeholder="Rajtszám"
              />

              <Dropdown
                value={selectedTeam}
                options={teams}
                optionLabel="name"
                onChange={(event) => setSelectedTeam(event.value)}
                placeholder="Csapat"
              />

              <Button
                label="Hozzáadás"
                icon="pi pi-plus"
                onClick={handleSave}
                disabled={!name.trim() || !selectedTeam || startNumber <= 0}
              />
            </div>
          </>
        ) : (
          ""
        )}
      </div>

      <div className="racers-list">
        {loading ? (
          <div className="racers-empty-state">
            <span className="loader" />
            <p>Versenyzők betöltése...</p>
          </div>
        ) : filteredRacers.length === 0 ? (
          <div className="racers-empty-state">
            <i className="pi pi-search" />
            <strong>Nincs találat</strong>
            <p>A megadott keresésre nem található versenyző.</p>
          </div>
        ) : (
          filteredRacers.map((racer) => {
            const isExpanded = expandedRacers.includes(racer.id);

            const bestLap = getBestLap(racer);

            return (
              <article
                className={`racer-card ${
                  isExpanded ? "racer-card-expanded" : ""
                }`}
                key={racer.id}
              >
                <button
                  type="button"
                  className="racer-card-header"
                  onClick={() => toggleRacer(racer.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="racer-card-main">
                    <div className="racer-start-number">#{racer.rajt_szam}</div>

                    <div className="racer-card-title">
                      <strong>{racer.name}</strong>

                      <span>{getTeamName(racer.team_id)}</span>
                    </div>
                  </div>

                  <div className="racer-card-summary">
                    <div>
                      <span>Körök</span>
                      <strong>{racer.laps.length}</strong>
                    </div>

                    <div>
                      <span>Összidő</span>
                      <strong>{secondsToHHMMSS(getTotalTime(racer))}</strong>
                    </div>

                    <i
                      className={`pi ${
                        isExpanded ? "pi-chevron-up" : "pi-chevron-down"
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="racer-laps-panel">
                    <div className="racer-statistics">
                      <div>
                        <span>Csapat</span>
                        <strong>{getTeamName(racer.team_id)}</strong>
                      </div>

                      <div>
                        <span>Mért körök</span>
                        <strong>{racer.laps.length}</strong>
                      </div>

                      <div>
                        <span> Átlag</span>
                        <strong>{secondsToHHMMSS(get_avg(racer))}</strong>
                      </div>

                      <div>
                        <span>Legjobb kör</span>
                        <strong>
                          {bestLap
                            ? secondsToHHMMSS(bestLap.time_ms)
                            : "--:--:--"}
                        </strong>
                      </div>

                      <div>
                        <span>Összidő</span>
                        <strong>{secondsToHHMMSS(getTotalTime(racer))}</strong>
                      </div>
                    </div>

                    {racer.laps.length === 0 ? (
                      <div className="racer-no-laps">
                        <i className="pi pi-stopwatch" />
                        <span>
                          Ehhez a versenyzőhöz még nincs rögzített kör.
                        </span>
                      </div>
                    ) : (
                      <div className="racer-laps-table">
                        <div className="racer-laps-table-header">
                          <span>Kör</span>
                          <span>Idő</span>
                        </div>

                        {[...racer.laps]
                          .sort((a, b) => a.lap_no - b.lap_no)
                          .map((lap) => (
                            <div className="racer-lap-row" key={lap.id}>
                              <span data-label="Kör">{lap.lap_no}. kör</span>

                              <strong data-label="Idő">
                                {secondsToHHMMSS(lap.time_ms)}
                              </strong>
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
