import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Global_ip } from "../global_ip";
import { secondsToHHMMSS } from "../Clock/idovalto";
import { Get_team_and_members } from "../api/teams";
import { GetVersenyzo } from "../api/versenyzok";
import type { Member } from "../types/members";

import { Menu } from "primereact/menu";

import "../assets/stopwatch.css";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export default function LiveStopper({
  teamId,
  teamName,
}: {
  teamId: number;
  teamName: string;
}) {
  const [data, setData] = useState<any>(null);
  const [csapat, setCsapat] = useState<any>(null);
  const [aktivTekero, setAktivTekero] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  const [membersWithLaps, setMembersWithLaps] = useState<Member[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  
  const [isKilled, setIsKilled] = useState(false);
  const stopMenuRef = useRef<Menu>(null);

  function getActiveRiderId(teamData: any): number | null {
    if (!teamData) return null;

    if (typeof teamData.rider_now === "number") {
      return teamData.rider_now;
    }

    if (Array.isArray(teamData.members)) {
      const activeMember = teamData.members.find(
        (member: any) =>
          member?.is_active === true || member?.active === true,
      );

      if (typeof activeMember?.id === "number") {
        return activeMember.id;
      }
    }

    return null;
  }
  
 
  function hasRefreshEvent(payload: any): boolean {
    return (
      payload?.event === "refresh" ||
      payload?.event === "refres" ||
      payload?.event?.refresh ||
      payload?.event?.refres ||
      payload?.refresh === true ||
      payload?.refres === true
    );
  }

  async function refreshTeamAndActiveRider() {
    const [teamData, allMembers] = await Promise.all([
      Get_team_and_members(teamId),
      GetVersenyzo(),
    ]);

    setCsapat(teamData);

    const teamMembersWithLaps = allMembers.filter(
      (member) => member.team_id === teamId,
    );

    setMembersWithLaps(teamMembersWithLaps);

    const activeRiderId = getActiveRiderId(teamData);

    setAktivTekero(
      typeof activeRiderId === "number" ? activeRiderId : null,
    );
  }
  useEffect(() => {
    setConnectionStatus("connecting");

    const ws = new WebSocket(
      `ws://${Global_ip()}:8000/ws/team/${teamId}`,
    );

    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed?.event === "killed") {
          setIsKilled(true);
          setData({
            event: "killed",
            is_running: false,
            elapsed_s: 0,
          });
          return;
}
        if (hasRefreshEvent(parsed)) {
          refreshTeamAndActiveRider().catch((error) => {
            console.error(
              "Nem sikerült a csapatadatok frissítése",
              error,
            );
          });

          return;
        }

        setData(parsed);

        const wsActiveRiderId =
          typeof parsed?.active_member_id === "number"
            ? parsed.active_member_id
            : typeof parsed?.active_rider_id === "number"
              ? parsed.active_rider_id
              : typeof parsed?.active_tekero === "number"
                ? parsed.active_tekero
                : null;

        if (typeof wsActiveRiderId === "number") {
          setAktivTekero(wsActiveRiderId);
        }
      } catch {
        setData(event.data);
      }
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket hiba", error);
      setConnectionStatus("error");
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [teamId]);

  useEffect(() => {
    refreshTeamAndActiveRider().catch((error) => {
      console.error("Nem sikerült frissíteni a csapatadatokat", error);
    });
  }, [teamId]);

  async function startLiveStopper(action: string) {
    if (
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      console.warn("A WebSocket kapcsolat még nem áll készen");
      return;
    }

    try {
      switch (action) {
        case "start":
          if (!data?.is_running) {
            wsRef.current.send(JSON.stringify({ action }));
            await refreshTeamAndActiveRider();
          }
          break;

        case "stop":
          if (data?.is_running) {
            wsRef.current.send(JSON.stringify({ action }));
            await refreshTeamAndActiveRider();
          }
          break;

        case "reset":
          wsRef.current.send(JSON.stringify({ action }));
          break;
        case "kill":
          wsRef.current.send(JSON.stringify({ action }));
          setIsKilled(true);
          setData({
            event: "killed",
            is_running: false,
            elapsed_s: 0,
          });
          break;
      }
    } catch (error) {
      console.error("Nem sikerült módosítani a stopper állapotát", error);
    }
  }

  const members = Array.isArray(csapat?.members)
    ? csapat.members
    : [];

  const activeMemberWithLaps = membersWithLaps.find(
    (member) => member.id === aktivTekero,
  );

  const previousLap =
    activeMemberWithLaps?.laps?.length > 0
      ? [...activeMemberWithLaps.laps].sort(
          (a, b) => b.lap_no - a.lap_no,
        )[0]
      : null;

  const isConnected = connectionStatus === "connected";
  const isRunning = data?.is_running === true;

function getStatusLabel() {
  if (isKilled) {
    return "Lezárva";
  }

  if (connectionStatus === "connecting") {
    return "Kapcsolódás";
  }

  if (connectionStatus === "error") {
    return "Kapcsolati hiba";
  }

  if (connectionStatus === "disconnected") {
    return "Nincs kapcsolat";
  }
  if (isKilled) {
  return "Lezárva";
}

  return isRunning ? "Aktív" : "Várakozik";
}
  
  const cardStatus =
  connectionStatus === "error" ||
  connectionStatus === "disconnected"
    ? "error"
    : isRunning
      ? "running"
      : "waiting";


  return (
    <article
      className={`team-timer-card team-timer-card-${cardStatus}`}
    >
      <header className="team-card-header">
        <div className="team-title-group">
          <div className="team-number">
            {teamName.slice(0, 1).toUpperCase()}
          </div>

          <h2 className="team-card-title">{teamName}</h2>
        </div>

        <span
          className={`team-status ${
            isRunning ? "team-status-running" : ""
          }`}
        >
          <span className="team-status-dot" />
          {getStatusLabel()}
        </span>
      </header>

      <div className={`team-time team-time-${cardStatus}`}>
        {data && typeof data.elapsed_s === "number"
          ? secondsToHHMMSS(data.elapsed_s)
          : "--:--:--"}
      </div>

      <section className="team-members">
        <div className="member-list member-list-stable">
          {members.map((member: any, index: number) => {
            const isActive = member.id === aktivTekero;

            return (
              <div
                className={`member-stable-item ${
                  isActive ? "member-stable-item-active" : ""
                }`}
                key={member.id}
              >
                <div
                  className={`member-avatar ${
                    isActive ? "active-rider-avatar" : ""
                  }`}
                >
                  {index + 1}
                </div>

                <div className="member-stable-content">
                  {isActive && (
                    <span className="active-rider-label">
                      Jelenleg pályán
                    </span>
                  )}

                  <strong className="member-stable-name">
                    {member.name}
                  </strong>
                </div>

                {isActive && (
                  <i className="pi pi-bolt active-rider-icon" />
                )}
              </div>
            );
          })}

          {members.length === 0 && (
            <div className="member-list-empty">
              Nincsenek versenyzők a csapatban
            </div>
          )}
        </div>
      </section>
      <section className="lap-reference-panel">
        <div className="lap-reference-item">
          <span className="lap-reference-label">
            Aktuális idő
          </span>

          <strong className="lap-reference-value lap-reference-current">
            {secondsToHHMMSS(
              typeof data?.elapsed_s === "number" ? data.elapsed_s : 0,
            )}
          </strong>
        </div>

        <div className="lap-reference-item">
          <span className="lap-reference-label">
            Előző kör
          </span>

          <strong className="lap-reference-value">
            {previousLap
              ? secondsToHHMMSS(previousLap.time_ms)
              : "--:--:--"}
          </strong>
        </div>
      </section>
      <footer className="team-card-footer">
        <div className="team-actions">
          <Button
            label="Start"
            icon="pi pi-play"
            onClick={() => startLiveStopper("start")}
            disabled={!isConnected || isRunning}
            className="team-action-button team-action-start"
          />

          <Button
            label="Köridő"
            icon="pi pi-replay"
            onClick={() => startLiveStopper("reset")}
            disabled={!isConnected}
            outlined
            className="team-action-button"
          />

          <div className="team-stop-control">
            <Button
              label="Stop"
              icon="pi pi-stop"
              onClick={() => startLiveStopper("stop")}
              disabled={!isConnected || !isRunning || isKilled}
              severity="danger"
              outlined
              className="team-action-button team-stop-main"
            />

            <Menu
              ref={stopMenuRef}
              popup
              className="team-stop-menu"
              model={[
                {
                  label: "Full stop",
                  icon: "pi pi-power-off",
                  command: () => startLiveStopper("kill"),
                  disabled: !isConnected || isKilled,
                },
              ]}
            />

            <Button
              icon="pi pi-chevron-down"
              onClick={(event) => stopMenuRef.current?.toggle(event)}
              disabled={!isConnected || isKilled}
              severity="danger"
              outlined
              className="team-stop-dropdown "
              aria-label="További stop műveletek"
            />
          </div>
        </div>
        <div className="team-connection">
          <span
            className={`connection-dot connection-${connectionStatus}`}
          />

          {connectionStatus === "connected"
            ? "Élő kapcsolat"
            : getStatusLabel()}
        </div>
      </footer>
    </article>
  );
}