import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "./layout/AppLayout";
import { ProgressSpinner } from "primereact/progressspinner";

// lazy page importok
const Home = lazy(() => import("./Home"));
const Csapatok = lazy(() => import("./components/Csapatok"));
const Mezony = lazy(() => import("./components/Mezony"));

const Loader = () => (
  <div className="flex justify-content-center align-items-center h-screen">
    <ProgressSpinner />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/mezony" element={<Mezony />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
