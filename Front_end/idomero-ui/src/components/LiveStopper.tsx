import { useEffect, useState } from "react";

export default function LiveStopper({ teamId  }) {
  const [laps, setLaps] = useState([]);

  useEffect(() => {
    const wsUri = "ws://127.0.0.1:8000/";
    const websocket = new WebSocket(wsUri);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
    };

    return () => ws.close();
  }, [teamId]);

  return (
    <div>
      <h1>Csapat #{teamId}</h1>
    </div>
  );
}
