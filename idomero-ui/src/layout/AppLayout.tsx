// layout/AppLayout.tsx
import { Menubar } from "primereact/menubar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const items = [
    { label: "Home", icon: "pi pi-home", url: "/" },
    { label: "Mezőny", icon: "pi pi-server", url: "/mezony" },
    { label: "Admin", icon: "pi pi-wrench", url: "/admin" },
  ];

  return (
    <>
      <Menubar model={items} />
      <Outlet />
    </>
  );
}
