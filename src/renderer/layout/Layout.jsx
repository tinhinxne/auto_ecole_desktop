import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SidebarMoniteur";
import SidebarMoniteur from "../components/SidebarMoniteur";

export default function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}