import LiveStopper from "./components/LiveStopper";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./assets/home.css";
import type { TeamSummary } from "./types/teams";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [csapatok, setCsapatok] = useState<TeamSummary[]>([]);
  const navigate = useNavigate();

  const url = "http://192.168.0.40:8000/api/teams/summary";

  async function getTeamSummary() {
    const res = await axios.get(url);
    return res.data;
  }

  useEffect(() => {
    getTeamSummary().then((data) => {
      setCsapatok(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && csapatok.length === 0) {
      navigate("/mezony", { replace: true });
    }
  }, [csapatok, loading]);

  return (
    <>
      {loading ? (
        <div className="flex justify-content-center align-items-center home-loader">
          <span className="loader"></span>
        </div>
      ) : (
        <>
          <div className="grid">
            {csapatok.map((csapat) => (
              <div className="col-3">
                <LiveStopper
                  key={csapat.id}
                  teamName={csapat.name}
                  teamId={csapat.id}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
