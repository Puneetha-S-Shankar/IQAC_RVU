import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import NotificationBell from "./components/NotificationBell";
import { AuthContext } from "./context/AuthContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Policy from './pages/Policy';
import Template from './pages/Template';
import CurriculumDev from "./pages/CurriculumDev";
import ProgramPage from "./pages/ProgramPage";
import TeachingAndLearning from "./pages/TeachingAndLearning";
import Roles from "./pages/Roles";

const aboutTexts = {
  BTECH: "About BTech program...",
  BCA: "About BCA program...",
  BSC: "About BSC program...",
  MTECH: "About MTech program..."
};

const App = () => {
  const { user } = useContext(AuthContext);
  const isAuthenticated = !!user;
  
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/template" element={<Template />} />
        <Route path="/curriculum" element={<CurriculumDev />} />
        <Route path="/program" element={<ProgramPage aboutTexts={aboutTexts} />} />
        <Route path="/teaching-and-learning" element={<TeachingAndLearning />} />
        <Route path="/roles" element={<Roles />} />
      </Routes>
      {/* Notification Bell - only show for authenticated users */}
      {isAuthenticated && <NotificationBell />}
    </Router>
  );
};

export default App;
