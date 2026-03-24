import React from "react";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Bienvenue sur le Dashboard</h1>
      </div>
    </div>
  );
};

export default Dashboard;