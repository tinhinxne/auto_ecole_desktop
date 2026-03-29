// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// // Pages
// import SignIn from './pages/SignIn';
// import Dashboard from './pages/Dashboard';
// const App = () => {
//   return (
//     <Router>
//      { /*
//       <SignIn/><Routes><Route path="/" element={<SignIn />} /></Routes>
//       */
//      }
//      <Dashboard/>
//      <Routes><Route path="/" element={<Dashboard />} /></Routes>
//       </Router>
//   );
// };

// export default App;



// App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import AgendaPage from "./pages/Agenda";

import Layout from "./layout/Layout";
import Examens from "./pages/Examens";

const App = () => {
  return (
    <Router>
      <Routes>

        {/* LOGIN (sans layout) */}
        <Route path="/" element={<SignIn />} />

        {/* ROUTES AVEC SIDEBAR */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agenda" element={<AgendaPage />} />
        </Route>

        {/* <Route path="/" element={<SignIn />} /> */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/examens" element={<Examens />} /> */}
         {/* <Route path="/" element={<Examens />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
