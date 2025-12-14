import LiveStopper from "./components/LiveStopper";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <LiveStopper teamId={1} />
    </div>
  );
}
