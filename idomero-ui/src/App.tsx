import LiveStopper from "./components/LiveStopper";
import { Divider } from 'primereact/divider';

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="flex-1 flex items-center justify-center p-4 bg-white rounded shadow">
          <LiveStopper teamId={1} />
        </div>

        <Divider layout="vertical" />

        <div className="flex-1 flex items-center justify-center p-4 bg-white rounded shadow">
          <LiveStopper teamId={2} />
        </div>
      </div>
    </div>
  );
}
