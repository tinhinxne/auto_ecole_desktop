import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Pages
import SignIn from './pages/SignIn';
import Payments from './pages/Payments';
const App = () => {
  return (
    <Router>
     { /*
      <SignIn/><Routes><Route path="/" element={<SignIn />} /></Routes>
      */
     }
     <Payments/>
     <Routes><Route path="/" element={<Payments />} /></Routes>
      </Router>
  );
};

export default App;