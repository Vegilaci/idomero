import { Menubar } from "primereact/menubar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./AppLayout.css";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin,setIsAdmin] = useState<Boolean>(false);

  try {
    const admin = localStorage.getItem("admin");
    if (admin) {
      setIsAdmin(true);
    }
  } catch (error) {
    console.error("Error accessing localStorage:", error);
  }

  const ifadminitems = [
    {
      label: "Áttekintés",
      icon: "pi pi-home",
      command: () => navigate("/"),
      className: location.pathname === "/" ? "app-menu-active" : "",
    },
    {
      label: "Csapatok",
      icon: "pi pi-users",
      command: () => navigate("/mezony"),
      className: location.pathname.startsWith("/mezony")
        ? "app-menu-active"
        : "",
    },
    {
      label: "Beállítások",
      icon: "pi pi-cog",
      command: () => navigate("/admin"),
      className: location.pathname.startsWith("/admin")
        ? "app-menu-active"
        : "",
    },
  ];

  const items = isAdmin ? ifadminitems : 
    [{
      label: "Áttekintés",
      icon: "pi pi-home",
      command: () => navigate("/"),
      className: location.pathname === "/" ? "app-menu-active" : "",
    },
    {
      label: "Csapatok",
      icon: "pi pi-users",
      command: () => navigate("/mezony"),
      className: location.pathname.startsWith("/mezony")
        ? "app-menu-active"
        : "",
    },
    {
      label: "Bejelentkezés",
      icon: "pi pi-sign-in",
      command: () => navigate("/login"),
    }

  
  ];

  const start = (
    <div className="app-brand">
      <div className="app-brand-icon">
        <i className="pi pi-stopwatch" />
      </div>

      <div className="app-brand-text">
        <span className="app-brand-title">Kerékpáros időmérés</span>
        <span className="app-brand-subtitle">Race Control</span>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <header className="app-header">
        <Menubar
          model={items}
          start={start}
          className="app-menubar"
        />
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}