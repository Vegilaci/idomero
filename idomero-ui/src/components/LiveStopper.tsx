import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";

export default function LiveStopper({ teamId }: { teamId: number }) {
  const [data, setData] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/team/${teamId}`);
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

    wsRef.current.send(JSON.stringify({ action }));
  }

  return (
    <div className="flex flex-column align-items-center gap-3">
      <h1>Csapat #{teamId}</h1>

      <div className="text-color-secondary">
        {data ? JSON.stringify(data) : "-- várakozás --"}
      </div>

      <div className="flex gap-3">
        <Button
          label="Start"
          icon="pi pi-play"
          onClick={() => startLiveStopper("start")}
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
