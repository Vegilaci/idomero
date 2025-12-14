import { useEffect, useState } from "react";

export default function LiveStopper({ teamId }) {
  const [laps, setLaps] = useState([]);
  useEffect(() => {
    const wsUri = "ws://127.0.0.1:8000/ws/team/" + teamId;
    const ws = new WebSocket(wsUri);
    const [data, setdata] = useState([]);

    ws.onmessage = (event) => {
      setdata(JSON.parse(event.data));
    };

    return () => ws.close();
  }, [teamId]);

  return (
    <div>
      <h1>Csapat #{teamId}</h1>
      <div>{data}</div>
    </div>
  );
}
