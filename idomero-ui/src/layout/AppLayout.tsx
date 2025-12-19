// layout/AppLayout.tsx
import { Menubar } from "primereact/menubar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const items = [
    { label: "Home", icon: "pi pi-home", url: "/" },
    { label: "Csapatok", icon: "pi pi-server", url: "/csapatok" },
  ];

  return (
    <>
      <Menubar model={items} />
      <Outlet />
    </>
  );
}
