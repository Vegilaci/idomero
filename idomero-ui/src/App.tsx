import LiveStopper from "./components/LiveStopper";

export default function App() {
  return (
    <div className="flex align-items-center justify-content-center min-h-screen">
      <div className="grid">
        <div className="col-12 md:col-6">
          <div className="surface-card p-4 border-round shadow-2 text-center">
            <h2 className="mb-3">Csapat #1</h2>
            <LiveStopper teamId={1} />
          </div>
        </div>

        <div className="col-12 md:col-6">
          <div className="surface-card p-4 border-round shadow-2 text-center">
            <h2 className="mb-3">Csapat #2</h2>
            <LiveStopper teamId={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
