import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

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
        

      </Routes>
    </Router>
  );
};

export default App;
