import LiveStopper from "./components/LiveStopper";
import { useEffect,useState } from "react";
import axios from "axios";
import "./assets/home.css"
import type { TeamSummary } from "./types/teams";

export default function Home() {
const [loading,setLoading] = useState(true);
const [csapatok, setCsapatok] = useState<TeamSummary[]>([]);

const url = "http://localhost:8000/teams/summary";

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


return (
  <>
    {loading ? (
      <div className="flex justify-content-center align-items-center home-loader">
        <span className="loader"></span>
      </div>
    ) : (
      <>
        {csapatok.map((csapat) => (
          <LiveStopper key={csapat.id} teamId={csapat.id} />
        ))}
      </>
    )}
  </>
);}
