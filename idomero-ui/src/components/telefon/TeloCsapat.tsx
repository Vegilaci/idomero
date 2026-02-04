import LiveStopper from "../../components/LiveStopper";
import "../../assets/home.css";
import type { TeamSummary } from "../../types/teams";

interface TeloCsapatProps {
  csapatok: TeamSummary[];
  loading: boolean;
}

export default function TeloCsapat({ csapatok, loading }: TeloCsapatProps) {
  return (
    <>
      {loading ? (
        <div className="flex justify-content-center align-items-center home-loader">
          <span className="loader"></span>
        </div>
      ) : (
        <>
          <div className="grid grid-nogutter">
            {csapatok.map((csapat) => (
              <div key={csapat.id} className="col-12 p-4">
                <LiveStopper teamName={csapat.name} teamId={csapat.id} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
