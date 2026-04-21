import LiveStopper from "./components/LiveStopper";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./assets/home.css";
import { getTeamSummary } from "./api/teams";
import type { TeamSummary } from "./types/teams";
import TeloCsapat from "./components/telefon/TeloCsapat";
import { useIsMobile } from "./hooks/useIsMobile";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [csapatok, setCsapatok] = useState<TeamSummary[]>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
          {isMobile ? (
            <TeloCsapat csapatok={csapatok} loading={loading} />
          ) : (
            <div className="home-grid grid grid-nogutter">
              {csapatok.map((csapat) => (
                <div className="col-12 md:col-6 home-team-card" key={csapat.id}>
                  <LiveStopper teamName={csapat.name} teamId={csapat.id} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
