import type { LapEvent } from "./types";

export function connectToTeam(
    teamId: number,
    onMessage: (data: LapEvent) => void
): WebSocket {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${teamId}`);

    ws.onopen = () => console.log("WS connected");
    ws.onclose = () => console.log("WS disconnected");
    ws.onerror = (err) => console.error("WS error:", err);

    ws.onmessage = (msg) => {
        try {
            const data = JSON.parse(msg.data) as LapEvent;
            onMessage(data);
        } catch (error) {
            console.error("Invalid WS message:", error);
        }
    };

    return ws;
}
