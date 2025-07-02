import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Bca from "./pages/Bca";
import Bsc from "./pages/Bsc";
import Mtech from "./pages/Mtech";

const App = () => {
  // const { user } = useContext(AuthContext) || {};
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
        <Route path="/btech" element={<Btech />} />
        <Route path="/bca" element={<Bca />} />
        <Route path="/bsc" element={<Bsc />} />
        <Route path="/mtech" element={<Mtech />} />
      </Routes>
    </Router>
  );
};

export default App;
