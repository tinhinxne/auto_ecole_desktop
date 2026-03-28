import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Pages
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Condidats from './pages/condidats';
const App = () => {
  return (
    <Router>
     { /*
      <SignIn/><Routes><Route path="/" element={<SignIn />} /></Routes>
      */
     }
     <Condidats />
    
          <Routes><Route path="/" element={<Condidats />} /></Routes>
      </Router>
  );
};

export default App;