from fastapi import APIRouter

router = APIRouter(tags=["WebSocket"])

@router.get("/ws/team/{team_id}", summary="WebSocket kapcsolat indítása")
async def websocket_doc(team_id: str):
    """
    **WebSocket Endpoint**  
    URL: `ws://localhost:8000/ws/team/{team_id}`

    Ezt az endpointot WebSocket klienssel kell használni — például böngésző, JS WebSocket API vagy Postman.

    ### Küldhető események:
    - *A backend méri az időt → frontnak nem kell eseményt küldeni.*

    ### Fogadható események:
    - `{"event": "started"}`
    - `{"event": "stopped"}`
    - `{"event": "reset"}`
    - `{"event": "new_lap", "time_ms": 1234}`

    ### Példa csatlakozás JavaScriptben:
    ```js
    const ws = new WebSocket("ws://localhost:8000/ws/team/1");

    ws.onmessage = (event) => {
        console.log("kapott:", event.data);
    };
    ```
    """
    return {"websocket": "Use a WebSocket client to connect."}
