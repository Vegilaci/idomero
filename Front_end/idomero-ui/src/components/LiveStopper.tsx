import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { connectToTeam } from "../wsClient";
import type { LapEvent } from "../types";

interface LiveStopperProps {
    teamId: number;
}

export default function LiveStopper({ teamId }: LiveStopperProps) {
    const [laps, setLaps] = useState<LapEvent[]>([]);

    useEffect(() => {
        const ws = connectToTeam(teamId, (data) => {
            if (data.event === "new_lap") {
                setLaps((prev) => [...prev, data]);
            }
        });

        return () => ws.close();
    }, [teamId]);

    const lastLap = laps[laps.length - 1];

    return (
        <div className="flex flex-col gap-4 p-4 max-w-xl mx-auto">

            <Card title={`Csapat #${teamId}`} className="text-center">
                <h1 className="text-6xl font-bold text-blue-400">
                    {lastLap ? `${lastLap.time_ms} ms` : "Ready"}
                </h1>
            </Card>

            <Card title="Körök">
                <div className="flex flex-col gap-2">
                    {laps.map((lap, idx) => (
                        <div
                            key={idx}
                            className="flex justify-between items-center p-3 bg-gray-800 rounded-lg animate-fadein"
                        >
                            <span className="text-lg">Kör {lap.lap_number}</span>
                            <Tag severity="info" value={`${lap.time_ms} ms`} />
                        </div>
                    ))}
                </div>
            </Card>

        </div>
    );
}
