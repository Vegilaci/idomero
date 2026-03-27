import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Global_ip } from "../global_ip";
import { Divider } from "primereact/divider";
import { secondsToHHMMSS } from "../Clock//idovalto";
import { Get_team_and_members } from "../api/teams";
import "../assets/stopwatch.css";

export default function LiveStopper({
  teamId,
  teamName,
}: {
  teamId: number;
  teamName: string;
}) {
  const [data, setData] = useState<any>(null); //websoket adatainak tárolása
  const [csapat, setCsapat] = useState<any>(null); //csapat adatainak tárolása
  const [aktiv_tekero, setAktiv_tekero] = useState<number | null>(null); //aktív tekerő tárolása

  const wsRef = useRef<WebSocket | null>(null);

  function getActiveRiderId(teamData: any): number | null {
    if (!teamData) return null;

    if (typeof teamData.rider_now === "number") return teamData.rider_now;

    if (Array.isArray(teamData.members)) {
      const activeMember = teamData.members.find(
        (member: any) => member?.is_active === true || member?.active === true,
      );
      if (typeof activeMember?.id === "number") return activeMember.id;
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
    const teamData = await Get_team_and_members(teamId);
    setCsapat(teamData);

    const activeRiderId = getActiveRiderId(teamData);
    if (typeof activeRiderId === "number") {
      setAktiv_tekero(activeRiderId);
    }
  }

  useEffect(() => {
    const ws = new WebSocket(`ws://${Global_ip()}:8000/ws/team/${teamId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        if (hasRefreshEvent(parsed)) {
          refreshTeamAndActiveRider().catch((error) => {
            console.error("Nem sikerult a refresh event feldolgozasa", error);
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
          setAktiv_tekero(wsActiveRiderId);
        }
      } catch {
        setData(event.data);
      }
    };
    ws.onopen = () => console.log("WS connected");
    ws.onclose = () => console.log("WS closed");
    ws.onerror = (e) => console.error("WS error", e);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [teamId]);

  //csapat adatainak lekérése (csapat neve, tagok nevei, id stb.)
  useEffect(() => {
    refreshTeamAndActiveRider().catch((error) => {
      console.error("Nem sikerult frissiteni a csapat adatokat", error);
    });
  }, [teamId]);

  async function startLiveStopper(action: string) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WS not ready");
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
      }
    } catch (error) {
      console.error("Nem sikerult frissiteni a stopper allapotot", error);
    }
  }

  function Active_rider(member: any) {
    if (member.id === aktiv_tekero) {
      return (
        <>
          <p key={member.id} className="text-primary font-bold text-3xl">
            {member.name}
          </p>
        </>
      );
    } else {
      return <p key={member.id}>{member.name}</p>;
    }
  }

  return (
    <>
      <div className="flex flex-column align-items-center">
        <h1>{teamName}</h1>

        <div className="text-color-secondary">
          <div className="stopper">
            <div className="stopper-btn"></div>
            <div className="stopper-ring">
              <div className="stopper-face">
                <span className="stopper-time">
                  {" "}
                  {data ? (
                    <>{secondsToHHMMSS(data.elapsed_s)}</>
                  ) : (
                    "-- várakozá a szerverre --"
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="stopwatch">
            <div className="time-text">
              {" "}
              {data ? (
                <>{secondsToHHMMSS(data.elapsed_s)}</>
              ) : (
                "-- várakozá a szerverre --"
              )}
            </div>
          </div>
        </div>
        {csapat && (
          <div className="pt-6">
            {csapat.members.map((member: any) => Active_rider(member))}
          </div>
        )}
        <Divider />

        <div className="flex gap-2">
          <Button
            label="Start"
            icon="pi pi-play"
            onClick={() => startLiveStopper("start")}
          />
          <Button
            label="Köridő"
            icon="pi pi-play"
            onClick={() => startLiveStopper("reset")}
          />
          <Button
            label="Stop"
            icon="pi pi-stop"
            onClick={() => startLiveStopper("stop")}
          />
        </div>
      </div>
    </>
  );
}
