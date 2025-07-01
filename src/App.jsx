import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthContext } from "./context/AuthContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Policy from './pages/Policy';
import Template from './pages/Template';
import CurriculumDev from "./pages/CurriculumDev";
import Btech from "./pages/Btech";

const App = () => {
  const { user } = useContext(AuthContext) || {};
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/about" element={<About />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/template" element={user && user.role === "admin" ? <Template /> : <Navigate to="/login" />} />
        <Route path="/curriculum" element={<CurriculumDev />} />
        <Route path="/btech" element={<Btech />} />
      </Routes>
    </Router>
  );
};

export default App;
