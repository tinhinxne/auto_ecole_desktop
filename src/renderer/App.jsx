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
import Access from "./pages/Access";
import Dashboard from "./pages/Dashboard";
import AgendaPage from "./pages/Agenda";
import Payments from "./pages/Payments";
import Layout from "./layout/Layout";
import Examens from "./pages/Examens";
import Condidats from "./pages/condidats";
import Moniteur from "./pages/Moniteur";

const App = () => {
  return (
   <Router>
  <Routes>
    <Route path="/" element={<Examens />} />

    <Route element={<Layout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/candidats" element={<Condidats />} />
      <Route path="/moniteur" element={<Moniteur />} />
      <Route path="/agenda" element={<AgendaPage />} />
      <Route path="/examens" element={<Examens />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/settings" element={<Settings />} />
    </Route>
  </Routes>
</Router>
  );
};

export default App;
