import { Menubar } from "primereact/menubar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAdmin } from "../auth/auth";
import "./AppLayout.css";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [admin, setIsAdmin] = useState<boolean>(false);

useEffect(() => {
    function refreshAdminState() {
      setIsAdmin(isAdmin());
    }

    refreshAdminState();

    window.addEventListener("storage", refreshAdminState);
    window.addEventListener("focus", refreshAdminState);
    window.addEventListener("adminChanged", refreshAdminState);

    return () => {
      window.removeEventListener("storage", refreshAdminState);
      window.removeEventListener("focus", refreshAdminState);
      window.removeEventListener("adminChanged", refreshAdminState);
    };
  }, []);

  
  const baseItems = [
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
  ];

  const adminItems = [
    ...baseItems,
    {
      label: "Admin Vagy :)",
      icon: "pi pi-android",
      command: () => navigate("/admin"),
      className: location.pathname.startsWith("/admin")
        ? "app-menu-active"
        : "",
    },
  ];

  const guestItems = [
    ...baseItems,
    {
      label: "Bejelentkezés",
      icon: "pi pi-sign-in",
      command: () => navigate("/login"),
      className: location.pathname.startsWith("/login")
        ? "app-menu-active"
        : "",
    },
  ];

  const items = admin ? adminItems : guestItems;

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
        <Menubar model={items} start={start} className="app-menubar" />
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}