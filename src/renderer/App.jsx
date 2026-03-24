import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Pages
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
const App = () => {
  return (
    <Router>
     { /*
      <SignIn/><Routes><Route path="/" element={<SignIn />} /></Routes>
      */
     }
     <Dashboard/>
     <Routes><Route path="/" element={<Dashboard />} /></Routes>
      </Router>
  );
};

export default App;