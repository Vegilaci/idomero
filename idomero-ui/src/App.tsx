import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "./layout/AppLayout";
import { ProgressSpinner } from "primereact/progressspinner";
import Admin from "./components/Admin";
import Login from "./auth/Login";

// lazy page importok
const Home = lazy(() => import("./Home"));
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
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
