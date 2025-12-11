import { useEffect, useState } from "react";

export default function LiveStopper({ teamId  }) {
  const [laps, setLaps] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/team/${teamId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === "new_lap") {
        setLaps((prev) => [...prev, data]);
      }
    };

    return () => ws.close();
  }, [teamId]);

  return (
    <div>
      <h1>Csapat #{teamId}</h1>
      <h2>
        {laps.length > 0 ? laps[laps.length - 1].time_ms : "Ready"}
      </h2>

      <ul>
        {laps.map((lap, idx) => (
          <li key={idx}>{lap.time_ms} ms</li>
        ))}
      </ul>
    </div>
  );
}
