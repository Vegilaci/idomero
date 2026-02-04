import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Global_ip } from "../global_ip";
import { Divider } from "primereact/divider";
import { secondsToHHMMSS } from "../Clock//idovalto";

export default function LiveStopper({
  teamId,
  teamName,
}: {
  teamId: number;
  teamName: string;
}) {
  const [data, setData] = useState<any>(null);
  const [ido, setido] = useState<number[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://${Global_ip()}:8000/ws/team/${teamId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        setData(JSON.parse(event.data));
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

  function startLiveStopper(action: string) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WS not ready");
      return;
    }
    if (action === "reset" && data) {
      setido([...ido, data.elapsed_s]);
      wsRef.current.send(JSON.stringify({ action }));
      action = "start";
      wsRef.current.send(JSON.stringify({ action }));
    }

    wsRef.current.send(JSON.stringify({ action }));
  }

  return (
    <div className="flex flex-column align-items-center">
      <h1>{teamName}</h1>

      <div className="text-color-secondary">
        {data ? (
          <>{secondsToHHMMSS(data.elapsed_s)}</>
        ) : (
          "-- várakozá a szerverre --"
        )}
      </div>
      <div className="pt-6">
        {ido.map((ido) => (
          <div key={ido}>{secondsToHHMMSS(ido)}</div>
        ))}
      </div>
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
  );
}
