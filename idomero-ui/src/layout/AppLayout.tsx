import { Menubar } from "primereact/menubar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AppLayout.css";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      label: "Home",
      icon: "pi pi-home",
      command: () => navigate("/"),
      className: location.pathname === "/" ? "app-menu-active" : "",
    },
    {
      label: "Mezőny",
      icon: "pi pi-users",
      command: () => navigate("/mezony"),
      className: location.pathname.startsWith("/mezony")
        ? "app-menu-active"
        : "",
    },
    {
      label: "Admin",
      icon: "pi pi-cog",
      command: () => navigate("/admin"),
      className: location.pathname.startsWith("/admin")
        ? "app-menu-active"
        : "",
    },
  ];

  return (
    <div className="app-layout">
      <header className="app-header">
        <Menubar model={items} className="app-menubar" />
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
