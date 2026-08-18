import LiveStopper from "../LiveStopper";
import "../../assets/home.css";
import type { TeamSummary } from "../../types/teams";

interface TeloCsapatProps {
  csapatok: TeamSummary[];
  loading: boolean;
}

export default function TeloCsapat({
  csapatok,
  loading,
}: TeloCsapatProps) {
  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center home-loader">
        <span className="loader" />
      </div>
    );
  }

  return (
    <div className="mobile-team-list">
      {csapatok.map((csapat) => (
        <div key={csapat.id} className="mobile-team-item">
          <LiveStopper
            teamName={csapat.name}
            teamId={csapat.id}
          />
        </div>
      ))}
    </div>
  );
}